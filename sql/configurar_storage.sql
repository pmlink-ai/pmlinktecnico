-- Script para configurar Supabase Storage para fotos de informes
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Crear el bucket para fotos de informes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fotos_informes', 
    'fotos_informes', 
    true, 
    10485760, -- 10MB límite por archivo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Crear políticas de Storage para permitir operaciones con archivos

-- Política para permitir subida de fotos a usuarios autenticados
CREATE POLICY "Permitir subida de fotos de informes" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
    bucket_id = 'fotos_informes' 
    AND (storage.foldername(name))[1] = 'public'
);

-- Política para permitir lectura de fotos (público)
CREATE POLICY "Permitir lectura de fotos de informes" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'fotos_informes');

-- Política para permitir eliminación de fotos propias
CREATE POLICY "Permitir eliminación de fotos de informes" ON storage.objects 
FOR DELETE TO authenticated 
USING (
    bucket_id = 'fotos_informes' 
    AND (storage.foldername(name))[1] = 'public'
);

-- Política para permitir actualización de fotos
CREATE POLICY "Permitir actualización de fotos de informes" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
    bucket_id = 'fotos_informes' 
    AND (storage.foldername(name))[1] = 'public'
);