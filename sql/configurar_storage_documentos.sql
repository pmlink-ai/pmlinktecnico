-- Script para configurar Supabase Storage para documentos PDF de órdenes de trabajo
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Crear el bucket para documentos PDF de órdenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-ordenes', 
    'documentos-ordenes', 
    false, -- Privado por seguridad de documentos
    52428800, -- 50MB límite por archivo
    ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf'];

-- 2. Habilitar RLS en el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Crear tabla para registros de documentos si no existe
CREATE TABLE IF NOT EXISTS documentos_orden_trabajo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    orden_id UUID NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_storage VARCHAR(500) NOT NULL,
    url_publica TEXT,
    tamaño_bytes BIGINT,
    version INTEGER DEFAULT 1,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE,
    metadatos JSONB DEFAULT '{}'
);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_documentos_orden_id ON documentos_orden_trabajo(orden_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos_orden_trabajo(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_activo ON documentos_orden_trabajo(activo);

-- 5. Políticas de Storage para permitir operaciones con documentos

-- Política para permitir subida de documentos a usuarios autenticados
CREATE POLICY "Permitir subida de documentos PDF" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'documentos-ordenes' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir lectura de documentos a usuarios autenticados
CREATE POLICY "Permitir lectura de documentos PDF" ON storage.objects 
FOR SELECT TO authenticated 
USING (
    bucket_id = 'documentos-ordenes' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir eliminación de documentos
CREATE POLICY "Permitir eliminación de documentos PDF" ON storage.objects 
FOR DELETE TO authenticated 
USING (
    bucket_id = 'documentos-ordenes' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir actualización de documentos
CREATE POLICY "Permitir actualización de documentos PDF" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
    bucket_id = 'documentos-ordenes' 
    AND auth.role() = 'authenticated'
);

-- 6. Habilitar RLS en la tabla de documentos
ALTER TABLE documentos_orden_trabajo ENABLE ROW LEVEL SECURITY;

-- 7. Políticas para la tabla documentos_orden_trabajo
CREATE POLICY "Permitir ver documentos propios" ON documentos_orden_trabajo
FOR SELECT TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir insertar documentos" ON documentos_orden_trabajo
FOR INSERT TO authenticated
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualizar documentos propios" ON documentos_orden_trabajo
FOR UPDATE TO authenticated
USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminar documentos propios" ON documentos_orden_trabajo
FOR DELETE TO authenticated
USING (auth.role() = 'authenticated');

-- 8. Función para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para actualizar automáticamente la fecha de modificación
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_documentos ON documentos_orden_trabajo;
CREATE TRIGGER trigger_actualizar_fecha_documentos
    BEFORE UPDATE ON documentos_orden_trabajo
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();