-- Script súper simple para crear usuario administrador
-- Usar SOLO si los otros métodos fallan

-- IMPORTANTE: Crear el usuario PRIMERO desde el Dashboard de Supabase
-- 1. Ve a Authentication > Users
-- 2. Clic en "Add user" 
-- 3. Email: admin@pmlink.com
-- 4. Password: admin123456
-- 5. Auto Confirm User: ✓

-- Después de crear el usuario en el dashboard, ejecutar este script:

-- Verificar que el usuario existe en auth.users
SELECT 'Usuario en auth.users:' as info, email, id, email_confirmed_at
FROM auth.users 
WHERE email = 'admin@pmlink.com';

-- Verificar que los roles existen
SELECT 'Roles disponibles:' as info, nombre_rol, rol_id
FROM rol;

-- Crear el registro en nuestra tabla usuario
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
    
    -- Verificar que encontramos ambos
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el usuario admin@pmlink.com en auth.users. Créalo primero desde el Dashboard.';
    END IF;
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el rol Administrador PM-Link. Ejecuta setup_simple.sql primero.';
    END IF;
    
    -- Insertar o actualizar en la tabla usuario
    INSERT INTO usuario (usuario_id, rol_id, nombres, apellidos, email, activo)
    VALUES (auth_user_id, admin_role_id, 'Administrador', 'PM-Link', 'admin@pmlink.com', true)
    ON CONFLICT (usuario_id) DO UPDATE SET
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        rol_id = EXCLUDED.rol_id,
        activo = EXCLUDED.activo;
    
    RAISE NOTICE 'Usuario sincronizado correctamente';
END $$;

-- Verificación final
SELECT 
    'RESULTADO FINAL:' as info,
    u.email,
    usr.nombres,
    usr.apellidos,
    r.nombre_rol,
    usr.activo,
    CASE 
        WHEN usr.usuario_id IS NOT NULL THEN '✅ LISTO PARA LOGIN'
        ELSE '❌ ERROR'
    END as estado
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email = 'admin@pmlink.com';

-- Instrucciones finales
SELECT 'CREDENCIALES:' as info, 'admin@pmlink.com' as email, 'admin123456' as password;
