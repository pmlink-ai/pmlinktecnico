-- ESQUEMA COMPLETO DE INFORMES TÉCNICOS
-- Sistema CMMS Móvil para Técnicos en Terreno
-- Todas las tablas de informes del sistema

-- TABLA PRINCIPAL: Órdenes de Trabajo (referencia)
-- Esta tabla debe existir previamente
/*
CREATE TABLE IF NOT EXISTS orden_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    cliente_id UUID,
    equipo_id UUID,
    tipo_mantenimiento TEXT,
    estado TEXT DEFAULT 'PENDIENTE',
    fecha_programada DATE,
    tecnico_asignado TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
*/

-- ================================
-- TABLA 1: INFORME ANSUL R102
-- ================================
CREATE TABLE IF NOT EXISTS informe_ansul_r102 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Inspecciones del sistema Ansul R102
    inspeccion_visual_montaje TEXT,
    estado_cartuchos_gas TEXT,
    estado_canerias_distribucion TEXT,
    estado_montaje_conductos TEXT,
    prueba_fuga_caneria TEXT,
    prueba_soplado_canerias TEXT,
    revision_agente TEXT,
    estado_cilindro_agente TEXT,
    estado_disco_ruptura TEXT,
    cantidad_estado_boquillas TEXT,
    tipo_tapones_boquillas TEXT,
    estado_piola_acero TEXT,
    verificacion_automan_gas TEXT,
    verificacion_senal_alarma TEXT,
    observaciones_generales TEXT,
    
    CONSTRAINT informe_ansul_r102_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);

-- ================================
-- TABLA 2: INFORME ELECTROMECÁNICO
-- ================================
CREATE TABLE IF NOT EXISTS informe_electromecanico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Datos de personal y trabajo
    asistencia_personal TEXT,
    horas_trabajo TEXT,
    
    -- Inspección mecánica
    rejillas_motor_estado TEXT,
    cantidad_motores INTEGER,
    fuelle_estado TEXT,
    correas_modelo TEXT,
    rodamientos_estado TEXT,
    
    -- Mediciones eléctricas
    consumo_fase_r NUMERIC(5,2),
    consumo_fase_s NUMERIC(5,2),
    consumo_fase_t NUMERIC(5,2),
    
    observaciones_generales TEXT,
    
    CONSTRAINT informe_electromecanico_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);

-- ================================
-- TABLA 3: INFORME LIMPIEZA DUCTOS
-- ================================
CREATE TABLE IF NOT EXISTS informe_limpieza_ductos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Diagnóstico del sistema de ductos
    campanas_estado TEXT,
    filtros_estado TEXT,
    ductos_estado TEXT,
    damper_estado TEXT,
    drenajes_estado TEXT,
    registros_local_estado TEXT,
    registros_techumbre_estado TEXT,
    
    -- Datos del motor (JSON estructurado)
    datos_motor JSONB DEFAULT '{}',
    
    -- Observaciones y conclusiones
    observaciones_generales TEXT,
    requiere_tratamiento_cubierta BOOLEAN DEFAULT false,
    
    CONSTRAINT informe_limpieza_ductos_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);

-- ================================
-- TABLA 4: INFORME REPARACIONES ADICIONALES
-- ================================
CREATE TABLE IF NOT EXISTS informe_reparaciones_adicionales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Datos de reparaciones
    tipo_reparacion TEXT,
    resumen_trabajos TEXT,
    observaciones_generales TEXT,
    
    CONSTRAINT informe_reparaciones_adicionales_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);

-- ================================
-- TABLA 5: INFORME FOTOGRAFÍAS
-- ================================
CREATE TABLE IF NOT EXISTS informe_fotografias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL,
    informe_tabla TEXT NOT NULL, -- 'ansul_r102', 'electromecanico', 'limpieza_ductos', etc.
    storage_path TEXT NOT NULL,  -- Ruta en Supabase Storage
    etiqueta TEXT,              -- Descripción de la foto
    uploaded_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT informe_fotografias_orden_trabajo_id_fkey 
        FOREIGN KEY (orden_trabajo_id) REFERENCES orden_trabajo(id) ON DELETE CASCADE
);

-- ================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================

-- Índices para búsquedas por orden de trabajo
CREATE INDEX IF NOT EXISTS idx_ansul_orden_trabajo ON informe_ansul_r102(orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_electromecanico_orden_trabajo ON informe_electromecanico(orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_limpieza_orden_trabajo ON informe_limpieza_ductos(orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_reparaciones_orden_trabajo ON informe_reparaciones_adicionales(orden_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_fotografias_orden_trabajo ON informe_fotografias(orden_trabajo_id);

-- Índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_ansul_created ON informe_ansul_r102(created_at);
CREATE INDEX IF NOT EXISTS idx_electromecanico_created ON informe_electromecanico(created_at);
CREATE INDEX IF NOT EXISTS idx_limpieza_created ON informe_limpieza_ductos(created_at);
CREATE INDEX IF NOT EXISTS idx_reparaciones_created ON informe_reparaciones_adicionales(created_at);
CREATE INDEX IF NOT EXISTS idx_fotografias_uploaded ON informe_fotografias(uploaded_at);

-- Índice para fotografías por tipo de informe
CREATE INDEX IF NOT EXISTS idx_fotografias_tabla ON informe_fotografias(informe_tabla);

-- ================================
-- TRIGGERS PARA UPDATED_AT
-- ================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabla limpieza_ductos
CREATE TRIGGER IF NOT EXISTS update_limpieza_ductos_updated_at
    BEFORE UPDATE ON informe_limpieza_ductos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ================================

COMMENT ON TABLE informe_ansul_r102 IS 'Informes de mantenimiento del sistema contra incendios Ansul R102';
COMMENT ON TABLE informe_electromecanico IS 'Informes de mantenimiento electromecánico de equipos';
COMMENT ON TABLE informe_limpieza_ductos IS 'Informes de limpieza y mantenimiento de ductos de ventilación';
COMMENT ON TABLE informe_reparaciones_adicionales IS 'Informes de reparaciones adicionales realizadas';
COMMENT ON TABLE informe_fotografias IS 'Fotografías asociadas a los informes técnicos';

COMMENT ON COLUMN informe_limpieza_ductos.datos_motor IS 'Datos del diagnóstico del motor en formato JSON';
COMMENT ON COLUMN informe_fotografias.informe_tabla IS 'Tipo de informe: ansul_r102, electromecanico, limpieza_ductos, reparaciones_adicionales';
COMMENT ON COLUMN informe_fotografias.storage_path IS 'Ruta del archivo en Supabase Storage';
