# 📱 PMLink CMMS Mobile - Sistema para Técnicos en Terreno

Aplicación móvil desarrollada con Expo (React Native) para técnicos en terreno que trabajan con el sistema CMMS (Sistema de Gestión de Mantenimiento Asistido por Computadora).

## 🎯 **Propósito del Sistema**

Esta aplicación permite a los técnicos en terreno:
- ✅ **Acceder a órdenes de trabajo** asignadas
- ✅ **Completar formularios técnicos** específicos por tipo de mantenimiento
- ✅ **Capturar fotografías** del trabajo realizado
- ✅ **Generar informes PDF** para envío automático por correo
- ✅ **Trabajar offline** y sincronizar cuando hay conexión

## 📋 **Tipos de Informes Disponibles**

### 1. 🚨 **Informe Ansul R102**
Sistema contra incendios - Inspección completa del sistema Ansul R102
- Inspección visual del montaje
- Estado de cartuchos de gas y cañerías
- Pruebas de fugas y soplado
- Verificación de señales de alarma

### 2. ⚡ **Informe Electromecánico**
Mantenimiento de motores y sistemas eléctricos
- Inspección de motores y rejillas
- Estado de correas y rodamientos
- Mediciones de consumo eléctrico (fases R, S, T)
- Evaluación de componentes mecánicos

### 3. 🌪️ **Informe Limpieza de Ductos**
Mantenimiento de sistemas de ventilación
- Estado de campanas y filtros
- Inspección de ductos y dampers
- Diagnóstico de drenajes y registros
- Evaluación de motores de ventilación

### 4. 🔨 **Informe Reparaciones Adicionales**
Trabajos extra y reparaciones no programadas
- Tipo y descripción de reparaciones
- Resumen de trabajos realizados
- Observaciones generales

### 5. 📸 **Sistema de Fotografías**
Documentación visual integrada
- Captura de fotos por tipo de informe
- Etiquetado y organización automática
- Almacenamiento seguro en Supabase

## 🛠️ **Tecnologías**

### Frontend Móvil
- **Expo SDK 49** - Framework para React Native
- **React Native 0.72** - Desarrollo móvil multiplataforma
- **Expo SecureStore** - Almacenamiento seguro de credenciales
- **AsyncStorage** - Cache local de datos

### Backend y Base de Datos
- **Supabase** - PostgreSQL como servicio
- **Realtime subscriptions** - Sincronización en tiempo real
- **Row Level Security** - Seguridad a nivel de fila
- **Storage** - Almacenamiento de fotografías

## 🚀 **Instalación y Desarrollo**

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

## 📁 **Estructura del Proyecto**

```
pmlinktecnico/
├── assets/                     # Imágenes e iconos
├── lib/
│   ├── supabase-cmms.js       # Funciones CRUD para todas las tablas
│   └── supabase.js            # Configuración base (legacy)
├── sql/
│   ├── schema_completo_informes.sql  # Schema completo de todas las tablas
│   └── informe_limpieza_ductos.sql   # Tabla específica (ejemplo)
├── screens/                    # Pantallas de la aplicación (por implementar)
│   ├── OrdenesScreen.js
│   ├── FormularioAnsulScreen.js
│   ├── FormularioElectromecanicoScreen.js
│   ├── FormularioLimpiezaScreen.js
│   └── FormularioReparacionesScreen.js
├── components/                 # Componentes reutilizables (por implementar)
│   ├── FormField.js
│   ├── PhotoCapture.js
│   └── StatusSelector.js
├── .env                       # Variables de entorno (backup)
├── app.json                   # Configuración de Expo
├── App.js                     # Componente principal
├── babel.config.js            # Configuración de Babel
├── package.json               # Dependencias del proyecto
└── README.md                  # Este archivo
```

## 🗃️ **Esquema de Base de Datos**

### Tablas Principales

