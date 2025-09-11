# � PMLink Mobile - Aplicación Expo con Supabase

Aplicación móvil desarrollada con Expo (React Native) para conectar y gestionar la base de datos Supabase de PMLink.

## 📋 Configuración

### Tecnologías
- **Frontend**: Expo + React Native
- **Base de datos**: Supabase (PostgreSQL)
- **Plataformas**: iOS, Android, Web

### Credenciales Supabase
- **URL**: `https://mwtdoidrjuahsejfctlm.supabase.co`
- **Anon Key**: Configurada en `app.json`

## 🚀 Instalación y Desarrollo

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Instalar Expo CLI (si no lo tienes)
```bash
npm install -g @expo/cli
```

### 3. Ejecutar la Aplicación

#### Desarrollo
```bash
npm start
# o
expo start
```

#### Plataformas Específicas
```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Navegador web
```

## 📁 Estructura del Proyecto

```
pmlinktecnico/
├── assets/                 # Imágenes e iconos
├── lib/
│   └── supabase.js        # Configuración y funciones de Supabase
├── .env                   # Variables de entorno (backup)
├── app.json              # Configuración de Expo
├── App.js                # Componente principal
├── babel.config.js       # Configuración de Babel
├── package.json          # Dependencias del proyecto
└── README.md            # Este archivo
```

## 🔧 Funcionalidades

### Conexión a Supabase ✅
- Configuración automática de cliente Supabase
- Autenticación persistente con Expo SecureStore
- Manejo de errores de conexión

### Gestión de Tablas ✅
- Listar tablas existentes en la base de datos
- Probar conexión en tiempo real
- Interfaz móvil amigable

### Por Implementar 🚧
- Crear nuevas tablas (requiere service role key)
- CRUD operations en tablas existentes
- Autenticación de usuarios
- Sincronización offline

## 💡 Crear Tabla Nueva

Para crear una tabla nueva, tienes estas opciones:

### Opción 1: Dashboard Web de Supabase (Recomendado)
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `mwtdoidrjuahsejfctlm`
3. Ve a "SQL Editor"
4. Pega tu código SQL CREATE TABLE
5. Ejecuta la consulta

### Opción 2: Desde la App (Próximamente)
- Se implementará con service role key para operaciones administrativas

## 🔐 Seguridad

- ✅ Credenciales almacenadas de forma segura con Expo SecureStore
- ✅ Anon key configurada para operaciones básicas
- ⚠️ Service role key necesaria para operaciones de administrador

## 🐛 Solución de Problemas

### Error de Conexión
- Verifica que las credenciales en `app.json` sean correctas
- Asegúrate de que el proyecto Supabase esté activo
- Revisa la consola de Expo para mensajes de error

### Error al Cargar Tablas
- La anon key tiene permisos limitados
- Algunas tablas del sistema pueden no ser visibles
- Verifica que existan tablas en el esquema 'public'

### Error en Desarrollo
```bash
# Limpiar cache de Expo
expo start -c

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## 🚀 Próximos Pasos

1. **Compartir tu código SQL** - Para crear la tabla que necesitas
2. **Instalar dependencias** - `npm install`
3. **Ejecutar la app** - `expo start`
4. **Probar en dispositivo** - Usar Expo Go app

---

**¿Listo para crear tu tabla?** Comparte tu código SQL y te ayudo a implementarlo en la aplicación móvil. �
