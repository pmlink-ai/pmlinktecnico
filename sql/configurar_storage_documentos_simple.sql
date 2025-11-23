-- Script simplificado para configurar Storage de documentos (para desarrollo)
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Crear o actualizar el bucket para documentos PDF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-ordenes', 
    'documentos-ordenes', 
    false,
    52428800, -- 50MB límite
    ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf'],
    public = false;

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Permitir subida de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de documentos PDF" ON storage.objects;

-- 3. Crear políticas más permisivas para desarrollo
CREATE POLICY "Permitir todas las operaciones en documentos-ordenes" ON storage.objects
FOR ALL 
USING (bucket_id = 'documentos-ordenes')
WITH CHECK (bucket_id = 'documentos-ordenes');

-- 4. Verificar que RLS esté habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Crear tabla de documentos si no existe
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

-- 6. Políticas permisivas para la tabla de documentos
ALTER TABLE documentos_orden_trabajo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir ver documentos" ON documentos_orden_trabajo;
DROP POLICY IF EXISTS "Permitir insertar documentos tabla" ON documentos_orden_trabajo;
DROP POLICY IF EXISTS "Permitir actualizar documentos tabla" ON documentos_orden_trabajo;
DROP POLICY IF EXISTS "Permitir eliminar documentos tabla" ON documentos_orden_trabajo;

CREATE POLICY "Permitir todas las operaciones en documentos tabla" ON documentos_orden_trabajo
FOR ALL 
USING (true)
WITH CHECK (true);