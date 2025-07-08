-- Script para crear la tabla local desde cero con la estructura correcta
-- Solo ejecutar si la tabla no existe o si hay problemas graves

-- Eliminar tabla existente si hay problemas (CUIDADO: esto borra todos los datos)
-- DROP TABLE IF EXISTS local;

-- Crear tabla local con estructura correcta
CREATE TABLE IF NOT EXISTS local (
    local_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresa(empresa_id) ON DELETE CASCADE,
    nombre_local VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    ciudad VARCHAR(100),
    telefono VARCHAR(50),
    email VARCHAR(255),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_local_empresa_id ON local(empresa_id);
CREATE INDEX IF NOT EXISTS idx_local_activo ON local(activo);
CREATE INDEX IF NOT EXISTS idx_local_nombre ON local(nombre_local);

-- Deshabilitar RLS temporalmente para desarrollo
ALTER TABLE local DISABLE ROW LEVEL SECURITY;

-- Verificar la estructura creada
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'local' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar foreign key constraint
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

SELECT 'Tabla local creada exitosamente' as resultado;
