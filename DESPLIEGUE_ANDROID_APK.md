# 🤖 GUÍA COMPLETA: DESPLIEGUE ANDROID APK

## 📋 RESUMEN
Esta guía documenta el proceso completo para crear y desplegar APKs de Android usando Expo EAS CLI, permitiendo instalar la aplicación directamente en dispositivos Android sin necesidad de Google Play Store.

---

## 🔧 PRERREQUISITOS

### ✅ Herramientas Necesarias
```powershell
# Instalar herramientas globales
npm install -g @expo/cli eas-cli
```

### ✅ Configuración Inicial
- **Cuenta Expo Developer** configurada
- **Proyecto Expo configurado** con `eas.json`
- **Acceso a terminal/PowerShell**
- **Dispositivos Android para testing**

---

## 🚀 PROCESO PASO A PASO

### **PASO 1: Configuración Inicial de EAS**

```powershell
# Configurar EAS Build (solo primera vez)
eas build:configure
```

**Respuesta esperada:**
- Seleccionar "All platforms"
- Mensaje: "Your project is ready to build"

### **PASO 2: Login en EAS**

```powershell
# Iniciar sesión en EAS
eas login
```

**Credenciales:**
- Email: `grace.cid@gmail.com`
- Password: [Tu contraseña de Expo]

### **PASO 3: Verificar Configuración del Proyecto**

Asegurar que `app.json` tenga la configuración de Android correcta:

```json
{
  "expo": {
    "name": "PMLink Técnico",
    "slug": "pmlinktecnico",
    "version": "1.5.0",
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.pmlink.tecnico",
      "versionCode": 1,
      "compileSdkVersion": 34,
      "targetSdkVersion": 34,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO"
      ]
    }
  }
}
```

### **PASO 4: Crear Build APK para Android**

```powershell
# Crear APK para distribución directa
eas build --platform android --profile production-apk
```

#### **4.1 Configuración Automática de Credenciales**

**EAS manejará automáticamente:**
- ✅ **Keystore remoto:** Expo server maneja las credenciales
- ✅ **Certificados Android:** Generación automática
- ✅ **Firma de aplicación:** Proceso automático

**Salida esperada:**
```
✔ Using remote Android credentials (Expo server)
✔ Using Keystore from configuration: Build Credentials [ID] (default)
```

### **PASO 5: Proceso de Build**

**Tiempo estimado:** 3-5 minutos

**Progreso típico:**
```
Compressing project files and uploading to EAS Build
✔ Compressed project files (735 KB)
✔ Uploaded to EAS
✔ Computed project fingerprint

Waiting for build to complete...
✔ Build finished

🤖 Android app:
https://expo.dev/artifacts/eas/[ARTIFACT-ID].apk
```

---

## 📱 DISTRIBUCIÓN E INSTALACIÓN

### **Método 1: Enlace Directo (Más Común)**

1. **Obtener enlace APK** del resultado del build
2. **Compartir enlace** con usuarios finales
3. **Usuarios descargan APK** directamente
4. **Instalar** habilitando "Fuentes desconocidas"

### **Método 2: Descarga Manual**

1. **Acceder al enlace** desde el dispositivo Android
2. **Descargar archivo APK** 
3. **Abrir archivo descargado**
4. **Seguir instrucciones** de instalación

### **PASO ADICIONAL: Habilitar Fuentes Desconocidas**

Para instalar APK fuera de Google Play Store:

1. **Configuración** → **Seguridad**
2. **Activar "Fuentes desconocidas"** o **"Instalar apps desconocidas"**
3. **Confirmar** la acción
4. **Proceder con instalación**

---

## 🏪 DISTRIBUCIÓN GOOGLE PLAY STORE (OPCIONAL)

### **Para Google Play Store usar AAB:**

```powershell
# Crear Android App Bundle para Google Play
eas build --platform android --profile production
```

**Diferencias:**
- **APK (.apk):** Instalación directa, distribución manual
- **AAB (.aab):** Solo para Google Play Store, optimizado

### **Submit a Google Play Store:**

```powershell
# Subir automáticamente a Play Store
eas submit --platform android
```

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### **❌ Error: "No se puede instalar la aplicación"**

**Causa:** Fuentes desconocidas deshabilitadas

**Solución:**
1. Ir a **Configuración → Seguridad**
2. **Habilitar "Fuentes desconocidas"**
3. **Reintentar instalación**

### **❌ Error: "Aplicación no instalada"**

**Causa:** Versión anterior instalada con diferente firma

**Solución:**
1. **Desinstalar versión anterior** completamente
2. **Limpiar caché** si es necesario
3. **Instalar nueva versión**

### **❌ Error: Build fallido**

**Causa:** Problemas de configuración o dependencias

**Solución:**
```powershell
# Ver logs detallados del build
eas build:view [BUILD-ID]

# Limpiar y reintentar
npm install
eas build --platform android --profile production-apk --clear-cache
```

### **❌ Error: Keystore/Credenciales**

**Causa:** Problemas con credenciales de firma

**Solución:**
```powershell
# Verificar credenciales
eas credentials

# Regenerar si es necesario
eas credentials --platform android
```

---

## 🔄 COMANDOS DE REFERENCIA RÁPIDA

### **Builds Android**

