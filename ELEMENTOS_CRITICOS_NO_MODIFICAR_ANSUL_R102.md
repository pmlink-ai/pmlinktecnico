# 🚫 ELEMENTOS CRÍTICOS - NO MODIFICAR

## ⚠️ ADVERTENCIA IMPORTANTE
**Este documento lista todos los elementos que NO deben ser modificados para preservar la funcionalidad del formulario ANSUL R-102.**

---

## 📁 App.js - FUNCIONES CRÍTICAS

### 🔒 FUNCIONES DE VALIDACIÓN (LÍNEAS 2135-2727)
```javascript
// ❌ NO MODIFICAR ESTAS FUNCIONES
isCartuchosGasCompleteForm()          // Línea 2135
isBoquillasSistemaCompleteForm()      // Línea 2219  
isPanelControlCompleteForm()          // Línea 2276
isPruebasSistemaCompleteForm()        // Línea 2333
isPruebaNeumaticaCompleteForm()       // Línea 2557
isTipoCartuchoCompleteForm()          // Línea 2631
isReciboConformeCompleteForm()        // Línea 2689
```

### 🔒 COMPONENTES DE RENDERIZADO ESPECIAL (LÍNEAS 740-1200)
```javascript
// ❌ NO MODIFICAR ESTAS FUNCIONES
renderCartuchosGasComponent()         // Línea 741
renderTipoCartuchoComponent()         // Línea 840
renderPanelAlarmaComponent()          // Línea 890
renderPruebaNeumaticaComponent()      // Línea 900
renderValvulaGasComponent()           // Línea 958
renderAlimentacionElectricaComponent() // Línea 1058
renderReciboConformeSection()         // Línea 1142
```

