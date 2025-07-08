-- Script alternativo para crear admin2 usando Dashboard
-- Método más seguro y confiable

-- PASO 1: Crear usuario desde Dashboard de Supabase
-- 1. Ve a Authentication > Users
-- 2. Clic en "Add user"
-- 3. Email: admin2@pmlink.com
-- 4. Password: admin123456
-- 5. Auto Confirm User: ✓

-- PASO 2: Después de crear en Dashboard, ejecutar este script:

-- Verificar que el usuario existe en auth.users
SELECT 'Verificando usuario admin2 en auth.users...' as status;
SELECT email, id, email_confirmed_at FROM auth.users WHERE email = 'admin2@pmlink.com';

-- Verificar roles disponibles
SELECT 'Verificando roles...' as status;
SELECT nombre_rol, rol_id FROM rol ORDER BY nombre_rol;

-- Sincronizar con nuestra tabla usuario
DO $$
DECLARE
    auth_user_id UUID;
    admin_role_id UUID;
BEGIN
    -- Obtener ID del usuario
    SELECT id INTO auth_user_id FROM auth.users WHERE email = 'admin2@pmlink.com' LIMIT 1;
    
    -- Obtener ID del rol
    SELECT rol_id INTO admin_role_id FROM rol WHERE nombre_rol = 'Administrador PM-Link' LIMIT 1;
    
    -- Verificar que ambos existen
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario admin2@pmlink.com no encontrado en auth.users. Créalo desde el Dashboard primero.';
    END IF;
    
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Rol Administrador PM-Link no encontrado. Ejecuta setup_simple.sql primero.';
    END IF;
    
    -- Insertar en tabla usuario
    INSERT INTO usuario (usuario_id, rol_id, nombres, apellidos, email, activo)
    VALUES (auth_user_id, admin_role_id, 'Admin2', 'PM-Link', 'admin2@pmlink.com', true)
    ON CONFLICT (usuario_id) DO UPDATE SET
        nombres = EXCLUDED.nombres,
        apellidos = EXCLUDED.apellidos,
        email = EXCLUDED.email,
        activo = EXCLUDED.activo;
    
    RAISE NOTICE 'Usuario admin2 sincronizado correctamente';
END $$;

-- Verificación final
SELECT 'RESULTADO FINAL:' as status;

SELECT 
    u.email,
    usr.nombres,
    usr.apellidos,
    r.nombre_rol,
    usr.activo,
    CASE 
        WHEN usr.usuario_id IS NOT NULL THEN '✅ LISTO PARA LOGIN'
        ELSE '❌ ERROR - Falta sincronización'
    END as estado
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
WHERE u.email = 'admin2@pmlink.com';

-- Mostrar todos los usuarios para comparación
SELECT 'TODOS LOS USUARIOS:' as status;
SELECT 
    u.email,
    usr.nombres,
    r.nombre_rol,
    usr.activo
FROM auth.users u
LEFT JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
ORDER BY u.created_at;

SELECT 'CREDENCIALES:' as info, 'admin2@pmlink.com' as email, 'admin123456' as password;
