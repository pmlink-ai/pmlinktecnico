-- ALTERNATIVA SIMPLE - Solo política de INSERT para documentos
-- Si el script anterior falla, ejecuta solo esto:

-- Crear política muy permisiva para INSERT
CREATE POLICY "storage_documentos_insert" ON storage.objects
  FOR INSERT 
  TO public
  WITH CHECK (bucket_id = 'documentos');

-- Crear política muy permisiva para SELECT  
CREATE POLICY "storage_documentos_select" ON storage.objects
  FOR SELECT 
  TO public
  USING (bucket_id = 'documentos');

-- Verificar que funciona
SELECT bucket_id, name FROM storage.objects WHERE bucket_id = 'documentos' LIMIT 5;