-- 🔧 CONFIGURACIÓN SUPABASE PARA INFORME ELECTROMECÁNICO
-- Formulario ID existente: 2364b1f7-069e-4416-9852-1755c0c9b9b2

-- ===============================================
-- 1. VERIFICAR FORMULARIO EXISTENTE
-- ===============================================
SELECT id, nombre, descripcion, form_key, activo 
FROM formularios 
WHERE id = '2364b1f7-069e-4416-9852-1755c0c9b9b2';

-- ===============================================  
-- 2. VERIFICAR SI EXISTE SERVICIO ASOCIADO
-- ===============================================
SELECT id, nombre_servicio, descripcion, formulario_id, activo
FROM servicios 
WHERE formulario_id = '2364b1f7-069e-4416-9852-1755c0c9b9b2';

-- ===============================================
-- 3. CREAR SERVICIO SI NO EXISTE
-- ===============================================
-- Ejecutar solo si no existe servicio asociado:
INSERT INTO servicios (nombre_servicio, descripcion, formulario_id, activo)
VALUES (
  'MANTENIMIENTO ELECTROMECÁNICO',
  'Servicio de mantenimiento preventivo y correctivo de sistemas electromecánicos',
  '2364b1f7-069e-4416-9852-1755c0c9b9b2',
  true
);

-- ===============================================
-- 4. VERIFICAR CONFIGURACIÓN COMPLETA
-- ===============================================
SELECT 
  f.nombre as formulario_nombre,
  f.form_key,
  f.activo as formulario_activo,
  s.nombre_servicio,
  s.activo as servicio_activo
FROM formularios f
LEFT JOIN servicios s ON f.id = s.formulario_id
WHERE f.id = '2364b1f7-069e-4416-9852-1755c0c9b9b2';

-- ===============================================
-- 5. VERIFICAR TABLA DE DATOS
-- ===============================================
-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'informe_electromecanico' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar si hay registros de prueba
SELECT COUNT(*) as total_registros
FROM informe_electromecanico;

-- ===============================================
-- 6. VERIFICAR PERMISOS RLS (Row Level Security)
-- ===============================================
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'informe_electromecanico';

-- Ver políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'informe_electromecanico';

-- ===============================================
-- 7. CONFIGURAR RLS SI ES NECESARIO
-- ===============================================
-- Habilitar RLS si no está habilitado
-- ALTER TABLE informe_electromecanico ENABLE ROW LEVEL SECURITY;

-- Crear política básica para autenticados (opcional)
-- CREATE POLICY "Allow authenticated users" ON informe_electromecanico
-- FOR ALL TO authenticated
-- USING (true)
-- WITH CHECK (true);

-- ===============================================
-- 8. VERIFICAR STORAGE PARA FOTOGRAFÍAS
-- ===============================================
-- Verificar bucket de fotografías
SELECT name, id, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'fotos_informes';

-- ===============================================
-- RESUMEN DE VERIFICACIONES
-- ===============================================
-- ✅ Formulario existe con ID: 2364b1f7-069e-4416-9852-1755c0c9b9b2
-- ⚠️  Verificar: Servicio asociado en tabla servicios
-- ⚠️  Verificar: Permisos RLS en tabla informe_electromecanico  
-- ⚠️  Verificar: Bucket de storage para fotografías
-- ✅ Código App.js ya configurado para obtener form_key dinámicamente
-- ✅ Código pdfService.js ya configurado para generar PDFs

-- PRÓXIMOS PASOS:
-- 1. Ejecutar consultas de verificación (1, 2, 4, 5, 6, 8)
-- 2. Si no existe servicio, ejecutar consulta 3
-- 3. Configurar RLS si es necesario (consulta 7)
-- 4. Probar funcionamiento completo en la aplicación