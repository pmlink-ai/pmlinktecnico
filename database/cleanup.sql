-- Script para limpiar y recrear la base de datos desde cero
-- Ejecutar SOLO si hay problemas y quieres empezar de nuevo

-- 1. Eliminar trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own data" ON usuario;
DROP POLICY IF EXISTS "Admins can view all users" ON usuario;
DROP POLICY IF EXISTS "Allow insert for trigger" ON usuario;
DROP POLICY IF EXISTS "Users can view empresas" ON empresa;
DROP POLICY IF EXISTS "Users can view locales" ON local;
DROP POLICY IF EXISTS "Users can view roles" ON rol;
DROP POLICY IF EXISTS "Users can view tipos mantenimiento" ON TiposMantenimiento;
DROP POLICY IF EXISTS "Users can view equipos" ON equipos;

-- 3. Deshabilitar RLS temporalmente
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
ALTER TABLE empresa DISABLE ROW LEVEL SECURITY;
ALTER TABLE local DISABLE ROW LEVEL SECURITY;
ALTER TABLE rol DISABLE ROW LEVEL SECURITY;
ALTER TABLE TiposMantenimiento DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipos DISABLE ROW LEVEL SECURITY;

-- 4. Eliminar datos existentes (CUIDADO: esto borra todo)
TRUNCATE TABLE equipos CASCADE;
TRUNCATE TABLE usuario CASCADE;
TRUNCATE TABLE local CASCADE;
TRUNCATE TABLE empresa CASCADE;
TRUNCATE TABLE TiposMantenimiento CASCADE;
TRUNCATE TABLE rol CASCADE;

-- 5. Eliminar tablas
DROP TABLE IF EXISTS equipos CASCADE;
DROP TABLE IF EXISTS usuario CASCADE;
DROP TABLE IF EXISTS local CASCADE;
DROP TABLE IF EXISTS TiposMantenimiento CASCADE;
DROP TABLE IF EXISTS empresa CASCADE;
DROP TABLE IF EXISTS rol CASCADE;

-- 6. Eliminar usuarios de prueba de auth.users
DELETE FROM auth.users WHERE email = 'admin@pmlink.com';

-- Mensaje de confirmación
SELECT 'Base de datos limpiada. Ahora ejecuta setup_simple.sql' as status;
