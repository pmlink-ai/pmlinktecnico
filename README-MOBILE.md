# 📱 PMLink Técnico - Aplicación Móvil

> **Aplicación móvil exclusiva para técnicos en terreno - Android e iOS**

## 🎯 **Plataformas Objetivo**

✅ **Android** (Nativo)  
✅ **iOS** (Nativo)  
⚠️ **Web** (Solo para desarrollo/testing)

## 📋 **Descripción**

PMLink Técnico es una aplicación móvil diseñada específicamente para técnicos que trabajan en terreno, permitiendo:

- 🔐 **Autenticación segura** con Supabase
- 📊 **Gestión de órdenes de trabajo**
- 📝 **Formularios de inspección móviles**
- 📸 **Captura de fotografías** (solo móvil)
- 🔄 **Sincronización offline** (próximamente)

## 🚀 **Desarrollo y Testing**

### Con Expo Go (Recomendado)
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npx expo start

# Escanear QR con Expo Go en tu móvil
```

### En Web (Solo para testing rápido)
```bash
npx expo start --web
```
> ⚠️ **Nota**: La versión web tiene limitaciones y no representa la experiencia final

## 🔑 **Credenciales de Prueba**

- **Email**: `admin@pmlink.com`
- **Password**: `admin123456`

## 📦 **Tecnologías**

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Navegación**: React Navigation
- **Storage**: Expo SecureStore

## 🏗️ **Estructura del Proyecto**

```
pmlinktecnico/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── contexts/        # Context providers (Auth)
│   ├── navigation/      # Configuración de navegación
│   └── pages/          # Pantallas de la app
├── lib/                # Configuración de Supabase
├── app.json           # Configuración de Expo
└── package.json       # Dependencias
```

## 🔧 **Configuración de Desarrollo**

### Variables de Entorno
Las credenciales de Supabase están en `app.json`:
```json
{
  "extra": {
    "supabaseUrl": "https://mwtdoidrjuahsejfctlm.supabase.co",
    "supabaseAnonKey": "..."
  }
}
```

### Dependencias Clave
- `@supabase/supabase-js` - Cliente de Supabase
- `@react-native-async-storage/async-storage` - Storage local
- `react-native-url-polyfill` - Polyfill para URLs
- `expo-secure-store` - Almacenamiento seguro

## 📱 **Deployment**

### Android
```bash
# Build APK
eas build --platform android

# Build para Play Store
eas build --platform android --profile production
```

### iOS
```bash
# Build para App Store
eas build --platform ios --profile production
```

## 🐛 **Debugging**

### Logs útiles
La app incluye logs detallados en la consola:
```javascript
console.log('🔐 Iniciando proceso de login...');
console.log('✅ Conexión a Supabase exitosa');
```

### Problemas comunes
1. **Error de conexión**: Verificar internet y credenciales
2. **Login fallido**: Usar credenciales de prueba
3. **Error en web**: Funciones móviles no disponibles

## 👥 **Para el Equipo**

- **Desarrolladores**: Usar Expo Go para testing rápido
- **Testers**: Instalar via TestFlight (iOS) o APK (Android)
- **Técnicos**: App final desde stores oficiales

## 📞 **Soporte**

Para problemas técnicos, verificar:
1. Logs en consola de Expo
2. Estado de conexión a Supabase
3. Versión de Expo Go actualizada

---

**Versión**: 1.5.0  
**Última actualización**: 14 de septiembre de 2025  
**Plataformas**: Android, iOS  
**Framework**: React Native + Expo