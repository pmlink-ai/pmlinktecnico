-- Agregar campos 'fecha_inicio' y 'nombre_local' a la tabla informe_ansul_r102
ALTER TABLE informe_ansul_r102 
ADD COLUMN fecha_inicio DATE,
ADD COLUMN nombre_local VARCHAR(255);

-- Opcional: Agregar comentarios para documentar los campos
COMMENT ON COLUMN informe_ansul_r102.fecha_inicio IS 'Fecha de inicio del servicio';
COMMENT ON COLUMN informe_ansul_r102.nombre_local IS 'Nombre del local donde se realiza el servicio';