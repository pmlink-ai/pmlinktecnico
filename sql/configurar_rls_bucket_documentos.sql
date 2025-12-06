-- ========================================
-- CONFIGURAR RLS PARA BUCKET DOCUMENTOS-ORDENES
-- ========================================
-- Este script configura políticas RLS permisivas para el bucket 'documentos-ordenes'
-- que es el que realmente está usando la aplicación

-- 1. ELIMINAR POLÍTICAS CONFLICTIVAS (si existen)
DROP POLICY IF EXISTS "Permitir subida en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación en documentos-ordenes" ON storage.objects;
DROP POLICY IF EXISTS "Acceso total documentos ordenes" ON storage.objects;

-- 2. CREAR POLÍTICAS PERMISIVAS PARA BUCKET DOCUMENTOS-ORDENES

-- Política para INSERT (subir archivos)
CREATE POLICY "Permitir subida en documentos-ordenes" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'documentos-ordenes');

-- Política para SELECT (leer archivos)
CREATE POLICY "Permitir lectura en documentos-ordenes" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'documentos-ordenes');

-- Política para UPDATE (actualizar archivos)
CREATE POLICY "Permitir actualización en documentos-ordenes" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'documentos-ordenes');

-- Política para DELETE (eliminar archivos)
CREATE POLICY "Permitir eliminación en documentos-ordenes" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'documentos-ordenes');

-- 3. VERIFICAR QUE EL BUCKET EXISTE Y ES PÚBLICO
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-ordenes', 'documentos-ordenes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4. VERIFICAR POLÍTICAS CREADAS
SELECT 
  policyname,
  cmd,
  permissive,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%documentos-ordenes%';