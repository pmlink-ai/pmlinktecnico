-- Crear tabla para observaciones de fotografías por sección
CREATE TABLE observaciones_fotografias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orden_trabajo_id UUID NOT NULL REFERENCES orden_trabajo(id) ON DELETE CASCADE,
    informe_tabla VARCHAR(50) NOT NULL, -- 'informe_ansul_r102', 'informe_limpieza_ductos', etc.
    componente VARCHAR(50) NOT NULL,    -- 'Sistema_Supresion', 'Cartuchos_Gas', etc.
    seccion VARCHAR(20) NOT NULL,       -- 'ANTES', 'PROCESO', 'DESPUES'
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice único para evitar duplicados
CREATE UNIQUE INDEX idx_observaciones_unicas 
ON observaciones_fotografias(orden_trabajo_id, informe_tabla, componente, seccion);

-- Crear índices para consultas rápidas
CREATE INDEX idx_observaciones_orden ON observaciones_fotografias(orden_trabajo_id);
CREATE INDEX idx_observaciones_informe ON observaciones_fotografias(informe_tabla);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
CREATE TRIGGER update_observaciones_fotografias_updated_at 
    BEFORE UPDATE ON observaciones_fotografias 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Agregar comentarios para documentación
COMMENT ON TABLE observaciones_fotografias IS 'Observaciones por sección de fotografías en informes';
COMMENT ON COLUMN observaciones_fotografias.orden_trabajo_id IS 'ID de la orden de trabajo';
COMMENT ON COLUMN observaciones_fotografias.informe_tabla IS 'Nombre de la tabla del informe (ej: informe_ansul_r102)';
COMMENT ON COLUMN observaciones_fotografias.componente IS 'Clave del componente (ej: Sistema_Supresion)';
COMMENT ON COLUMN observaciones_fotografias.seccion IS 'Sección de fotos (ANTES, PROCESO, DESPUES)';
COMMENT ON COLUMN observaciones_fotografias.observaciones IS 'Texto de observaciones para la sección';