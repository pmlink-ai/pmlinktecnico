-- Agregar columna 'seccion' a la tabla informe_fotografias
-- para distinguir entre ANTES, PROCESO y DESPUÉS

ALTER TABLE informe_fotografias 
ADD COLUMN seccion TEXT DEFAULT 'ANTES';

-- Crear un índice para mejorar las consultas por sección
CREATE INDEX IF NOT EXISTS idx_informe_fotografias_seccion 
ON informe_fotografias(seccion);

-- Comentarios sobre el uso
COMMENT ON COLUMN informe_fotografias.seccion IS 'Sección de la fotografía: ANTES, PROCESO, DESPUES';