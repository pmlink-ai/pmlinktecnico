-- Script corregido para configurar bucket documentos-ordenes (SIN el ALTER TABLE problemático)
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- PASO 1: Crear o actualizar el bucket documentos-ordenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-ordenes', 
    'documentos-ordenes', 
    false,
    52428800, 
    ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf'],
    public = false;

-- PASO 2: Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Permitir subida de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir todas las operaciones en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Acceso total documentos ordenes" ON storage.objects;

-- PASO 3: Crear política permisiva para el bucket
CREATE POLICY "Acceso total documentos ordenes" ON storage.objects
FOR ALL 
USING (bucket_id = 'documentos-ordenes')
WITH CHECK (bucket_id = 'documentos-ordenes');

-- PASO 4: Crear tabla de documentos
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

-- PASO 5: Habilitar RLS en la tabla de documentos y crear política
ALTER TABLE documentos_orden_trabajo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total documentos tabla" ON documentos_orden_trabajo;
CREATE POLICY "Acceso total documentos tabla" ON documentos_orden_trabajo
FOR ALL 
USING (true)
WITH CHECK (true);

-- PASO 6: Verificar configuración final
SELECT 'Configuración completada' as estado, 
       'Bucket y tabla configurados correctamente' as mensaje;