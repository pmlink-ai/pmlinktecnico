# 🔧 INFORME ELECTROMECANICO - Documentación Completa

## 📋 Descripción General
El **INFORME ELECTROMECANICO** es un formulario especializado en el mantenimiento de sistemas electromecánicos, adaptado a la estructura real de la base de datos existente en Supabase.

## 🗂️ Estructura del Formulario

### **Campos de la Base de Datos (Estructura Real)**

#### **Información General**
- `id` (UUID) - Identificador único del informe
- `orden_trabajo_id` (UUID) - Referencia a la orden de trabajo
- `created_at` - Fecha de creación automática
- `cliente` (VARCHAR 200) - Nombre del cliente  
- `nombre_local` (VARCHAR 200) - Nombre del local
- `fecha_inicio` - Fecha de inicio del servicio

#### **Personal y Tiempo**
- `asistencia_personal` (TEXT) - Personal que asistió al servicio
- `horas_trabajo` (TEXT) - Horas de trabajo empleadas

#### **Componentes Físicos**
- `rejillas_motor_estado` (TEXT) - Rejillas en el Motor
- `cantidad_motores` (INTEGER) - Cantidad de Motores  
- `fuelle_estado` (TEXT) - Fuelle
- `correas_modelo` (TEXT) - Correas
- `rodamientos_estado` (TEXT) - Rodamientos

#### **Observaciones**
- `observaciones_generales` (TEXT) - Observaciones generales del servicio

## 📸 Secciones Fotográficas

### **Componentes Configurados**
1. **Observaciones Fotográficas** 📸
2. **Rejillas Motor** ⚙️
3. **Motores** 🔌
4. **Fuelle** �️
5. **Correas** �
6. **Rodamientos** �
7. **Consumo Eléctrico** ⚡
8. **Recibo Conforme** ✅

### **Configuración de Fotografías**
- **Secciones por componente**: ANTES / PROCESO / DESPUÉS
- **Límite por sección**: 4 fotografías
- **Formato soportado**: JPG/PNG
- **Almacenamiento**: Supabase Storage organizado por carpetas

## 🏗️ Implementación Técnica

### **Archivos Modificados**

#### **1. App.js**
- ✅ Agregado mapeo de carpetas de storage
- ✅ Configuración de componentes fotográficos
- ✅ Soporte en getFormComponent()
- ✅ Validaciones básicas en handleSubmit
- ✅ Configuración de nombres de formulario
- ✅ Generación de nombres de archivo PDF

#### **2. services/pdfService.js**
- ✅ Mapeo de componentes para storage
- ✅ Función generateMttoElectromecanicosPDF()
- ✅ Tabla de diagnóstico especializada
- ✅ Título específico del informe

#### **3. Base de Datos**
- ✅ Script SQL: `crear_tabla_mtto_electromecanico.sql`
- ✅ Tabla: `informe_mtto_electromecanico`
- ✅ Índices para optimización
- ✅ Comentarios documentados

## 📄 Generación de PDF

### **Características del PDF**
- **Título**: "INFORME MANTENIMIENTO ELECTROMECÁNICO"
- **Nombre archivo**: `FORMULARIO_INFORME_ELECTROMECANICO_[ID]`
- **Secciones incluidas**:
  - Encabezado con logo PMDUC
  - Información de técnicos
  - Datos del servicio
  - Tabla de diagnóstico especializada
  - Sección fotográfica completa

### **Tabla de Diagnóstico Especializada**
La tabla incluye todos los componentes específicos del mantenimiento electromecánico según la estructura real:
- **Componentes físicos**: Rejillas en el Motor, Cantidad de Motores, Fuelle, Correas, Rodamientos
- **Información del servicio**: Horas de trabajo, personal asistente
- **Observaciones**: Observaciones generales del servicio

## 🔧 Configuración de Base de Datos

### **Crear la Tabla**
La tabla ya existe en Supabase con el nombre `informe_electromecanico`

### **Configuración en Supabase**

#### **Formulario Existente**
- **ID del Formulario**: `2364b1f7-069e-4416-9852-1755c0c9b9b2`
- **Estado**: ✅ Ya existe en la tabla `formularios`

#### **Crear Servicio Asociado** (si no existe):
```sql
INSERT INTO servicios (nombre_servicio, descripcion, formulario_id, activo)
VALUES (
  'MANTENIMIENTO ELECTROMECÁNICO',
  'Servicio de mantenimiento preventivo y correctivo de sistemas electromecánicos',
  '2364b1f7-069e-4416-9852-1755c0c9b9b2',
  true
);
```

#### **Verificaciones Necesarias**:
```sql
-- Ver archivo: CONFIGURACION_SUPABASE_ELECTROMECANICO.sql
-- Contiene todas las consultas de verificación y configuración
```

## 🚀 Estado de Implementación

### **✅ Completado**
- [x] Adaptación a la estructura real de la tabla `informe_electromecanico`
- [x] Configuración en App.js (mapeos, componentes, validaciones)
- [x] Soporte en pdfService.js (generación especializada)  
- [x] ✨ **Formulario existente identificado**: ID `2364b1f7-069e-4416-9852-1755c0c9b9b2`
- [x] Script de verificación y configuración de Supabase creado
- [x] Documentación actualizada

### **🔄 Próximos Pasos**
- [ ] **Verificar servicio asociado** en tabla `servicios`
- [ ] **Crear servicio** si no existe (usar script proporcionado)
- [ ] **Verificar permisos RLS** en tabla `informe_electromecanico`
- [ ] **Probar funcionamiento** completo en la aplicación
- [ ] Configurar bucket de storage si es necesario

## 📱 Uso del Formulario

### **Flujo de Trabajo**
1. **Técnico** recibe orden de mantenimiento electromecánico
2. **Completa campos** del estado de componentes eléctricos y mecánicos
3. **Toma fotografías** de cada componente (ANTES/PROCESO/DESPUÉS)
4. **Registra mediciones** técnicas (amperaje, voltaje, etc.)
5. **Agrega observaciones** específicas del servicio
6. **Genera PDF** profesional del informe
7. **Envía por email** al cliente automáticamente

### **Ventajas del Nuevo Formulario**
- ✅ **Especializado** en sistemas electromecánicos
- ✅ **Campos específicos** para mediciones técnicas
- ✅ **Organización clara** por tipo de componente
- ✅ **PDF profesional** con tabla de diagnóstico especializada
- ✅ **Compatibilidad total** con el sistema existente

## 🔗 Archivos Relacionados
- **Tabla existente**: `public.informe_electromecanico` en Supabase
- **Formulario existente**: ID `2364b1f7-069e-4416-9852-1755c0c9b9b2` en tabla `formularios`
- `App.js` - Configuración principal del formulario
- `services/pdfService.js` - Generación de PDF especializado
- `CONFIGURACION_SUPABASE_ELECTROMECANICO.sql` - Script de verificación y configuración
- Este archivo de documentación

---

**Fecha de creación**: Octubre 17, 2025  
**Estado**: ✅ **LISTO PARA USO** - Formulario identificado, código adaptado, falta verificar servicio asociado