```powershell
# APK para distribución directa
eas build --platform android --profile production-apk

# AAB para Google Play Store
eas build --platform android --profile production

# Build con caché limpio
eas build --platform android --profile production-apk --clear-cache

# Listar builds Android
eas build:list --platform android --limit 5
```

### **Gestión y Verificación**

```powershell
# Ver detalles de build específico
eas build:view [BUILD-ID]

# Estado del proyecto
eas project:info

# Configuración de credenciales
eas credentials --platform android

# Submit a Google Play
eas submit --platform android
```

---

## 📋 CONFIGURACIONES IMPORTANTES

### **Perfiles en `eas.json`**

```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    },
    "production-apk": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### **Package Name**
- **Único y consistente:** `com.pmlink.tecnico`
- **Debe coincidir** entre `app.json` y Google Play Console (si se usa)

---

## 🎯 CHECKLIST FINAL

### ✅ **Pre-Build**
- [ ] EAS CLI instalado y configurado
- [ ] Login exitoso en Expo
- [ ] `app.json` con configuración Android correcta
- [ ] Permisos Android declarados correctamente

### ✅ **Build Process**
- [ ] Usar profile correcto (`production-apk` para APK directa)
- [ ] Verificar credenciales Android automáticas
- [ ] Build completado exitosamente
- [ ] Enlace de descarga APK recibido

### ✅ **Post-Build**
- [ ] APK descargado y verificado
- [ ] Testing en dispositivos Android objetivo
- [ ] Instalación manual exitosa
- [ ] App funcionando correctamente
- [ ] Distribución a usuarios finales

---

## 📊 TIPOS DE BUILD Y SUS USOS

### **🎯 Cuándo usar cada perfil:**

#### **`production-apk` (Recomendado para distribución directa)**
- **Uso:** Distribución directa a usuarios
- **Formato:** APK (.apk)
- **Instalación:** Manual en dispositivos
- **Ventajas:** Control total, distribución inmediata

#### **`production` (Para Google Play Store)**
- **Uso:** Subir a Google Play Store
- **Formato:** AAB (.aab) 
- **Instalación:** A través de Google Play
- **Ventajas:** Optimización automática, actualizaciones automáticas

#### **`preview` (Para testing)**
- **Uso:** Testing interno rápido
- **Formato:** APK (.apk)
- **Instalación:** Manual en dispositivos
- **Ventajas:** Build rápido para pruebas

---

## 📞 INFORMACIÓN DEL PROYECTO

**Proyecto:** PMLink Técnico
**Package Name:** com.pmlink.tecnico
**Cuenta Expo:** @gracecid/pmlinktecnico
**Version Code:** 1
**Target SDK:** 34

### **Build Exitoso de Referencia**
- **Build ID:** `89b6fb72-d41b-4806-8075-faed2fdd3353`
- **Enlace APK:** `https://expo.dev/artifacts/eas/i1jS5zkdHKnLyvvaqkuvZ6.apk`
- **Tamaño:** ~735 KB comprimido
- **Perfil:** production-apk
- **Fecha:** 25 de Enero, 2026

### **Para futuras actualizaciones:**
1. Incrementar `versionCode` en `app.json`
2. Incrementar `version` en `app.json`
3. Repetir proceso de build
4. Distribuir nuevo enlace APK

---

## 🔗 ENLACES ÚTILES

- **Expo Documentation:** https://docs.expo.dev/build/introduction/
- **EAS Build Guide:** https://docs.expo.dev/build/setup/
- **Android Developer:** https://developer.android.com/
- **Google Play Console:** https://play.google.com/console/

---

## 📝 VENTAJAS DEL DESPLIEGUE ANDROID

### **✅ Beneficios vs iOS:**
- **Sin necesidad de cuenta de desarrollador** pagada
- **Instalación directa** sin restricciones
- **Distribución inmediata** sin revisión
- **Proceso más simple** sin certificados complejos
- **Testing más fácil** en múltiples dispositivos

### **✅ Casos de Uso Ideales:**
- **Apps empresariales internas**
- **Distribución controlada**
- **Testing con usuarios reales**
- **Lanzamientos beta**
- **Apps que no van a stores públicas**

---

## 📱 INSTRUCCIONES PARA USUARIOS FINALES

### **Cómo instalar el APK:**

1. **Recibir enlace** del desarrollador
2. **Abrir enlace** en navegador Android
3. **Descargar archivo APK**
4. **Abrir archivo descargado**
5. **Permitir instalación** desde fuentes desconocidas si se solicita
6. **Seguir proceso** de instalación
7. **Buscar app** en launcher de aplicaciones

### **Mensaje para usuarios:**
```
¡Hola! Te comparto la app PMLink Técnico:

🔗 Enlace: [URL del APK]

📱 Para instalar:
1. Abre el enlace en tu celular Android
2. Descarga el archivo
3. Instala (permitir fuentes desconocidas si pregunta)
4. ¡Listo para usar!

Si tienes problemas, avísame.
```

---

*Última actualización: 25 de Enero, 2026*
*Versión de la app: 1.5.0*
*Build APK exitoso: 89b6fb72-d41b-4806-8075-faed2fdd3353*
*Enlace de distribución: https://expo.dev/artifacts/eas/i1jS5zkdHKnLyvvaqkuvZ6.apk*