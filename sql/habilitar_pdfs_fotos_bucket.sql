-- Script para habilitar PDFs en el bucket fotos_informes (solución temporal)
-- Ejecutar este script en el SQL Editor de Supabase Dashboard

-- 1. Actualizar el bucket fotos_informes para aceptar PDFs
UPDATE storage.buckets 
SET 
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    file_size_limit = 52428800 -- 50MB para permitir PDFs más grandes
WHERE id = 'fotos_informes';

-- 2. Verificar la actualización
SELECT id, name, allowed_mime_types, file_size_limit 
FROM storage.buckets 
WHERE id = 'fotos_informes';