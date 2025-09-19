-- Crear tabla para almacenar las referencias de fotografías de informes
CREATE TABLE IF NOT EXISTS informe_fotografias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    orden_trabajo_id UUID NOT NULL REFERENCES orden_trabajo(id) ON DELETE CASCADE,
    informe_tabla VARCHAR(100) NOT NULL, -- Nombre de la tabla del informe específico
    storage_path TEXT NOT NULL, -- Ruta en Supabase Storage
    etiqueta VARCHAR(200), -- Etiqueta o descripción de la foto
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_informe_fotografias_orden_trabajo_id 
ON informe_fotografias(orden_trabajo_id);

CREATE INDEX IF NOT EXISTS idx_informe_fotografias_informe_tabla 
ON informe_fotografias(informe_tabla);

CREATE INDEX IF NOT EXISTS idx_informe_fotografias_uploaded_at 
ON informe_fotografias(uploaded_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE informe_fotografias ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Permitir todas las operaciones a usuarios autenticados" 
ON informe_fotografias 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Crear bucket en Storage para las fotos (esto se ejecuta manualmente)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('fotos_informes', 'fotos_informes', true);

-- Crear política de Storage para permitir subida y lectura de archivos
-- CREATE POLICY "Permitir subida de fotos" ON storage.objects 
-- FOR INSERT TO authenticated 
-- WITH CHECK (bucket_id = 'fotos_informes');

-- CREATE POLICY "Permitir lectura de fotos" ON storage.objects 
-- FOR SELECT TO authenticated 
-- USING (bucket_id = 'fotos_informes');

-- CREATE POLICY "Permitir eliminación de fotos" ON storage.objects 
-- FOR DELETE TO authenticated 
-- USING (bucket_id = 'fotos_informes');