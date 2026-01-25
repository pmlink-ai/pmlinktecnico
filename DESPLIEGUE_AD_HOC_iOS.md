# 📱 GUÍA COMPLETA: DESPLIEGUE AD HOC PARA iOS

## 📋 RESUMEN
Esta guía documenta el proceso completo para crear y desplegar builds Ad Hoc de iOS usando Expo EAS CLI, permitiendo instalar la aplicación directamente en dispositivos iOS sin necesidad de App Store o TestFlight.

---

## 🔧 PRERREQUISITOS

### ✅ Herramientas Necesarias
```powershell
# Instalar herramientas globales
npm install -g @expo/cli eas-cli
```

### ✅ Configuración Inicial
- **Cuenta de Apple Developer** (Individual o Enterprise)
- **Proyecto Expo configurado** con `eas.json`
- **Acceso a terminal/PowerShell**
- **Dispositivos iOS para testing**

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

Asegurar que `app.json` tenga la configuración de iOS correcta:

```json
{
  "expo": {
    "name": "PMLink Técnico",
    "slug": "pmlinktecnico",
    "version": "1.5.0",
    "ios": {
      "bundleIdentifier": "com.pmlink.tecnico",
      "infoPlist": {
        "NSCameraUsageDescription": "Esta aplicación necesita acceso a la cámara para tomar fotos de los informes de mantenimiento.",
        "NSPhotoLibraryUsageDescription": "Esta aplicación necesita acceso a la galería para seleccionar fotos para los informes de mantenimiento.",
        "ITSAppUsesNonExemptEncryption": false
      }
    }
  }
}
```

### **PASO 4: Crear Build Ad Hoc para Dispositivos Físicos**

```powershell
# Crear build específico para dispositivos físicos
eas build --platform ios --profile device
```

#### **4.1 Proceso de Autenticación Apple**

**Login Apple ID:**
- Apple ID: `grace.cid@gmail.com`
- Password: [Tu contraseña de Apple ID]

**Verificación 2FA:**
- Método: device / sms
- Código de 6 dígitos del dispositivo/SMS

#### **4.2 Configuración de Certificados**

**EAS preguntará:**
- ✅ "Generate a new Apple Distribution Certificate?" → **YES**
- ✅ "Generate a new Apple Provisioning Profile?" → **YES**

#### **4.3 Selección de Dispositivos**

**Importante:** EAS detectará automáticamente el dispositivo conectado:
- Ejemplo: `00008030-000D34E41E98402E (iPhone 11)`
- Seleccionar el dispositivo donde se instalará

### **PASO 5: Esperar Completación del Build**

**Tiempo estimado:** 5-8 minutos

**Resultado exitoso:**
```
✔ Build finished

🍏 Open this link on your iOS devices (or scan the QR code) to install the app:
https://expo.dev/accounts/gracecid/projects/pmlinktecnico/builds/[BUILD-ID]
```

---

## 📱 INSTALACIÓN EN DISPOSITIVOS

### **Método 1: Enlace Directo (Recomendado)**

1. **Abrir Safari** en el dispositivo iOS objetivo
2. **Navegar al enlace** proporcionado por EAS
3. **Buscar botón "Install"** en la página de Expo
4. **Tocar "Install"** y confirmar instalación

### **Método 2: Código QR**

1. **Abrir aplicación Cámara** en iOS
2. **Escanear el QR code** mostrado en terminal
3. **Tocar la notificación** que aparece
4. **Seguir instrucciones** de instalación

### **PASO ADICIONAL: Configurar Confianza de Desarrollador**

Si aparece error de "Desarrollador no confiable":

1. **Configuración** → **General** → **Gestión de perfiles y dispositivos**
2. Buscar **"Grace Marlene Cid Riquelme"**
3. **Tocar** el perfil
4. **Seleccionar "Confiar en Grace Marlene Cid Riquelme"**
5. **Confirmar "Confiar"**

---

## ⚠️ PROBLEMAS COMUNES Y SOLUCIONES

### **❌ Error: "No se puede instalar la app"**

**Causa:** Build incorrecto (simulador vs dispositivo)

**Solución:**
- Verificar que el build sea para "device" profile
- NO usar builds que digan "iOS simulator build"
- Usar solo enlaces de builds con "Distribution: internal"

### **❌ Error: "Perfil descargado" no aparece**

**Causa:** Descarga incompleta del perfil

**Solución:**
1. Usar **solo Safari** (no Chrome/otros navegadores)
2. Asegurar buena conexión a internet
3. Reintentar descarga del enlace completo

### **❌ Error: Device UDID no registrado**

**Causa:** Dispositivo no incluido en provisioning profile

**Solución:**
```powershell
# Registrar dispositivo manualmente
eas device:create

# Luego rebuild
eas build --platform ios --profile device
```

### **❌ Error: Build para simulador en lugar de dispositivo**

