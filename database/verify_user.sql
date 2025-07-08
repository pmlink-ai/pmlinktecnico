-- Script para verificar y corregir el usuario de prueba
-- Ejecutar en SQL Editor de Supabase

-- 1. Verificar si el usuario existe en auth.users
SELECT 
    'Usuario en auth.users' as tabla,
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'admin@pmlink.com';

-- 2. Verificar si el usuario existe en nuestra tabla usuario
SELECT 
    'Usuario en tabla usuario' as tabla,
    usuario_id,
    email,
    nombres,
    apellidos,
    activo
FROM usuario 
WHERE email = 'admin@pmlink.com';

-- 3. Verificar los roles disponibles
SELECT 
    'Roles disponibles' as tabla,
    rol_id,
    nombre_rol,
    activo
FROM rol;

-- 4. Si el usuario NO existe en la tabla usuario, crearlo manualmente
-- (Solo ejecutar si no aparece en la consulta anterior)

DO $$
DECLARE
    auth_user_id UUID;
    admin_role_id UUID;
BEGIN
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
        -- Insertar en la tabla usuario si no existe
        INSERT INTO usuario (usuario_id, rol_id, nombres, apellidos, email, activo)
        VALUES (auth_user_id, admin_role_id, 'Administrador', 'PM-Link', 'admin@pmlink.com', true)
        ON CONFLICT (usuario_id) DO NOTHING;
        
        RAISE NOTICE 'Usuario sincronizado correctamente';
    ELSE
        RAISE NOTICE 'Error: No se encontró el usuario en auth.users o el rol de administrador';
    END IF;
END $$;

-- 5. Verificación final - Mostrar el usuario completo con su rol
SELECT 
    u.email,
    u.email_confirmed_at,
    usr.nombres,
    usr.apellidos,
    r.nombre_rol,
    usr.activo
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email = 'admin@pmlink.com';
