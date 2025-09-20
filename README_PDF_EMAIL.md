# 📄 Funcionalidad de Generación de PDF y Email

## ✨ Nuevas Características Implementadas

### 🔧 **Generación de PDF**
- **Formato profesional** que replica el diseño del informe original
- **Incluye todas las secciones**: encabezado, datos del servicio, tabla de diagnóstico, fotografías organizadas por componentes
- **Fotografías organizadas** por componente (Campana 1, Campana 2, Ductos y Registros, Motores y Cubierta, Panorámica, Recibo Conforme)
- **Diseño responsive** optimizado para impresión en formato A4

### 📧 **Envío por Email**
- **Email con formato HTML** profesional con logo y branding
- **PDF adjunto** automáticamente
- **Información detallada** de la orden de trabajo en el cuerpo del email
- **Compatible** con todos los clientes de email del dispositivo

## 🚀 Cómo Usar

### **Paso 1: Completar el Formulario**
1. Abre una orden de trabajo
2. Presiona "Abrir Formulario" 
3. Completa todos los campos necesarios
4. Toma fotografías organizadas por componentes
5. **IMPORTANTE**: Presiona "Guardar Formulario" o "Actualizar Datos"

### **Paso 2: Generar PDF**
1. Una vez guardado el formulario, aparecerán dos nuevos botones:
   - 🔴 **"Generar PDF"** - Crea el PDF y permite compartirlo
   - 🔵 **"Enviar Email"** - Genera PDF y prepara email

### **Paso 3: Compartir**
- **Generar PDF**: Se abre el menú de compartir del dispositivo
- **Enviar Email**: Se abre el cliente de email con el PDF adjunto

## 📋 Estructura del PDF Generado

### **Encabezado**
- Logo PMDUC
- Título "INFORME LIMPIEZA DE DUCTOS"
- Número de referencia de la orden

### **Datos del Servicio**
- Información del cliente
- Fecha de inicio
- Nombre del local
- Asistencia de personal
- Horas de trabajo

### **Tabla de Diagnóstico**
- Estado de campanas, filtros, ductos, damper, drenajes
- Información de registros (local y techumbre)
- Detalles de motores: rejillas, cantidad, fuelle, correas, rodamientos
- Observaciones técnicas

### **Sección Fotográfica**
Fotografías organizadas por componente:
- **Campana 1**: Antes, Proceso, Después
- **Campana 2**: Antes, Proceso, Después  
- **Ductos y Registros**: Antes, Proceso, Después
- **Motores y Cubierta**: Antes, Proceso, Después
- **Panorámica y/o Sector**: Antes, Proceso, Después
- **Recibo Conforme**: Fotografía única de conformidad

## 🛠️ Dependencias Instaladas

```bash
# Dependencias para PDF
expo-print           # Generación de PDFs desde HTML
expo-sharing         # Compartir archivos

# Dependencias para Email  
expo-mail-composer   # Composición de emails con adjuntos
```

## 📱 Compatibilidad

### **Generación de PDF**
- ✅ **iOS**: Funciona completamente
- ✅ **Android**: Funciona completamente
- ✅ **Expo Go**: Compatible

### **Envío por Email**
- ✅ **iOS**: Requiere Mail app configurada
- ✅ **Android**: Requiere Gmail u otra app de email
- ⚠️ **Expo Go**: Funciona solo si hay cliente de email configurado

## 🔍 Debugging

### **Logs Importantes**
```javascript
// Generación de PDF
console.log('📄 Generando PDF para orden:', orderId);

// Envío de Email  
console.log('📧 Preparando email para orden:', orderId);

// Datos del formulario
console.log('📋 Obteniendo datos completos para PDF...');
```

### **Errores Comunes**
1. **"Guardar primero"**: El formulario debe estar guardado antes de generar PDF
2. **"Email no disponible"**: El dispositivo no tiene cliente de email configurado
3. **Error de permisos**: Verificar permisos de almacenamiento

## 🎨 Personalización

### **Modificar Estilos del PDF**
Editar función `getPDFStyles()` en `/services/pdfService.js`

### **Cambiar Template del Email**
Editar función `generateEmailBody()` en `/services/emailService.js`

### **Agregar Nuevos Componentes**
Modificar `componentTitles` en `generatePhotosSection()` del PDFService

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que el formulario esté guardado
2. Revisa los logs en la consola de Expo
3. Asegúrate de que el dispositivo tenga apps de email configuradas
4. Verifica que hay fotografías tomadas en cada componente

---

**✅ ¡La funcionalidad está lista para usar!** 

Ahora puedes generar informes PDF profesionales y enviarlos por email directamente desde la aplicación móvil.