**Causa:** Perfil incorrecto o configuración errónea

**Identificación:**
- Build dice "iOS simulator build"
- Archivo descarga `.tar.gz` en lugar de `.ipa`
- No aparece botón "Install" en Safari

**Solución:**
```powershell
# Usar profile específico para dispositivos
eas build --platform ios --profile device
```

---

## 🔄 COMANDOS DE REFERENCIA RÁPIDA

### **Builds y Gestión**

```powershell
# Listar builds recientes
eas build:list --platform ios --limit 5

# Ver detalles de build específico
eas build:view [BUILD-ID]

# Crear nuevo build Ad Hoc
eas build --platform ios --profile device

# Crear APK Android
eas build --platform android --profile production-apk
```

### **Gestión de Dispositivos**

```powershell
# Listar dispositivos registrados
eas device:list

# Registrar nuevo dispositivo
eas device:create

# Ver detalles del proyecto
eas project:info
```

---

## 📋 CONFIGURACIONES IMPORTANTES

### **Perfiles en `eas.json`**

```json
{
  "build": {
    "device": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "autoIncrement": true
      }
    }
  }
}
```

### **Bundle Identifier**
- **Único y consistente:** `com.pmlink.tecnico`
- **Debe coincidir** entre `app.json` y Apple Developer account

---

## 🎯 CHECKLIST FINAL

### ✅ **Pre-Build**
- [ ] EAS CLI instalado y configurado
- [ ] Login exitoso en Expo y Apple Developer
- [ ] `app.json` con configuración iOS correcta
- [ ] Dispositivos objetivo identificados

### ✅ **Build Process**
- [ ] Usar profile "device" para Ad Hoc (NO "preview")
- [ ] Verificar autenticación Apple 2FA
- [ ] Confirmar generación de certificados
- [ ] Seleccionar dispositivos correctos
- [ ] Build completado exitosamente

### ✅ **Post-Build**
- [ ] Enlace de instalación recibido
- [ ] QR code generado
- [ ] Verificar que NO sea build de simulador
- [ ] Testing en dispositivos objetivo
- [ ] Configuración de confianza de desarrollador
- [ ] App funcionando correctamente

---

## 🔍 VERIFICACIONES IMPORTANTES

### **Identificar Build Correcto vs Incorrecto**

#### ✅ **Build CORRECTO (Ad Hoc)**
- Profile: `device`
- Distribution: `internal`
- Platform: `iOS`
- Archivo: `.ipa`
- Botón: **"Install"** en Safari
- Devices: Lista específica de UDIDs

#### ❌ **Build INCORRECTO (Simulador)**
- Profile: `preview` o `simulator`
- Distribution: `internal`
- Platform: `iOS`
- Archivo: `.tar.gz`
- Botón: **"Download"** (no "Install")
- Devices: No específico, para simulador

---

## 📞 INFORMACIÓN DEL PROYECTO

**Proyecto:** PMLink Técnico
**Desarrollador:** Grace Marlene Cid Riquelme
**Apple Team ID:** C722539ZG3
**Bundle ID:** com.pmlink.tecnico
**Cuenta Expo:** @gracecid/pmlinktecnico

### **Builds Exitosos de Referencia**
- **Android APK:** `89b6fb72-d41b-4806-8075-faed2fdd3353`
- **iOS Ad Hoc:** `f7bc2d1f-8f06-445a-8138-fe9a42f72f0d`

### **Para futuras actualizaciones:**
1. Incrementar version en `app.json`
2. Repetir proceso de build con profile correcto
3. Distribuir nuevo enlace de instalación

---

## 🔗 ENLACES ÚTILES

- **Expo Documentation:** https://docs.expo.dev/build/introduction/
- **EAS Build Guide:** https://docs.expo.dev/build/setup/
- **Apple Developer:** https://developer.apple.com/
- **Troubleshooting:** https://docs.expo.dev/build/troubleshooting/

---

## 📝 NOTAS DE LA SESIÓN

### **Lecciones Aprendidas**
- El profile `preview` por defecto crea builds para simulador
- Usar específicamente `device` profile para Ad Hoc
- Safari es el único navegador confiable para instalación iOS
- La autenticación 2FA de Apple es obligatoria
- EAS detecta automáticamente dispositivos conectados

### **Comandos Utilizados Exitosamente**
```powershell
npm install -g @expo/cli eas-cli
eas build:configure
eas build --platform android --profile production-apk
eas build --platform ios --profile production
eas build --platform ios --profile device  # ← COMANDO CORRECTO
eas build:list --platform ios --limit 3
```

---

*Última actualización: 25 de Enero, 2026*
*Versión de la app: 1.5.0*
*Build Ad Hoc exitoso: f7bc2d1f-8f06-445a-8138-fe9a42f72f0d*
*Dispositivo registrado: iPhone 11 (00008030-000D34E41E98402E)*