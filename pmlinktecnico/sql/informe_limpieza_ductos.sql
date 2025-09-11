-- TABLA: INFORME DE LIMPIEZA DE DUCTOS
-- Almacena los datos del formulario "INFORME LIMPIEZA DE DUCTOS.pdf"
-- Optimizada para PostgreSQL con Supabase

CREATE TABLE informe_limpieza_ductos (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Diagnóstico del sistema de ductos
    campanas_estado TEXT CHECK (campanas_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'REQUIERE_MANTENIMIENTO', 'NO_APLICA')),
    filtros_estado TEXT CHECK (filtros_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'REQUIERE_CAMBIO', 'NO_APLICA')),
    ductos_estado TEXT CHECK (ductos_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'REQUIERE_LIMPIEZA', 'NO_APLICA')),
    damper_estado TEXT CHECK (damper_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'REQUIERE_MANTENIMIENTO', 'NO_APLICA')),
    drenajes_estado TEXT CHECK (drenajes_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'OBSTRUIDO', 'NO_APLICA')),
    registros_local_estado TEXT CHECK (registros_local_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'REQUIERE_MANTENIMIENTO', 'NO_APLICA')),
    registros_techumbre_estado TEXT CHECK (registros_techumbre_estado IN ('BUEN_ESTADO', 'MAL_ESTADO', 'REQUIERE_MANTENIMIENTO', 'NO_APLICA')),
    
    -- Diagnóstico del motor (almacenado como JSON estructurado)
    datos_motor JSONB DEFAULT '{}',
    /* Estructura esperada del JSON:
    {
        "rejillas_estado": "EN_BUEN_ESTADO",
        "cantidad_motores": 4,
        "fuelle_estado": "EN_BUEN_ESTADO", 
        "correas_estado": "ALGUNAS_EN_MAL_ESTADO",
        "correas_detalle": "07 CORREAS 02 EN MAL ESTADO",
        "rodamientos_estado": "EN_BUEN_ESTADO",
        "rodamientos_cantidad": 16,
        "observaciones_motor": "Texto libre"
    }
    */
    
    -- Observaciones y conclusiones
    observaciones_generales TEXT,
    requiere_tratamiento_cubierta BOOLEAN DEFAULT false,
    
    -- Metadatos adicionales
    tecnico_responsable TEXT,
    fecha_inspeccion DATE DEFAULT CURRENT_DATE,
    duracion_inspeccion_minutos INTEGER,
    
    -- Índices para optimizar búsquedas
    CONSTRAINT valid_duracion CHECK (duracion_inspeccion_minutos > 0 AND duracion_inspeccion_minutos <= 480)
);

-- Crear índices para mejorar performance
CREATE INDEX idx_informe_limpieza_orden_trabajo ON informe_limpieza_ductos(orden_trabajo_id);
CREATE INDEX idx_informe_limpieza_fecha ON informe_limpieza_ductos(fecha_inspeccion);
CREATE INDEX idx_informe_limpieza_created ON informe_limpieza_ductos(created_at);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_informe_limpieza_ductos_updated_at
    BEFORE UPDATE ON informe_limpieza_ductos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE informe_limpieza_ductos IS 'Registros de informes de limpieza de ductos de ventilación';
COMMENT ON COLUMN informe_limpieza_ductos.datos_motor IS 'Datos del diagnóstico del motor almacenados en formato JSON';
COMMENT ON COLUMN informe_limpieza_ductos.orden_trabajo_id IS 'Referencia a la orden de trabajo asociada';
