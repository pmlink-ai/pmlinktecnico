-- Script para crear usuario alternativo de prueba
-- Email: admin2@pmlink.com
-- Password: admin123456

-- Paso 1: Verificar estado actual
SELECT 'VERIFICACIÓN INICIAL' as status;

-- Verificar que las tablas existen y tienen datos
SELECT 'Roles disponibles:' as info, COUNT(*) as total FROM rol;
SELECT nombre_rol, rol_id FROM rol WHERE nombre_rol = 'Administrador PM-Link';

-- Verificar usuarios existentes
SELECT 'Usuarios en auth.users:' as info, COUNT(*) as total FROM auth.users;
SELECT 'Usuarios en tabla usuario:' as info, COUNT(*) as total FROM usuario;

-- Paso 2: Crear usuario admin2 directamente en auth.users (método directo)
SELECT 'CREANDO USUARIO ADMIN2...' as status;

DO $$
DECLARE
    new_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Generar nuevo UUID
    new_user_id := gen_random_uuid();
    
    -- Verificar si el usuario ya existe
    IF EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin2@pmlink.com') THEN
        RAISE NOTICE 'Usuario admin2@pmlink.com ya existe';
        RETURN;
    END IF;
    
    -- Obtener rol de administrador
    SELECT rol_id INTO admin_role_id FROM rol WHERE nombre_rol = 'Administrador PM-Link' LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol de Administrador PM-Link';
    END IF;
    
    -- Crear usuario en auth.users
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
        'admin2@pmlink.com',
        crypt('admin123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"nombres": "Admin2", "apellidos": "PM-Link"}'
    );
    
    -- Crear usuario en nuestra tabla usuario
    INSERT INTO usuario (usuario_id, rol_id, nombres, apellidos, email, activo)
    VALUES (new_user_id, admin_role_id, 'Admin2', 'PM-Link', 'admin2@pmlink.com', true);
    
    RAISE NOTICE 'Usuario admin2@pmlink.com creado exitosamente con ID: %', new_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creando usuario admin2: %', SQLERRM;
END $$;

-- Paso 3: Verificación del usuario creado
SELECT 'VERIFICACIÓN DEL USUARIO ADMIN2' as status;

SELECT 
    'Usuario en auth.users:' as tabla,
    email,
    id,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'admin2@pmlink.com';

SELECT 
    'Usuario en tabla usuario:' as tabla,
    nombres,
    apellidos,
    email,
    activo
FROM usuario 
WHERE email = 'admin2@pmlink.com';

-- Paso 4: Verificación completa con JOIN
SELECT 'RESULTADO FINAL ADMIN2:' as status;

SELECT 
    u.email as "Email",
    u.email_confirmed_at as "Confirmado",
    usr.nombres as "Nombres",
    usr.apellidos as "Apellidos",
    r.nombre_rol as "Rol",
    usr.activo as "Activo",
    CASE 
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NOT NULL THEN '✅ COMPLETO - LISTO PARA LOGIN'
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NULL THEN '⚠️ Solo en auth.users'
        ELSE '❌ ERROR'
    END as "Estado"
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email = 'admin2@pmlink.com';

-- Paso 5: También verificar el usuario original para comparar
SELECT 'COMPARACIÓN CON ADMIN ORIGINAL:' as status;

SELECT 
    u.email as "Email",
    usr.nombres as "Nombres",
    r.nombre_rol as "Rol",
    CASE 
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NOT NULL THEN '✅ OK'
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NULL THEN '⚠️ Incompleto'
        ELSE '❌ Error'
    END as "Estado"
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email IN ('admin@pmlink.com', 'admin2@pmlink.com')
ORDER BY u.email;

-- Credenciales finales
SELECT 'CREDENCIALES ADMIN2:' as info, 'admin2@pmlink.com' as email, 'admin123456' as password;
SELECT 'URL de prueba:' as info, 'http://localhost:3004/pmlinkadmin/' as url;
