-- Script de verificación para comprobar si admin2 se creó correctamente
-- Ejecutar para ver el estado actual

-- 1. Verificar todos los usuarios en auth.users
SELECT 'USUARIOS EN AUTH.USERS:' as seccion;
SELECT 
    email,
    id,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at;

-- 2. Verificar todos los usuarios en nuestra tabla usuario
SELECT 'USUARIOS EN TABLA USUARIO:' as seccion;
SELECT 
    nombres,
    apellidos,
    email,
    activo,
    fecha_creacion
FROM usuario 
ORDER BY fecha_creacion;

-- 3. Verificación específica de admin2
SELECT 'VERIFICACIÓN ESPECÍFICA DE ADMIN2:' as seccion;

-- ¿Existe admin2 en auth.users?
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin2@pmlink.com') 
        THEN '✅ admin2 EXISTS en auth.users'
        ELSE '❌ admin2 NO EXISTE en auth.users'
    END as auth_status;

-- ¿Existe admin2 en tabla usuario?
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM usuario WHERE email = 'admin2@pmlink.com') 
        THEN '✅ admin2 EXISTS en tabla usuario'
        ELSE '❌ admin2 NO EXISTE en tabla usuario'
    END as usuario_status;

-- 4. Vista completa con JOIN - TODOS los usuarios
SELECT 'VISTA COMPLETA DE TODOS LOS USUARIOS:' as seccion;

SELECT 
    COALESCE(u.email, usr.email) as email,
    u.id as auth_id,
    usr.usuario_id,
    usr.nombres,
    usr.apellidos,
    r.nombre_rol,
    usr.activo,
    CASE 
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NOT NULL THEN '✅ COMPLETO'
        WHEN u.id IS NOT NULL AND usr.usuario_id IS NULL THEN '⚠️ Solo en auth.users'
        WHEN u.id IS NULL AND usr.usuario_id IS NOT NULL THEN '⚠️ Solo en tabla usuario'
        ELSE '❌ ERROR'
    END as estado_sincronizacion
FROM auth.users u
FULL OUTER JOIN usuario usr ON u.id = usr.usuario_id
LEFT JOIN rol r ON usr.rol_id = r.rol_id
ORDER BY COALESCE(u.email, usr.email);

-- 5. Contar registros específicos
SELECT 'CONTEO DE REGISTROS:' as seccion;

SELECT 
    'auth.users' as tabla,
    COUNT(*) as total_registros
FROM auth.users
UNION ALL
SELECT 
    'usuario' as tabla,
    COUNT(*) as total_registros
FROM usuario
UNION ALL
SELECT 
    'rol' as tabla,
    COUNT(*) as total_registros
FROM rol;

-- 6. Verificación de emails específicos
SELECT 'VERIFICACIÓN DE EMAILS ESPECÍFICOS:' as seccion;

SELECT 
    'admin@pmlink.com' as email_buscado,
    EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@pmlink.com') as en_auth_users,
    EXISTS(SELECT 1 FROM usuario WHERE email = 'admin@pmlink.com') as en_tabla_usuario
UNION ALL
SELECT 
    'admin2@pmlink.com' as email_buscado,
    EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin2@pmlink.com') as en_auth_users,
    EXISTS(SELECT 1 FROM usuario WHERE email = 'admin2@pmlink.com') as en_tabla_usuario;

-- 7. Mensaje final de interpretación
SELECT 'INTERPRETACIÓN:' as seccion;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM usuario WHERE email = 'admin2@pmlink.com') > 0 
        THEN '✅ admin2 se creó correctamente. Total usuarios en tabla usuario: ' || (SELECT COUNT(*) FROM usuario)::text
        ELSE '❌ admin2 NO se creó. Revisa los errores anteriores.'
    END as resultado_final;
