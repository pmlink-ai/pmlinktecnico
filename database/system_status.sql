-- Script de resumen: Estado actual del sistema PMLink Admin
-- Ejecutar para verificar que todo esté funcionando correctamente

-- 1. Verificar estructura de tabla empresa
SELECT 'TABLA EMPRESA:' as seccion;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresa' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT COUNT(*) as total_empresas, COUNT(CASE WHEN activo THEN 1 END) as empresas_activas
FROM empresa;

-- 2. Verificar estructura de tabla local
SELECT 'TABLA LOCAL:' as seccion;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'local' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT COUNT(*) as total_locales, COUNT(CASE WHEN activo THEN 1 END) as locales_activos
FROM local;

-- 3. Verificar estructura de tabla usuario
SELECT 'TABLA USUARIO:' as seccion;
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'usuario' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT COUNT(*) as total_usuarios, COUNT(CASE WHEN activo THEN 1 END) as usuarios_activos
FROM usuario;

-- 4. Verificar relaciones (Foreign Keys)
SELECT 'FOREIGN KEYS:' as seccion;
SELECT 
    tc.constraint_name, 
    tc.table_name,
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
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('local', 'usuario', 'equipo');

-- 5. Verificar datos de prueba
SELECT 'DATOS DE PRUEBA:' as seccion;

-- Empresas con sus locales
SELECT 
    e.nombre_empresa,
    COUNT(l.local_id) as cantidad_locales
FROM empresa e
LEFT JOIN local l ON e.empresa_id = l.empresa_id
WHERE e.activo = true
GROUP BY e.empresa_id, e.nombre_empresa
ORDER BY e.nombre_empresa;

-- Usuarios activos
SELECT 
    u.nombres || ' ' || u.apellidos as usuario,
    u.email,
    r.nombre_rol
FROM usuario u
LEFT JOIN rol r ON u.rol_id = r.rol_id
WHERE u.activo = true;

SELECT 'VERIFICACIÓN COMPLETADA - SISTEMA LISTO' as resultado;
