# 🚀 GUÍA PASO A PASO - TU PRIMERA APP MÓVIL

## 📱 PASO 1: Crear cuenta en Expo

1. Ve a https://expo.dev
2. Clic en "Sign up"
3. Crea una cuenta gratuita
4. **Importante**: Anota tu username de Expo

## 🔧 PASO 2: Instalar herramientas necesarias

Ejecuta estos comandos en PowerShell:

```powershell
# Instalar Expo CLI globalmente
npm install -g @expo/eas-cli

# Verificar instalación
eas --version
```

## 🔐 PASO 3: Hacer login desde tu proyecto

```powershell
# Navegar a tu proyecto
cd "D:\Visual Studio Code\PMLINK\pmlinktecnico"

# Login a Expo
eas login
# Te pedirá usuario y contraseña de Expo
```

## ⚙️ PASO 4: Configurar tu proyecto para Expo

```powershell
# Configurar EAS Build
eas build:configure

# Esto creará automáticamente el archivo eas.json
```

## 📋 PASO 5: Crear tu primera build de prueba

```powershell
# Para Android (más fácil para empezar)
eas build --platform android --profile preview

# Te dará un QR code y link para descargar
```

---

## 🎯 RESULTADO ESPERADO:

- ✅ Tendrás un archivo APK para instalar en Android
- ✅ Link para compartir con tu equipo
- ✅ La app funcionará como standalone (sin Expo Go)

## 📱 PARA PROBAR:

1. Descarga el APK generado
2. Instálalo en tu Android (activa "Apps desconocidas" en settings)
3. Prueba todas las funciones

## ⏱️ TIEMPO ESTIMADO:
- Configuración: 10 minutos
- Build: 15-20 minutos