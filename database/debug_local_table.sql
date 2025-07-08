-- Script para depurar problemas con la tabla local
-- Ejecutar en Supabase SQL Editor paso a paso

-- 1. Verificar estructura completa de la tabla local
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'local' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints de la tabla local
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'local' AND tc.table_schema = 'public';

-- 3. Verificar si RLS está habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    hasrls
FROM pg_stat_all_tables 
WHERE schemaname = 'public' AND relname = 'local';

-- 4. Verificar políticas RLS existentes
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual
FROM pg_policies 
WHERE tablename = 'local';

-- 5. Contar registros en empresa (tabla relacionada)
SELECT COUNT(*) as total_empresas FROM empresa;
SELECT COUNT(*) as empresas_activas FROM empresa WHERE activo = true;

-- 6. Intentar crear un local de prueba (cambiar valores según tus datos)
-- Primero obtener una empresa activa
SELECT empresa_id, nombre_empresa FROM empresa WHERE activo = true LIMIT 1;

-- 7. Ver todos los locales existentes
SELECT 
    l.local_id,
    l.empresa_id,
    l.nombre_local,
    l.activo,
    e.nombre_empresa
FROM local l
LEFT JOIN empresa e ON l.empresa_id = e.empresa_id
ORDER BY l.fecha_creacion DESC;

-- 8. Deshabilitar RLS temporalmente si está causando problemas
-- ALTER TABLE local DISABLE ROW LEVEL SECURITY;

-- 9. Verificar que el UUID se genere automáticamente
-- SELECT gen_random_uuid() as test_uuid;
