-- ========================================
-- CONFIGURAR RLS PARA BUCKET DOCUMENTOS (CORRECTO)
-- ========================================
-- documentos-ordenes es una CARPETA dentro del bucket documentos

-- 1. VERIFICAR QUE EL BUCKET documentos EXISTE
SELECT 'VERIFICANDO BUCKET:' as info, id, name, public 
FROM storage.buckets 
WHERE id = 'documentos';

-- 2. HACER EL BUCKET PÚBLICO (si no lo es)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'documentos';

-- 3. ELIMINAR POLÍTICAS CONFLICTIVAS
DROP POLICY IF EXISTS "Permitir subida en documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura en documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir actualización en documentos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir eliminación en documentos" ON storage.objects;

-- 4. CREAR POLÍTICAS PERMISIVAS PARA BUCKET DOCUMENTOS

-- Política para todas las operaciones
CREATE POLICY "Acceso completo bucket documentos" ON storage.objects
  FOR ALL 
  TO public
  USING (bucket_id = 'documentos')
  WITH CHECK (bucket_id = 'documentos');

-- 5. VERIFICAR RESULTADO
SELECT 
  'POLÍTICAS CREADAS:' as info,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%documentos%';

-- 6. VERIFICAR BUCKET FINAL
SELECT 'BUCKET CONFIGURADO:' as info, id, name, public 
FROM storage.buckets 
WHERE id = 'documentos';

SELECT '✅ CONFIGURACIÓN COMPLETADA PARA BUCKET DOCUMENTOS' as resultado;