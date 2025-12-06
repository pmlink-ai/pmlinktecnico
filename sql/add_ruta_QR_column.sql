-- Agregar columna ruta_QR a la tabla orden_trabajo
-- Esta columna almacenará la ruta del PDF en la estructura QR: empresa_id/zona_id/local_id/QR/

ALTER TABLE orden_trabajo 
ADD COLUMN ruta_QR TEXT DEFAULT NULL;

-- Agregar comentario para documentar el propósito de la columna
COMMENT ON COLUMN orden_trabajo.ruta_QR IS 'Ruta del PDF en estructura QR: empresa_id/zona_id/local_id/QR/archivo.pdf';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orden_trabajo' 
AND column_name = 'ruta_QR';