```sql
-- Órdenes de trabajo (tabla principal)
orden_trabajo
├── id (UUID)
├── numero_orden (VARCHAR)
├── tipo_mantenimiento (TEXT)
├── estado (TEXT)
├── fecha_programada (DATE)
└── tecnico_asignado (TEXT)

-- Informes técnicos específicos
informe_ansul_r102           -- Sistema contra incendios
informe_electromecanico      -- Mantenimiento eléctrico
informe_limpieza_ductos      -- Sistemas de ventilación
informe_reparaciones_adicionales -- Trabajos extra

-- Sistema de fotografías
informe_fotografias
├── orden_trabajo_id (UUID)
├── informe_tabla (TEXT)     -- Tipo de informe
├── storage_path (TEXT)      -- Ruta en Supabase Storage
└── etiqueta (TEXT)          -- Descripción
```

## 🔧 **Funcionalidades Implementadas**

### ✅ **Ya Disponible**
- **Conexión a Supabase** - Configurada y probada
- **Navegación básica** - Entre órdenes y formularios
- **Estructura CRUD** - Funciones para todas las tablas
- **Diseño responsivo** - Interfaz optimizada para móviles
- **Manejo de estados** - Conexión, carga, errores

### 🚧 **En Desarrollo**
- **Formularios específicos** - Pantallas de captura de datos
- **Captura de fotografías** - Integración con cámara
- **Generación de PDF** - Informes descargables
- **Sincronización offline** - Trabajo sin conexión
- **Notificaciones push** - Alertas de nuevas órdenes

### 📋 **Por Implementar**
- **Autenticación de técnicos** - Login por usuario
- **Firma digital** - Validación de informes
- **Envío automático por correo** - Distribución de informes
- **Dashboard de métricas** - Estadísticas de trabajo
- **Integración con GPS** - Ubicación de trabajos

## 🔐 **Configuración de Supabase**

### Credenciales
- **URL**: `https://mwtdoidrjuahsejfctlm.supabase.co`
- **Anon Key**: Configurada en `app.json`

### Tablas Creadas
Las siguientes tablas están listas en Supabase:
- ✅ `informe_ansul_r102`
- ✅ `informe_electromecanico`
- ✅ `informe_limpieza_ductos`
- ✅ `informe_reparaciones_adicionales`
- ✅ `informe_fotografias`

## 📱 **Uso de la Aplicación**

### Para Técnicos en Terreno

1. **Abrir la aplicación** en el dispositivo móvil
2. **Seleccionar orden de trabajo** asignada
3. **Elegir tipo de informe** según el mantenimiento
4. **Completar formulario** con datos técnicos
5. **Capturar fotografías** del trabajo realizado
6. **Enviar informe** para procesamiento

### Para Administradores

1. **Dashboard de Supabase** para gestión de datos
2. **SQL Editor** para consultas personalizadas
3. **Storage** para revisar fotografías
4. **API** para integraciones con otros sistemas

## 🐛 **Solución de Problemas**

### Error de Conexión
- Verificar conexión a internet
- Confirmar credenciales de Supabase
- Revisar estado del proyecto en dashboard

### Error en Formularios
- Validar que las tablas existan en Supabase
- Confirmar permisos de RLS (Row Level Security)
- Revisar formato de datos enviados

### Error en Fotografías
- Verificar permisos de cámara
- Confirmar configuración de Supabase Storage
- Revisar políticas de acceso a archivos

## 📚 **Recursos y Documentación**

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## 🚀 **Próximos Pasos**

### Inmediatos
1. **Implementar formularios específicos** para cada tipo de informe
2. **Integrar captura de fotografías** con la cámara del dispositivo
3. **Crear sistema de validaciones** para campos obligatorios

### Mediano Plazo
1. **Desarrollar generación de PDF** de informes
2. **Implementar trabajo offline** con sincronización
3. **Agregar autenticación** de técnicos

### Largo Plazo
1. **Dashboard web** para supervisores
2. **Integración con ERP** empresarial
3. **App de supervisión** para tablets

---

**Sistema CMMS Móvil desarrollado para PMLink** 🔧✨

**¿Listo para implementar los formularios específicos?** Los técnicos están esperando esta herramienta para mejorar su productividad en terreno. 📱💪
