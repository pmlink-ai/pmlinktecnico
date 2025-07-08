-- Script manual para crear usuario administrador
-- Ejecutar DESPUÉS de setup_simple.sql

-- Paso 1: Verificar que las tablas existen
SELECT 'Verificando tablas...' as status;

SELECT 
    'Tabla rol:' as tabla,
    COUNT(*) as registros
FROM rol;

-- Paso 2: Crear usuario directamente en auth.users
SELECT 'Creando usuario...' as status;

-- Insertar usuario directamente en auth.users
DO $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Generar nuevo UUID para el usuario
    new_user_id := gen_random_uuid();
    
    -- Insertar en auth.users
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'admin@pmlink.com',
        crypt('admin123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nombres": "Administrador", "apellidos": "PM-Link"}'
    );
    
    RAISE NOTICE 'Usuario creado con ID: %', new_user_id;
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Usuario ya existe en auth.users';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creando usuario: %', SQLERRM;
END $$;

-- Paso 3: Confirmar email automáticamente
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    email_change_confirm_status = 0
WHERE email = 'admin@pmlink.com' 
AND email_confirmed_at IS NULL;

-- Paso 4: Verificar que el trigger funcionó
SELECT 'Verificando creación...' as status;

SELECT 
    u.id as auth_id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    usr.nombres,
    usr.apellidos,
    r.nombre_rol,
    usr.activo
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email = 'admin@pmlink.com';

-- Paso 5: Si el usuario no aparece en la tabla usuario, crearlo manualmente
DO $$
DECLARE
    auth_user_id UUID;
    admin_role_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Verificar si el usuario ya existe en nuestra tabla
    SELECT EXISTS(
        SELECT 1 FROM usuario WHERE email = 'admin@pmlink.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Obtener el ID del usuario desde auth.users
        SELECT id INTO auth_user_id 
        FROM auth.users 
        WHERE email = 'admin@pmlink.com' 
        LIMIT 1;
        
        -- Obtener el ID del rol de administrador
        SELECT rol_id INTO admin_role_id 
        FROM rol 
        WHERE nombre_rol = 'Administrador PM-Link' 
        LIMIT 1;
        
        -- Verificar si encontramos ambos IDs
        IF auth_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
            -- Insertar en la tabla usuario
            INSERT INTO usuario (usuario_id, rol_id, nombres, apellidos, email, activo)
            VALUES (auth_user_id, admin_role_id, 'Administrador', 'PM-Link', 'admin@pmlink.com', true);
            
            RAISE NOTICE 'Usuario creado manualmente en tabla usuario';
        ELSE
            RAISE NOTICE 'Error: No se encontró el usuario en auth.users o el rol de administrador';
        END IF;
    ELSE
        RAISE NOTICE 'Usuario ya existe en tabla usuario';
    END IF;
END $$;

-- Paso 6: Verificación final
SELECT 'VERIFICACIÓN FINAL' as status;

SELECT 
    u.email as "Email",
    u.email_confirmed_at as "Email Confirmado",
    usr.nombres as "Nombres",
    usr.apellidos as "Apellidos", 
    r.nombre_rol as "Rol",
    usr.activo as "Activo",
    CASE 
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NOT NULL THEN '✅ COMPLETO'
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NULL THEN '⚠️ Solo en auth.users'
        ELSE '❌ ERROR'
    END as "Estado"
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email = 'admin@pmlink.com';

SELECT 'Usuario listo para login: admin@pmlink.com / admin123456' as resultado;
