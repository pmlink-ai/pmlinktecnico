# DOCUMENTACIÓN COMPLETA - FORMULARIO ANSUL R-102

## 📋 ÍNDICE
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estructura del Formulario](#estructura-del-formulario)
3. [Sistema de Validaciones](#sistema-de-validaciones)
4. [Generación de PDF](#generación-de-pdf)
5. [Configuración de Base de Datos](#configuración-de-base-de-datos)
6. [Implementación Técnica](#implementación-técnica)
7. [Flujo de Usuario](#flujo-de-usuario)
8. [Archivos Modificados](#archivos-modificados)
9. [Referencias Técnicas](#referencias-técnicas)

---

## 🎯 RESUMEN EJECUTIVO

El formulario ANSUL R-102 es un sistema completo de inspección y mantenimiento de sistemas de supresión de incendios con las siguientes características:

- **7 secciones con validación obligatoria**
- **Sistema de fotografías organizadas por componente**
- **Validación progresiva antes del guardado**
- **Generación de PDF con formato específico ANSUL**
- **DatePicker modal para fecha de inicio**
- **Campos obligatorios con indicadores visuales**

---

## 🏗️ ESTRUCTURA DEL FORMULARIO

### Componentes Principales

```javascript
// Estructura en App.js líneas 84-99
const componentesAnsulR102 = [
  { key: 'Cartuchos_Gas', title: 'Recambio de fusibles térmicos', icon: '🔥' },
  { key: 'Boquillas_Sistema', title: 'Válvula de gas', icon: '🚿' },
  { key: 'Panel_Control', title: 'Alimentación eléctrica', icon: '⚡' },
  { key: 'Pruebas_Sistema', title: 'Panel de alarma / si aplicara', icon: '🚨' },
  { key: 'Canerias_Distribucion', title: 'Prueba de ruptura de fusible de prueba', icon: '🔧' },
  { key: 'Cilindro_Agente', title: 'Cilindro agente extintor / ansulex', icon: '🧯' },
  { key: 'Prueba_Neumatica', title: 'Prueba neumatica a cañerias de distribución', icon: '🔧' },
  { key: 'Tipo_Cartucho', title: 'Tipo de cartucho expulsor, cantidad y su peso', icon: '📦' },
  { key: 'Recibo_Conforme', title: 'Recibo Conforme', icon: '✅' }
];
```

### Mapeo de Componentes a Carpetas de Storage

```javascript
// Configuración en services/pdfService.js líneas 14-23
const componentToFolderMap = {
  'Cartuchos_Gas': 'RECAMBIO_FUSIBLES_TERMICOS',
  'Canerias_Distribucion': 'PRUEBA_RUPTURA_FUSIBLE',
  'Cilindro_Agente': 'CILINDRO_AGENTE_EXTINTOR',
  'Boquillas_Sistema': 'VALVULA_GAS', 
  'Panel_Control': 'ALIMENTACION_ELECTRICA',
  'Pruebas_Sistema': 'PANEL_ALARMA',
  'Prueba_Neumatica': 'PRUEBA_NEUMATICA_CANERIAS',
  'Tipo_Cartucho': 'TIPO_CARTUCHO_EXPULSOR',
  'Recibo_Conforme': 'RECIBO_CONFORME'
};
```

---

## ✅ SISTEMA DE VALIDACIONES

### 1. RECAMBIO DE FUSIBLES TÉRMICOS (Cartuchos_Gas)
```javascript
// Función: isCartuchosGasCompleteForm() - línea 2135
Validaciones:
- Fotografía ANTES (mínimo 1)
- Fotografía DESPUÉS (mínimo 1) 
- Campo "OBSERVACIONES" obligatorio
```

### 2. VÁLVULA DE GAS (Boquillas_Sistema)
```javascript
// Función: isBoquillasSistemaCompleteForm() - línea 2219
Validaciones:
- Fotografía obligatoria
- Campo "MEDIDA DE TOMA" obligatorio
```

### 3. ALIMENTACIÓN ELÉCTRICA (Panel_Control)
```javascript
// Función: isPanelControlCompleteForm() - línea 2276
Validaciones:
- Fotografía obligatoria
- Campo "ESTADO" obligatorio
```

### 4. PANEL DE ALARMA (Pruebas_Sistema)
```javascript
// Función: isPruebasSistemaCompleteForm() - línea 2333
Validaciones:
- Fotografía obligatoria
- Campo "ESTADO Y OBSERVACIONES" obligatorio
```

### 5. PRUEBA NEUMÁTICA A CAÑERÍAS (Prueba_Neumatica)
```javascript
// Función: isPruebaNeumaticaCompleteForm() - línea 2557
Validaciones:
- Fotografía obligatoria
- Campo "ESTADO Y OBSERVACIONES" obligatorio
```

### 6. TIPO DE CARTUCHO EXPULSOR (Tipo_Cartucho)
```javascript
// Función: isTipoCartuchoCompleteForm() - línea 2631
Validaciones:
- Fotografía obligatoria  
- Campo "ESTADO Y OBSERVACIONES" obligatorio
```

### 7. RECIBO CONFORME (Recibo_Conforme)
```javascript
// Función: isReciboConformeCompleteForm() - línea 2689
Validaciones:
- Fotografía de conformidad obligatoria
```

### Flujo de Validación en handleSubmit

```javascript
// Secuencia en handleSubmit() - líneas 2779-3301
if (informeTabla === 'informe_ansul_r102') {
  1. Validación Cartuchos_Gas
  2. Validación Boquillas_Sistema  
  3. Validación Panel_Control
  4. Validación Pruebas_Sistema
  5. Validación Prueba_Neumatica
  6. Validación Tipo_Cartucho
  7. Validación Recibo_Conforme
}
```

---

## 📄 GENERACIÓN DE PDF

### Configuración Específica ANSUL R-102

```javascript
// services/pdfService.js - función generateAnsulR102PDF()
Características:
- Encabezado con logo ANSUL vs PMDUC según cliente
- Campos específicos del formulario ANSUL
- Organización de fotografías por componente
- Formato de secciones especializado
- Mapeo de observaciones por componente
```

### Estructura del PDF

```html
<!-- Encabezado -->
<div class="header">
  <img src="${logoUrl}" class="logo" alt="Logo" />
  <div class="title-section">
    <h1>INFORME ANSUL R-102</h1>
    <h2>SISTEMA DE SUPRESIÓN DE INCENDIOS</h2>
  </div>
</div>

<!-- Campos del formulario -->
<div class="form-section">
  <!-- 83 campos específicos mapeados -->
</div>

<!-- Fotografías organizadas -->
<div class="photos-section">
  <!-- Por cada componente con fotografías -->
</div>
```

### Mapeo de Campos del Formulario

```javascript
// 83 campos específicos del ANSUL R-102
const fieldLabels = {
  'orden_trabajo_id': 'N° ORDEN DE TRABAJO',
  'cliente': 'CLIENTE',
  'fecha_inicio': 'FECHA DE INICIO',
  'nombre_local': 'NOMBRE DEL LOCAL',
  // ... 79 campos más específicos
};
```

---

## 💾 CONFIGURACIÓN DE BASE DE DATOS

### Tabla Principal: informe_ansul_r102

```sql
-- Campos principales agregados
ALTER TABLE informe_ansul_r102 ADD COLUMN cliente TEXT;
ALTER TABLE informe_ansul_r102 ADD COLUMN fecha_inicio DATE;
ALTER TABLE informe_ansul_r102 ADD COLUMN nombre_local TEXT NOT NULL;
```

### Tablas de Soporte

```sql
-- informe_fotografias: Almacena las fotografías
-- observaciones_fotografias: Almacena observaciones por componente
-- Ambas con estructura: orden_trabajo_id, componente, seccion
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### Componentes de Renderizado Especiales

```javascript
// App.js - Funciones especializadas
1. renderCartuchosGasComponent() - línea 741
2. renderValvulaGasComponent() - línea 958  
3. renderAlimentacionElectricaComponent() - línea 1058
4. renderPanelAlarmaComponent() - línea 890
5. renderPruebaNeumaticaComponent() - línea 900
6. renderTipoCartuchoComponent() - línea 840
7. renderReciboConformeSection() - línea 1142
```

### DatePicker Modal

```javascript
// Implementación en App.js - líneas 1620-1660
- Modal con DateTimePicker
- Formato DD/MM/YYYY
- Validación de fechas
- Integración con formData.fecha_inicio
```

### Indicadores Visuales de Validación

```javascript
// Elementos visuales implementados:
- Bordes rojos para campos vacíos: borderColor: '#FF6B6B'
- Asteriscos (*) en títulos obligatorios
- Mensajes de error: "* Campo obligatorio"
- Texto de botones dinámico: "Fotografía Obligatoria"
```

---

## 👤 FLUJO DE USUARIO

### 1. Acceso al Formulario
```
Usuario selecciona orden → Elige "ANSUL R-102" → Carga estructura
```

### 2. Completar Datos Básicos
```
- Cliente (obligatorio)
- Fecha de inicio (DatePicker)
- Nombre del local (obligatorio)
- 80+ campos específicos del formulario
```

### 3. Fotografías por Sección
```
1. RECAMBIO DE FUSIBLES TÉRMICOS (ANTES/DESPUÉS + observaciones)
2. VÁLVULA DE GAS (fotografía + medida de toma)
3. ALIMENTACIÓN ELÉCTRICA (fotografía + estado)
4. PANEL DE ALARMA (fotografía + estado y observaciones)
5. PRUEBA NEUMÁTICA (fotografía + estado y observaciones)  
6. TIPO DE CARTUCHO (fotografía + estado y observaciones)
7. RECIBO CONFORME (fotografía de conformidad)
```

### 4. Validación y Guardado
```
Botón "Actualizar Datos" → Validación progresiva → Guardado → PDF
```

### 5. Generación de PDF
```
Botón "Generar PDF" (solo en página final) → PDF específico ANSUL R-102
```

---

## 📁 ARCHIVOS MODIFICADOS

### Archivos Principales

1. **App.js** (4906 líneas)
   - Sistema completo de validaciones
   - Renderizado especializado por componente
   - DatePicker modal
   - Manejo de fotografías y observaciones

2. **services/pdfService.js** (1039 líneas)
   - Función generateAnsulR102PDF()
   - Mapeo de componentes a carpetas
   - Estructura HTML específica
   - Sistema de logos dinámico

### Funciones Críticas a Preservar

```javascript
// NO MODIFICAR - Funciones específicas ANSUL R-102
- isCartuchosGasCompleteForm()
- isBoquillasSistemaCompleteForm() 
- isPanelControlCompleteForm()
- isPruebasSistemaCompleteForm()
- isPruebaNeumaticaCompleteForm()
- isTipoCartuchoCompleteForm()
- isReciboConformeCompleteForm()
- renderCartuchosGasComponent()
- renderValvulaGasComponent()
- renderAlimentacionElectricaComponent()
- renderPanelAlarmaComponent()
- renderPruebaNeumaticaComponent()
- renderTipoCartuchoComponent()
- renderReciboConformeSection()
- generateAnsulR102PDF()
```

---

## 🔗 REFERENCIAS TÉCNICAS

### Dependencias Utilizadas

```javascript
// React Native / Expo
- @react-native-community/datetimepicker (DatePicker)
- expo-print (Generación PDF)
- expo-sharing (Compartir PDF)
- expo-image-picker (Fotografías)

// Supabase
- Queries específicas por componente y sección
- Storage organizado por carpetas de componente
```

### Identificadores Únicos

```javascript
// Claves de componente (NO CAMBIAR)
'Cartuchos_Gas', 'Boquillas_Sistema', 'Panel_Control', 
'Pruebas_Sistema', 'Prueba_Neumatica', 'Tipo_Cartucho', 
'Recibo_Conforme'

// Secciones de fotografías
'ANTES', 'DESPUES', 'PROCESO', 'FOTO'

// Tabla de base de datos
'informe_ansul_r102'
```

### Configuraciones Críticas

```javascript
// Logos por cliente
const isAnsulClient = 
  clienteNombre?.toLowerCase().includes('ansul') || 
  clienteNombre?.toLowerCase().includes('r-102') ||
  clienteNombre?.toLowerCase().includes('r102');

// Validación por informe
if (informeTabla === 'informe_ansul_r102') {
  // Lógica específica ANSUL
}
```

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### 🚫 NO MODIFICAR
- Funciones de validación específicas (líneas 2135-2727)
- Componentes de renderizado especializados (líneas 740-1200)
- Mapeo de componentes a carpetas (pdfService.js líneas 14-23)
- Estructura de componentesAnsulR102 (App.js líneas 84-99)

### ✅ SEGURO PARA MODIFICAR
- Estilos CSS del PDF (mantener estructura HTML)
- Textos de mensajes de error/validación
- Colores de interfaz (mantener lógica de validación)
- Campos adicionales del formulario (agregar, no quitar)

### 🔄 PARA NUEVOS FORMULARIOS
1. Crear nuevas constantes de componentes
2. Nuevas funciones de validación con prefijo diferente
3. Nuevo archivo de servicio PDF o función separada
4. Nueva tabla de base de datos
5. Nuevos renderizadores con nombres únicos

---

## 📅 FECHA DE DOCUMENTACIÓN
**Creado:** 16 de Octubre de 2025
**Versión:** 1.0 - Implementación Completa
**Estado:** LISTO PARA PRODUCCIÓN ✅

---

*Esta documentación preserva toda la implementación del formulario ANSUL R-102 para referencia futura y prevención de modificaciones accidentales.*