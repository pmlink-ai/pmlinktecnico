-- Script completo para configurar bucket documentos-ordenes
-- Ejecutar este script paso a paso en el SQL Editor de Supabase Dashboard

-- PASO 1: Crear o actualizar el bucket documentos-ordenes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documentos-ordenes', 
    'documentos-ordenes', 
    false, -- Privado por seguridad
    52428800, -- 50MB límite
    ARRAY['application/pdf']
) ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf'],
    public = false;

-- PASO 2: Eliminar políticas existentes que puedan estar causando conflictos
DROP POLICY IF EXISTS "Permitir subida de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización de documentos PDF" ON storage.objects;
DROP POLICY IF EXISTS "Permitir todas las operaciones en documentos-ordenes" ON storage.objects;

-- PASO 3: Crear política PERMISIVA para desarrollo (SIN autenticación estricta)
CREATE POLICY "Acceso total documentos ordenes" ON storage.objects
FOR ALL 
USING (bucket_id = 'documentos-ordenes')
WITH CHECK (bucket_id = 'documentos-ordenes');

-- PASO 4: Asegurar que RLS esté habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- PASO 5: Crear tabla para registrar documentos
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

-- PASO 6: Habilitar RLS en la tabla y crear política permisiva
ALTER TABLE documentos_orden_trabajo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acceso total documentos tabla" ON documentos_orden_trabajo;
CREATE POLICY "Acceso total documentos tabla" ON documentos_orden_trabajo
FOR ALL 
USING (true)
WITH CHECK (true);

-- PASO 7: Verificar configuración
SELECT 'Bucket configurado:' as resultado, id, name, allowed_mime_types, file_size_limit, public 
FROM storage.buckets 
WHERE id = 'documentos-ordenes'

UNION ALL

SELECT 'Tabla creada:' as resultado, 
       'documentos_orden_trabajo' as id, 
       'Tabla para registrar documentos PDF' as name,
       NULL as allowed_mime_types,
       NULL as file_size_limit,
       NULL as public
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documentos_orden_trabajo');