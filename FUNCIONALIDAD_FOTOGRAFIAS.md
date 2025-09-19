# 📸 Funcionalidad de Fotografías - PMLink Técnico

## ✅ Estado Actual

La funcionalidad de carga de fotografías ha sido **completamente implementada** en la aplicación. Puedes ver:

- **App.js**: Actualizado con el sistema completo de CMMS incluyendo el componente ImageUploader
- **Dependencias**: expo-image-picker, react-native-url-polyfill y react-native-get-random-values instaladas
- **Permisos**: app.json configurado con permisos de cámara y galería
- **Componente ImageUploader**: Sistema completo de subida, visualización y eliminación de fotos

## 🚀 Funcionalidades Implementadas

### 📷 Componente ImageUploader
- **Cámara**: Tomar fotos directamente desde la app
- **Galería**: Seleccionar fotos existentes del dispositivo
- **Subida**: Upload automático a Supabase Storage
- **Visualización**: Lista horizontal de fotos subidas
- **Eliminación**: Mantener presionada una foto para eliminarla
- **Base de datos**: Guardar metadatos en tabla informe_fotografias

### 🔐 Gestión de Permisos
- Solicitud automática de permisos de cámara
- Solicitud automática de permisos de galería
- Manejo de errores si se deniegan los permisos

### 💾 Integración con Supabase
- **Storage**: Subida de archivos al bucket 'fotos_informes'
- **Database**: Registro de metadatos en tabla informe_fotografias
- **Organización**: Archivos organizados por orden_trabajo_id e informe_tabla

## ⚠️ Pasos Pendientes para Activar

### 1. Crear Tabla en Supabase Database
Ejecuta este SQL en tu Dashboard de Supabase (SQL Editor):

\`\`\`sql
-- Crear tabla para almacenar las referencias de fotografías de informes
CREATE TABLE IF NOT EXISTS informe_fotografias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    orden_trabajo_id UUID NOT NULL REFERENCES orden_trabajo(id) ON DELETE CASCADE,
    informe_tabla VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    etiqueta VARCHAR(200),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_informe_fotografias_orden_trabajo_id 
ON informe_fotografias(orden_trabajo_id);

-- Habilitar RLS
ALTER TABLE informe_fotografias ENABLE ROW LEVEL SECURITY;

-- Crear política
CREATE POLICY "Permitir todas las operaciones a usuarios autenticados" 
ON informe_fotografias 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
\`\`\`

### 2. Configurar Supabase Storage
Ejecuta este SQL en tu Dashboard de Supabase (SQL Editor):

\`\`\`sql
-- Crear bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fotos_informes', 
    'fotos_informes', 
    true, 
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
CREATE POLICY "Permitir subida de fotos de informes" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'fotos_informes');

CREATE POLICY "Permitir lectura de fotos de informes" ON storage.objects 
FOR SELECT TO authenticated 
USING (bucket_id = 'fotos_informes');

CREATE POLICY "Permitir eliminación de fotos de informes" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'fotos_informes');
\`\`\`

## 🎯 Cómo Usar

### En la App
1. **Iniciar sesión** con admin@pmlink.com / admin123456
2. **Seleccionar una orden** de trabajo de la lista
3. **Abrir el formulario** de limpieza de ductos
4. **Buscar la sección** "📸 Fotografías del Informe"
5. **Tocar "Añadir Foto"** para elegir entre Cámara o Galería
6. **Las fotos se suben automáticamente** a Supabase Storage
7. **Mantener presionada** una foto para eliminarla

### Integración con Formularios
- Las fotos se asocian automáticamente a la orden de trabajo
- Se vinculan al tipo de formulario específico (informe_limpieza_ductos)
- Los metadatos se guardan en la base de datos
- Las imágenes se organizan por carpetas en Storage

## 📁 Estructura de Archivos

\`\`\`
/fotos_informes/
  /public/
    /{orden_trabajo_id}/
      /informe_limpieza_ductos/
        /imagen1.jpg
        /imagen2.jpg
\`\`\`

## 🔧 Configuración Técnica

### Permisos en app.json
\`\`\`json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "La aplicación accede a tus fotos para adjuntar imágenes a los informes de trabajo.",
          "cameraPermission": "La aplicación accede a tu cámara para tomar fotos de los trabajos realizados."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Esta app necesita acceso a la cámara para tomar fotos de los informes de trabajo.",
        "NSPhotoLibraryUsageDescription": "Esta app necesita acceso a la galería para seleccionar fotos para los informes."
      }
    },
    "android": {
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
\`\`\`

## ✨ Funcionalidades Adicionales

- **Carga múltiple**: Subir varias fotos por informe
- **Preview**: Ver fotos en lista horizontal
- **Eliminación**: Eliminar fotos individuales
- **Organización**: Estructura de carpetas automática
- **Metadatos**: Etiquetas y timestamps automáticos
- **Validación**: Solo imágenes permitidas
- **Límite de tamaño**: 10MB máximo por archivo

## 🐛 Troubleshooting

### Si no puedes tomar fotos:
1. Verificar permisos en Configuración del dispositivo
2. Reiniciar la app después de otorgar permisos
3. Comprobar que la cámara funciona en otras apps

### Si no se suben las fotos:
1. Verificar conexión a internet
2. Comprobar que el bucket 'fotos_informes' existe en Supabase
3. Verificar las políticas de Storage en Supabase

### Si no se ven las fotos:
1. Verificar que la tabla informe_fotografias existe
2. Comprobar las políticas RLS en la tabla
3. Verificar las URLs públicas del Storage