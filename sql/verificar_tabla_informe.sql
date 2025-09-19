-- Script para verificar y recrear la tabla informe_limpieza_ductos si es necesario
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- Verificar si la tabla existe
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'informe_limpieza_ductos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Si la tabla no existe o está vacía, crearla
CREATE TABLE IF NOT EXISTS informe_limpieza_ductos (
    id SERIAL PRIMARY KEY,
    orden_trabajo_id UUID REFERENCES orden_trabajo(id),
    
    -- Campos específicos del formulario de limpieza de ductos
    tipo_ducto VARCHAR(100),
    ubicacion_ducto VARCHAR(200),
    estado_inicial VARCHAR(100),
    metodo_limpieza VARCHAR(100),
    productos_utilizados TEXT,
    tiempo_limpieza INTEGER, -- en minutos
    estado_final VARCHAR(100),
    observaciones TEXT,
    temperatura_ambiente DECIMAL(5,2),
    humedad_relativa DECIMAL(5,2),
    
    -- Campos de verificación
    prueba_funcionamiento BOOLEAN DEFAULT false,
    certificado_limpieza BOOLEAN DEFAULT false,
    
    -- Campos del técnico
    tecnico_responsable VARCHAR(100),
    supervisor_aprobacion VARCHAR(100),
    
    -- Campos de auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_informe_orden_trabajo 
ON informe_limpieza_ductos(orden_trabajo_id);

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'informe_limpieza_ductos' 
AND table_schema = 'public'
ORDER BY ordinal_position;