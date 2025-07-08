-- Script para crear usuario administrador de prueba
-- Ejecutar DESPUÉS del script setup.sql

-- MÉTODO 1: Usando auth.signup (RECOMENDADO)
SELECT auth.signup(
    'admin@pmlink.com',
    'admin123456',
    '{"nombres": "Administrador", "apellidos": "PM-Link"}'::jsonb
);

-- Confirmar el email automáticamente (para testing)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@pmlink.com' AND email_confirmed_at IS NULL;

-- Verificar que el usuario se creó correctamente
SELECT 
    'Verificación del usuario creado' as status,
    u.id as auth_id,
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

-- Si el resultado anterior no muestra datos en la tabla usuario,
-- ejecutar esto para sincronizar manualmente:
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
        ON CONFLICT (usuario_id) DO UPDATE SET
            nombres = EXCLUDED.nombres,
            apellidos = EXCLUDED.apellidos,
            rol_id = EXCLUDED.rol_id;
        
        RAISE NOTICE 'Usuario sincronizado correctamente';
    ELSE
        RAISE NOTICE 'Error: No se encontró el usuario en auth.users o el rol de administrador';
    END IF;
END $$;
