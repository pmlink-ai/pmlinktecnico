-- Script para solucionar error de recursión infinita en políticas RLS
-- Ejecutar en Supabase SQL Editor

-- Opción 1: Deshabilitar RLS temporalmente en tabla usuario
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;

-- Opción 2: Eliminar todas las políticas existentes de la tabla usuario
DROP POLICY IF EXISTS "Enable read access for all users" ON usuario;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuario;
DROP POLICY IF EXISTS "Enable update for users based on email" ON usuario;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON usuario;
DROP POLICY IF EXISTS "Users can view own data" ON usuario;
DROP POLICY IF EXISTS "Users can update own data" ON usuario;

-- Verificar que no queden políticas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'usuario';

-- Mensaje de confirmación
SELECT 'RLS deshabilitado y políticas eliminadas para tabla usuario' as resultado;
