-- Script para crear/corregir la tabla local si es necesario
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla local existe y tiene la estructura correcta
DO $$
BEGIN
    -- Crear la tabla local si no existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'local' AND table_schema = 'public') THEN
        CREATE TABLE local (
            local_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            empresa_id UUID NOT NULL REFERENCES empresa(empresa_id),
            nombre_local VARCHAR(255) NOT NULL,
            direccion TEXT,
            ciudad VARCHAR(100),
            pais VARCHAR(100),
            telefono_contacto VARCHAR(20),
            email_contacto VARCHAR(255),
            fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            activo BOOLEAN NOT NULL DEFAULT true
        );
        
        RAISE NOTICE 'Tabla local creada exitosamente';
    ELSE
        RAISE NOTICE 'Tabla local ya existe';
    END IF;
END $$;

-- Deshabilitar RLS temporalmente para depuración
ALTER TABLE local DISABLE ROW LEVEL SECURITY;

-- Verificar que la tabla empresa tenga registros
SELECT 'Total empresas: ' || COUNT(*)::text || ', Activas: ' || COUNT(CASE WHEN activo THEN 1 END)::text as empresas_info
FROM empresa;

-- Mostrar estructura actual de la tabla local
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'local' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Probar inserción de un local de prueba (usar empresa_id real de tu base de datos)
-- Primero obtener una empresa existente
SELECT empresa_id, nombre_empresa 
FROM empresa 
WHERE activo = true 
LIMIT 1;

-- Insertar local de prueba (CAMBIAR el empresa_id por uno real)
-- INSERT INTO local (empresa_id, nombre_local, direccion, ciudad, pais, activo)
-- VALUES (
--     'TU_EMPRESA_ID_AQUÍ', 
--     'Local de Prueba', 
--     'Dirección de prueba 123', 
--     'Ciudad Prueba', 
--     'País Prueba', 
--     true
-- );

SELECT 'Script de verificación de tabla local completado' as resultado;
