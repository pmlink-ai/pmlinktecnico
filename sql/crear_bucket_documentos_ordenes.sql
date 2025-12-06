-- ========================================
-- CREAR BUCKET DOCUMENTOS-ORDENES COMPLETO
-- ========================================
-- Este script crea el bucket, lo hace público y configura RLS

-- 1. CREAR EL BUCKET documentos-ordenes (si no existe)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-ordenes', 
  'documentos-ordenes', 
  true, 
  52428800,  -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

-- 2. ELIMINAR POLÍTICAS CONFLICTIVAS (si existen)
DROP POLICY IF EXISTS "Permitir subida en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Acceso total documentos ordenes" ON storage.objects;

-- 3. CREAR POLÍTICAS PERMISIVAS PARA BUCKET DOCUMENTOS-ORDENES

-- Política para INSERT (subir archivos)
CREATE POLICY "Permitir subida en documentos-ordenes" ON storage.objects
  FOR INSERT 
  TO public
  WITH CHECK (bucket_id = 'documentos-ordenes');

-- Política para SELECT (leer archivos)
CREATE POLICY "Permitir lectura en documentos-ordenes" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'documentos-ordenes');

-- Política para UPDATE (actualizar archivos)
CREATE POLICY "Permitir actualización en documentos-ordenes" ON storage.objects
  FOR UPDATE 
  TO public
  USING (bucket_id = 'documentos-ordenes');

-- Política para DELETE (eliminar archivos)
CREATE POLICY "Permitir eliminación en documentos-ordenes" ON storage.objects
  FOR DELETE 
  TO public
  USING (bucket_id = 'documentos-ordenes');

-- 4. VERIFICAR QUE TODO ESTÁ CORRECTO
SELECT 
  'BUCKET CREADO:' as info,
  id, 
  name, 
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'documentos-ordenes';

-- 5. VERIFICAR POLÍTICAS CREADAS
SELECT 
  'POLÍTICAS RLS:' as info,
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%documentos-ordenes%';

-- 6. MENSAJE DE CONFIRMACIÓN
SELECT 'BUCKET documentos-ordenes CONFIGURADO EXITOSAMENTE ✅' as resultado;