### 🔒 CONFIGURACIÓN DE COMPONENTES (LÍNEAS 84-99)
```javascript
// ❌ NO MODIFICAR ESTA ESTRUCTURA
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

### 🔒 MAPEO DE CARPETAS (LÍNEAS 50-70)
```javascript
// ❌ NO MODIFICAR ESTOS MAPEOS
const folderMappingAnsulR102 = {
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

### 🔒 LÓGICA DE VALIDACIÓN EN handleSubmit (LÍNEAS 2779-3301)
```javascript
// ❌ NO MODIFICAR ESTA SECUENCIA
if (informeTabla === 'informe_ansul_r102') {
  // Validación Cartuchos_Gas → Boquillas_Sistema → Panel_Control → 
  // Pruebas_Sistema → Prueba_Neumatica → Tipo_Cartucho → Recibo_Conforme
}
```

### 🔒 DATEПICKER MODAL (LÍNEAS 1620-1660)
```javascript
// ❌ NO MODIFICAR - Modal de fecha específico para ANSUL
{showDatePicker && (
  <Modal visible={showDatePicker} transparent animationType="slide">
    // Implementación específica con DateTimePicker
  </Modal>
)}
```

---

## 📁 services/pdfService.js - FUNCIONES CRÍTICAS

### 🔒 FUNCIÓN PRINCIPAL (LÍNEAS 450-650)
```javascript
// ❌ NO MODIFICAR ESTA FUNCIÓN COMPLETA
export const generateAnsulR102PDF = async (formData, informeId) => {
  // Toda la lógica de generación de PDF específica para ANSUL R-102
};
```

### 🔒 MAPEO DE COMPONENTES (LÍNEAS 14-23)
```javascript
// ❌ NO MODIFICAR ESTE MAPEO
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

### 🔒 CONFIGURACIÓN DE PDF ANSUL (LÍNEAS 950-990)
```javascript
// ❌ NO MODIFICAR - Estructura específica para ANSUL R-102
const structureAnsulR102 = [
  // Configuración completa de componentes y secciones
];
```

### 🔒 MAPEO DE CAMPOS (LÍNEAS 680-780)
```javascript
// ❌ NO MODIFICAR - 83 campos específicos del formulario ANSUL
const fieldLabels = {
  'orden_trabajo_id': 'N° ORDEN DE TRABAJO',
  'cliente': 'CLIENTE',
  'fecha_inicio': 'FECHA DE INICIO',
  // ... 80 campos más
};
```

---

## 🔑 IDENTIFICADORES ÚNICOS

### 🔒 CLAVES DE COMPONENTE
```javascript
// ❌ NO CAMBIAR ESTOS STRINGS
'Cartuchos_Gas'
'Boquillas_Sistema' 
'Panel_Control'
'Pruebas_Sistema'
'Prueba_Neumatica'
'Tipo_Cartucho'
'Recibo_Conforme'
```

### 🔒 NOMBRES DE SECCIÓN
```javascript
// ❌ NO CAMBIAR ESTOS STRINGS
'ANTES'
'DESPUES' 
'PROCESO'
'FOTO'
```

### 🔒 NOMBRE DE TABLA
```javascript
// ❌ NO CAMBIAR ESTE STRING
'informe_ansul_r102'
```

---

## 📱 ELEMENTOS DE INTERFAZ CRÍTICOS

### 🔒 ESTILOS DE VALIDACIÓN
```javascript
// ❌ NO MODIFICAR - Colores específicos para validación
borderColor: '#FF6B6B'  // Rojo para campos vacíos
color: '#FF6B6B'        // Texto de error
'* Campo obligatorio'   // Mensaje estándar
'* Fotografía obligatoria' // Mensaje de foto
```

### 🔒 TEXTO DE BOTONES DINÁMICO
```javascript
// ❌ NO MODIFICAR - Lógica de texto de botones
{images.length === 0 ? 'Fotografía Obligatoria' : 'Subir Fotografía'}
```

### 🔒 TÍTULOS CON ASTERISCO
```javascript
// ❌ NO MODIFICAR - Títulos que indican campos obligatorios
'FOTOGRAFÍA *'
'ESTADO Y OBSERVACIONES: *'
'OBSERVACIONES: *'
'MEDIDA DE TOMA: *'
'ESTADO: *'
```

---

## 🗃️ ESTRUCTURA DE BASE DE DATOS

### 🔒 CONSULTAS ESPECÍFICAS
```sql
-- ❌ NO MODIFICAR ESTAS ESTRUCTURAS DE QUERY
.eq('orden_trabajo_id', order.id)
.eq('componente', '[COMPONENTE_KEY]')  
.eq('seccion', '[SECCION]')
.eq('informe_tabla', 'informe_ansul_r102')
```

### 🔒 CAMPOS OBLIGATORIOS AGREGADOS
```sql
-- ❌ NO ELIMINAR ESTOS CAMPOS
ALTER TABLE informe_ansul_r102 ADD COLUMN cliente TEXT;
ALTER TABLE informe_ansul_r102 ADD COLUMN fecha_inicio DATE;  
ALTER TABLE informe_ansul_r102 ADD COLUMN nombre_local TEXT NOT NULL;
```

---

## 🎯 LÓGICA CONDICIONAL CRÍTICA

### 🔒 DETECCIÓN DE INFORME ANSUL
```javascript
// ❌ NO MODIFICAR - Identificación del tipo de informe
if (informeTabla === 'informe_ansul_r102') {
  // Lógica específica para ANSUL R-102
}
```

### 🔒 DETECCIÓN DE CLIENTE ANSUL
```javascript
// ❌ NO MODIFICAR - Detección de logo por cliente
const isAnsulClient = 
  clienteNombre?.toLowerCase().includes('ansul') || 
  clienteNombre?.toLowerCase().includes('r-102') ||
  clienteNombre?.toLowerCase().includes('r102');
```

### 🔒 RENDERIZADO CONDICIONAL POR COMPONENTE
```javascript
// ❌ NO MODIFICAR - Lógica de renderizado especial
if (componenteData.key === 'Cartuchos_Gas') { /* renderCartuchosGasComponent */ }
if (componenteData.key === 'Boquillas_Sistema') { /* renderValvulaGasComponent */ }
if (componenteData.key === 'Panel_Control') { /* renderAlimentacionElectricaComponent */ }
if (componenteData.key === 'Pruebas_Sistema') { /* renderPanelAlarmaComponent */ }
if (componenteData.key === 'Prueba_Neumatica') { /* renderPruebaNeumaticaComponent */ }
if (componenteData.key === 'Tipo_Cartucho') { /* renderTipoCartuchoComponent */ }
if (componenteData.key === 'Recibo_Conforme') { /* renderReciboConformeSection */ }
```

---

## ✅ QUÉ SÍ SE PUEDE MODIFICAR SAFELY

### 🟢 SEGUROS PARA CAMBIAR
- Textos de mensajes de error (mantener estructura)
- Colores de interfaz (mantener lógica de validación)
- Estilos CSS del PDF (mantener estructura HTML)
- Agregar nuevos campos al formulario (sin quitar existentes)
- Crear nuevos formularios con nombres diferentes

### 🟢 CÓMO AGREGAR NUEVOS FORMULARIOS
1. ✅ Crear nuevas constantes: `componentesNuevoFormulario`
2. ✅ Nuevas funciones: `isNuevoComponenteCompleteForm`
3. ✅ Nuevos renderizadores: `renderNuevoComponenteComponent`  
4. ✅ Nueva función PDF: `generateNuevoFormularioPDF`
5. ✅ Nueva tabla: `informe_nuevo_formulario`

---

## 🚨 CONSECUENCIAS DE MODIFICAR ELEMENTOS CRÍTICOS

### Si se modifica una función de validación:
- ❌ Pérdida de validación obligatoria
- ❌ Formularios incompletos guardados
- ❌ PDFs con datos faltantes

### Si se cambian las claves de componente:
- ❌ Pérdida de fotografías existentes
- ❌ Observaciones huérfanas
- ❌ PDF sin estructura correcta

### Si se modifica la estructura del PDF:
- ❌ Formato incorrecto para clientes ANSUL
- ❌ Pérdida de organización de fotografías
- ❌ Logo incorrecto

---

**🔒 RESUMEN: MANTENER ESTAS IMPLEMENTACIONES INTACTAS GARANTIZA LA FUNCIONALIDAD COMPLETA DEL FORMULARIO ANSUL R-102**

**FECHA:** 16 de Octubre de 2025  
**VERSIÓN:** 1.0 - Lista de Elementos Críticos  
**ESTADO:** PROTECCIÓN DOCUMENTADA ✅