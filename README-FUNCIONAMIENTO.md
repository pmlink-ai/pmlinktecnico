# 📱 PMLink Técnico - Aplicación Móvil CMMS

## ✅ Estado Actual: FUNCIONANDO

La aplicación está **completamente configurada** y conectada al servidor real de Supabase.

## 🔑 Credenciales de Prueba

Para probar la aplicación, puedes usar estas credenciales:

### Usuario Administrador:
- **Email**: `admin@pmlink.com`
- **Contraseña**: `admin123456`

### Usuario Técnico:
- **Email**: `tecnico@pmlink.com` 
- **Contraseña**: `tecnico123456`

## 🚀 Cómo Ejecutar

1. **Instalar dependencias** (si no lo has hecho):
   ```bash
   npm install
   ```

2. **Ejecutar la aplicación**:
   ```bash
   npm start
   # o
   npx expo start
   ```

3. **Abrir en el navegador**:
   ```
   http://localhost:8082
   ```

4. **Para móvil**: Escanear el código QR con Expo Go

## 🔧 Configuración de Supabase

### Credenciales Reales (Ya configuradas):
- **URL**: `https://mwtdoidrjuahsejfctlm.supabase.co`
- **Anon Key**: Configurada en `app.json` y `lib/supabase.js`
- **Proyecto ID**: `mwtdoidrjuahsejfctlm`

### Funcionalidades Disponibles:
- ✅ **Autenticación** con email/contraseña
- ✅ **Pantalla de Login** profesional y responsive
- ✅ **Navegación** entre pantallas
- ✅ **Contexto de autenticación** 
- ✅ **Conexión real a Supabase**

## 📊 Estructura del Proyecto

```
pmlinktecnico/
├── src/
│   ├── components/
│   │   ├── LoginScreen.js     # ✅ Pantalla de login completa
│   │   └── HomeScreen.js      # ✅ Pantalla principal
│   ├── contexts/
│   │   └── AuthContext.js     # ✅ Manejo de autenticación
│   └── navigation/
│       └── AppNavigator.js    # ✅ Navegación principal
├── lib/
│   └── supabase.js           # ✅ Configuración real de Supabase
├── App.js                    # ✅ Aplicación principal
├── app.json                  # ✅ Configuración de Expo con Supabase
└── package.json              # ✅ Dependencias instaladas
```

## 🎯 Próximos Pasos

1. **Crear usuarios en Supabase** (si aún no existen)
2. **Probar el login** con las credenciales de prueba
3. **Desarrollar funcionalidades CMMS**:
   - Gestión de órdenes de trabajo
   - Formularios de inspección
   - Subida de fotos
   - Reportes

## 🔍 Debugging

Si hay problemas de conexión:

1. **Verificar internet**
2. **Revisar logs en consola**:
   ```javascript
   // En la consola del navegador
   console.log('Testing Supabase connection...');
   ```

3. **Verificar configuración**:
   - ✅ URL de Supabase correcta
   - ✅ Anon Key válida  
   - ✅ Dependencias instaladas

## 📞 Soporte

- **Repositorio GitHub**: `https://github.com/pmlink-ai/pmlinktecnico`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/mwtdoidrjuahsejfctlm`

---

**PMLink Técnico v1.5** - Sistema de Gestión de Mantenimiento para Técnicos en Terreno