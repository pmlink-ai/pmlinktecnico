-- Script para crear la tabla informe_mtto_electromecanico
-- Basado en la estructura de informe_limpieza_ductos
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- Crear la nueva tabla para INFORME MTTO ELECTROMECANICO
CREATE TABLE IF NOT EXISTS informe_mtto_electromecanico (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_trabajo_id UUID NOT NULL REFERENCES orden_trabajo(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos específicos del formulario de mantenimiento electromecánico
    -- Adaptados desde limpieza de ductos pero enfocados en sistemas electromecánicos
    
    -- Estado de componentes eléctricos
    motor_principal_estado TEXT,
    sistema_electrico_estado TEXT,
    tablero_control_estado TEXT,
    sensores_estado TEXT,
    
    -- Estado de componentes mecánicos
    rodamientos_motor_estado TEXT,
    correas_transmision_estado TEXT,
    poleas_estado TEXT,
    ejes_estado TEXT,
    
    -- Sistema de lubricación
    lubricacion_general_estado TEXT,
    filtros_aceite_estado TEXT,
    nivel_aceite_estado TEXT,
    
    -- Componentes específicos electromecánicos
    contactores_estado TEXT,
    protecciones_electricas_estado TEXT,
    conexiones_electricas_estado TEXT,
    vibraciones_motor TEXT,
    temperatura_operacion TEXT,
    
    -- Mediciones y pruebas
    amperaje_motor DECIMAL(10,2),
    voltaje_operacion DECIMAL(10,2),
    frecuencia_operacion DECIMAL(10,2),
    resistencia_aislamiento DECIMAL(10,2),
    
    -- Información general del servicio
    observaciones TEXT,
    cliente TEXT,
    fecha_inicio DATE,
    nombre_local TEXT,
    encargado TEXT NOT NULL,
    asist_personal TEXT NOT NULL,
    horas_trabajo INTEGER
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_mtto_electromecanico_orden_trabajo 
ON informe_mtto_electromecanico(orden_trabajo_id);

CREATE INDEX IF NOT EXISTS idx_mtto_electromecanico_fecha 
ON informe_mtto_electromecanico(fecha_inicio);

CREATE INDEX IF NOT EXISTS idx_mtto_electromecanico_cliente 
ON informe_mtto_electromecanico(cliente);

-- Agregar comentarios para documentar la tabla
COMMENT ON TABLE informe_mtto_electromecanico IS 'Tabla para almacenar informes de mantenimiento electromecánico';
COMMENT ON COLUMN informe_mtto_electromecanico.orden_trabajo_id IS 'Referencia a la orden de trabajo';
COMMENT ON COLUMN informe_mtto_electromecanico.motor_principal_estado IS 'Estado del motor principal del equipo';
COMMENT ON COLUMN informe_mtto_electromecanico.sistema_electrico_estado IS 'Estado general del sistema eléctrico';
COMMENT ON COLUMN informe_mtto_electromecanico.amperaje_motor IS 'Medición de amperaje del motor en operación';
COMMENT ON COLUMN informe_mtto_electromecanico.voltaje_operacion IS 'Voltaje de operación medido';
COMMENT ON COLUMN informe_mtto_electromecanico.resistencia_aislamiento IS 'Medición de resistencia de aislamiento en MegaOhms';

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'informe_mtto_electromecanico' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar información de la tabla creada
SELECT 
    'Tabla creada exitosamente: informe_mtto_electromecanico' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'informe_mtto_electromecanico' 
AND table_schema = 'public';