# 📋 CHECKLIST - PREPARACIÓN PARA PRODUCCIÓN

## 🔐 SEGURIDAD Y CONFIGURACIÓN

### ✅ Supabase Configuración
- [ ] URLs de Supabase apuntan a producción (no localhost)
- [ ] API Keys configuradas correctamente
- [ ] RLS (Row Level Security) activado en todas las tablas
- [ ] Políticas de seguridad revisadas y probadas
- [ ] Bucket de Storage configurado con permisos correctos

### ✅ Variables de Entorno
- [ ] Remover console.log innecesarios de producción
- [ ] API URLs configuradas para producción
- [ ] Credenciales sensibles no hardcodeadas

### ✅ Performance
- [ ] Imágenes optimizadas (tamaño < 1MB)
- [ ] Lazy loading implementado donde sea necesario
- [ ] Caché implementado para datos frecuentes

## 📱 CONFIGURACIÓN DE APPS

### ✅ Android (Google Play Store)
- [ ] Iconos de app en todas las resoluciones
- [ ] Splash screen configurada
- [ ] Permisos declarados correctamente en app.json
- [ ] Package name único (com.pmlink.cmms)
- [ ] Versión incrementada
- [ ] Screenshots preparados
- [ ] Descripción de app escrita

### ✅ iOS (App Store)
- [ ] Bundle identifier único (com.pmlink.cmms)
- [ ] Iconos de app en todas las resoluciones requeridas
- [ ] Screenshots para diferentes tamaños de pantalla
- [ ] App Store Connect configurado
- [ ] Certificados de desarrollador válidos

## 🧪 TESTING

### ✅ Funcionalidad Core
- [ ] Login/logout funciona correctamente
- [ ] Creación de órdenes de trabajo
- [ ] Captura y subida de fotos
- [ ] Generación de PDFs
- [ ] Firma digital
- [ ] Navegación entre pantallas
- [ ] Almacenamiento en Supabase

### ✅ Testing en Dispositivos
- [ ] Probado en Android (diferentes versiones)
- [ ] Probado en iOS (diferentes versiones)
- [ ] Probado en diferentes tamaños de pantalla
- [ ] Probado sin conexión a internet (offline)
- [ ] Performance en dispositivos de gama baja

## 📚 DOCUMENTACIÓN

### ✅ Para Usuarios
- [ ] Manual de usuario creado
- [ ] Tutorial de primera vez
- [ ] Guía de resolución de problemas
- [ ] Información de contacto para soporte

### ✅ Para Desarrolladores
- [ ] README actualizado
- [ ] Documentación de API
- [ ] Guía de configuración de entorno
- [ ] Proceso de build documentado

## 🚀 DISTRIBUCIÓN

### ✅ Canales de Distribución
- [ ] **Google Play Store** (Android)
- [ ] **Apple App Store** (iOS)
- [ ] **Distribución interna** (TestFlight/Firebase App Distribution)
- [ ] **APK directo** (para instalación manual)

### ✅ Monitoreo Post-Lanzamiento
- [ ] Analytics configurado
- [ ] Crash reporting activado
- [ ] Sistema de feedback de usuarios
- [ ] Versionado para updates OTA

---

## 🔧 COMANDOS PARA EJECUTAR:

```bash
# 1. Instalar EAS CLI
npm install -g @expo/eas-cli

# 2. Login a Expo
npx eas login

# 3. Configurar proyecto
npx eas build:configure

# 4. Build para Android (APK testing)
npx eas build --platform android --profile preview

# 5. Build para producción
npx eas build --platform all --profile production

# 6. Subir a stores
npx eas submit --platform android
npx eas submit --platform ios
```

## 💡 RECOMENDACIONES ADICIONALES:

1. **Empezar con distribución interna** para testing
2. **Usar perfil 'preview'** para crear APKs de prueba
3. **Configurar CI/CD** con GitHub Actions
4. **Implementar versionado semántico**
5. **Configurar rollback plan** en caso de problemas