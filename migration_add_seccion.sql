-- Script para agregar la columna 'seccion' a informe_fotografias
-- Ejecutar este SQL en el SQL Editor de Supabase

-- 1. Agregar la columna seccion
ALTER TABLE informe_fotografias 
ADD COLUMN IF NOT EXISTS seccion TEXT DEFAULT 'ANTES';

-- 2. Actualizar fotografías existentes sin sección (por compatibilidad)
UPDATE informe_fotografias 
SET seccion = 'ANTES' 
WHERE seccion IS NULL;

-- 3. Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_informe_fotografias_seccion 
ON informe_fotografias(seccion);

-- 4. Agregar comentario descriptivo
COMMENT ON COLUMN informe_fotografias.seccion IS 'Sección de la fotografía en el informe: ANTES, PROCESO, DESPUES';

-- 5. Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'informe_fotografias' 
ORDER BY ordinal_position;