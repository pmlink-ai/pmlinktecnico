-- Agregar columna 'cliente' a la tabla informe_ansul_r102
ALTER TABLE informe_ansul_r102 
ADD COLUMN cliente VARCHAR(255);

-- Opcional: Agregar comentario para documentar el campo
COMMENT ON COLUMN informe_ansul_r102.cliente IS 'Nombre del cliente para el informe ANSUL R-102';