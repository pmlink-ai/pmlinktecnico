-- Script para verificar y corregir tabla local
-- Ejecutar en Supabase SQL Editor

-- Verificar estructura de la tabla local
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'local'
ORDER BY ordinal_position;

-- Verificar si RLS está habilitado en la tabla local
SELECT schemaname, tablename, rowsecurity, relowner
FROM pg_tables 
JOIN pg_class ON pg_tables.tablename = pg_class.relname
WHERE tablename = 'local';

-- Verificar políticas de la tabla local
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'local';

-- Si hay problemas con RLS, deshabilitarlo temporalmente
ALTER TABLE local DISABLE ROW LEVEL SECURITY;

-- Verificar que la tabla tenga el UUID por defecto
-- Si no lo tiene, agregarlo:
-- ALTER TABLE local ALTER COLUMN local_id SET DEFAULT gen_random_uuid();

-- Verificar que existe la tabla empresa (requerida para foreign key)
SELECT COUNT(*) as empresa_count FROM empresa;

-- Mensaje de verificación
SELECT 'Verificación de tabla local completada' as resultado;
