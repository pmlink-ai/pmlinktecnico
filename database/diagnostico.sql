-- Script de diagnóstico para verificar el estado de la base de datos
-- Ejecutar para entender qué está funcionando y qué no

-- 1. Verificar que las tablas existen
SELECT 'VERIFICANDO TABLAS...' as status;

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('rol', 'empresa', 'local', 'usuario', 'tiposmantenimiento', 'equipos')
ORDER BY tablename;

-- 2. Verificar roles
SELECT 'VERIFICANDO ROLES...' as status;

SELECT COUNT(*) as total_roles FROM rol;
SELECT nombre_rol, activo FROM rol ORDER BY nombre_rol;

-- 3. Verificar si hay usuarios en auth.users
SELECT 'VERIFICANDO AUTH.USERS...' as status;

SELECT COUNT(*) as total_auth_users FROM auth.users;
SELECT email, email_confirmed_at, created_at FROM auth.users ORDER BY created_at;

-- 4. Verificar si hay usuarios en nuestra tabla
SELECT 'VERIFICANDO TABLA USUARIO...' as status;

SELECT COUNT(*) as total_usuarios FROM usuario;
SELECT nombres, apellidos, email, activo FROM usuario;

-- 5. Verificar triggers y funciones
SELECT 'VERIFICANDO TRIGGERS...' as status;

SELECT 
    event_object_table,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- 6. Verificar funciones
SELECT 'VERIFICANDO FUNCIONES...' as status;

SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- 7. Verificar políticas RLS
SELECT 'VERIFICANDO POLÍTICAS RLS...' as status;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('rol', 'empresa', 'local', 'usuario', 'tiposmantenimiento', 'equipos')
ORDER BY tablename, policyname;

-- 8. Intentar crear un usuario de prueba simple
SELECT 'INTENTANDO CREAR USUARIO DE PRUEBA...' as status;

-- Verificar si el usuario ya existe
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@pmlink.com') 
        THEN 'Usuario YA EXISTE en auth.users'
        ELSE 'Usuario NO existe en auth.users'
    END as auth_status;

SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM usuario WHERE email = 'admin@pmlink.com') 
        THEN 'Usuario YA EXISTE en tabla usuario'
        ELSE 'Usuario NO existe en tabla usuario'
    END as usuario_status;

-- Resultado final del diagnóstico
SELECT 'DIAGNÓSTICO COMPLETO' as resultado;
