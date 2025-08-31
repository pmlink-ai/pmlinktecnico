# DOCUMENTACIÓN COMPLETA - PMLink CMMS Cliente.

## 📋 INFORMACIÓN GENERAL

### Descripción del Proyecto
PMLink CMMS es una aplicación móvil desarrollada con React Native y Expo para la gestión de mantenimiento (CMMS - Computerized Maintenance Management System). La aplicación permite a los usuarios gestionar órdenes de trabajo, equipos, y realizar seguimiento de mantenimientos de manera eficiente.

### Tecnologías Principales
- **Framework:** React Native con Expo SDK 53.0.17
- **Navegación:** React Navigation v7 (Native Stack + Bottom Tabs)
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth
- **Estado:** React Hooks (useState, useEffect, useFocusEffect)
- **Plataformas:** iOS, Android, Web

### Información del Proyecto
- **Nombre:** pmlinkacliente
- **Versión:** 1.0.0
- **Rama Actual:** V1.5-Fase-4
- **Repositorio:** pmlink-ai/pmlinkacliente

## 🏗️ ARQUITECTURA DE LA APLICACIÓN

### Estructura de Directorios
```
pmlinkacliente/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── LogoPlaceholder.jsx
│   │   └── CustomDatePickerIOS.jsx  # DatePicker optimizado para iOS
│   ├── navigation/          # Configuración de navegación
│   │   ├── AppNavigator.jsx
│   │   ├── AppStack.jsx
│   │   ├── AuthStack.jsx
│   │   └── MainTabNavigator.jsx
│   ├── pages/              # Pantallas de la aplicación
│   │   ├── Auth/           # Pantallas de autenticación
│   │   │   ├── LoginScreen.jsx
│   │   │   ├── LoginFinal.jsx
│   │   │   ├── LoginBasic.jsx
│   │   │   ├── LoginCrossPlatform.jsx
│   │   │   ├── LoginIOS.jsx
│   │   │   ├── LoginKeyboard.jsx
│   │   │   ├── LoginScreenSimple.jsx
│   │   │   ├── LoginSimple.jsx
│   │   │   ├── LoginTest.jsx
│   │   │   ├── LoginDebug.jsx
│   │   │   └── ForgotPasswordScreen.jsx
│   │   ├── WorkOrders/     # Pantallas de órdenes de trabajo
│   │   │   ├── CreateWorkOrderScreen.jsx
│   │   │   ├── EditWorkOrderScreen.jsx
│   │   │   ├── WorkOrderDetailScreen.jsx
│   │   │   ├── WorkOrderListScreen.jsx
│   │   │   ├── WorkOrderListScreenSimple.jsx
│   │   │   ├── WorkOrderListScreenV2.jsx
│   │   │   └── WorkOrderListScreenV3.jsx
│   │   ├── DashboardScreen.jsx
│   │   ├── WorkOrdersScreen.jsx
│   │   ├── WorkOrdersScreenV2.jsx
│   │   ├── WorkOrdersScreenV3.jsx
│   │   └── WorkOrdersScreenTemp.jsx
│   ├── services/           # Servicios y APIs
│   │   ├── supabase.js
│   │   └── WorkOrderService.js
│   └── styles/             # Estilos globales
│       ├── index.js
│       ├── globalStyles.js
│       └── colors.js
├── assets/                 # Recursos estáticos
├── .env                   # Variables de entorno
├── App.js                 # Componente principal
├── app.json              # Configuración de Expo
└── package.json          # Dependencias
```

### Dependencias Principales
```json
{
  "@react-native-community/datetimepicker": "8.4.1",
  "@react-native-picker/picker": "^2.11.1", 
  "@react-navigation/bottom-tabs": "^7.4.2",
  "@react-navigation/native": "^7.1.14",
  "@react-navigation/native-stack": "^7.3.21",
  "@supabase/supabase-js": "^2.51.0",
  "expo": "~53.0.17",
  "expo-image-picker": "^16.1.4",
  "react": "19.0.0",
  "react-native": "0.79.5",
  "react-native-dotenv": "^3.4.11",
  "react-native-safe-area-context": "^5.4.0",
  "react-native-screens": "^4.11.1"
}
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS (SUPABASE)

### Tablas Principales

#### 1. `orden_trabajo` (Órdenes de Trabajo)
```sql
- id (UUID, PK)
- numero_ot (VARCHAR) - Número único de orden
- titulo (VARCHAR) - Título de la orden
- descripcion_corta (TEXT) - Descripción breve
- descripcion_larga (TEXT) - Descripción detallada
- estado_id (INT, FK) - Referencia a estados_orden_trabajo
- prioridad_id (INT, FK) - Referencia a prioridades
- equipo_id (VARCHAR, FK) - Referencia a equipo
- tipo_mantenimiento_id (VARCHAR, FK) - Referencia a tiposmantenimiento
- fecha_inicio (TIMESTAMP) - Fecha de inicio
- fecha_estimada_fin (TIMESTAMP) - Fecha estimada de finalización
- fecha_programada (DATE) - Fecha programada
- ubicacion (VARCHAR) - Ubicación del mantenimiento
- cliente_nombre (VARCHAR) - Nombre del cliente
- created_at (TIMESTAMP) - Fecha de creación
- updated_at (TIMESTAMP) - Fecha de actualización
```

#### 2. `estados_orden_trabajo` (Estados)
```sql
- id (INT, PK)
- nombre (VARCHAR) - Nombre del estado
- descripcion (TEXT) - Descripción del estado
- orden (INT) - Orden de visualización
```

Estados disponibles:
- Pendiente
- En Progreso  
- Completada
- Cancelada

#### 3. `prioridades` (Prioridades)
```sql
- id (INT, PK)
- nombre (VARCHAR) - Nombre de la prioridad
- nivel (INT) - Nivel numérico de prioridad
- descripcion (TEXT) - Descripción de la prioridad
```

Prioridades disponibles:
- Baja (nivel 1)
- Media (nivel 2)
- Alta (nivel 3)
- Crítica (nivel 4)

#### 4. `equipo` (Equipos)
```sql
- equipo_id (VARCHAR, PK)
- nombre_equipo (VARCHAR) - Nombre del equipo
- codigo_equipo (VARCHAR) - Código único del equipo
- descripcion (TEXT) - Descripción del equipo
- marca (VARCHAR) - Marca del equipo
- modelo (VARCHAR) - Modelo del equipo
- activo (BOOLEAN) - Estado activo/inactivo
```

#### 5. `tiposmantenimiento` (Tipos de Mantenimiento)
```sql
- tipo_id (VARCHAR, PK)
- nombre_tipo (VARCHAR) - Nombre del tipo
- descripcion (TEXT) - Descripción del tipo
- activo (BOOLEAN) - Estado activo/inactivo
```

Tipos disponibles:
- Preventivo
- Correctivo
- Predictivo
- Emergencia

## 🚀 FUNCIONALIDADES IMPLEMENTADAS

### 1. Autenticación
- **Pantallas múltiples de login** con diferentes enfoques UI/UX
- **Integración con Supabase Auth**
- **Recuperación de contraseña**
- **Validación de sesiones**
- **Múltiples variantes de UI** (LoginBasic, LoginFinal, LoginCrossPlatform, etc.)

### 2. Navegación
- **Tab Navigator principal** con Dashboard y Órdenes de Trabajo
- **Stack Navigator** para navegación jerárquica
- **Headers personalizados** con estilos corporativos
- **Navegación modal** para creación/edición

### 3. Dashboard
- **Pantalla principal** con métricas de mantenimiento
- **Resumen de órdenes de trabajo**
- **Indicadores de estado**

### 4. Gestión de Órdenes de Trabajo

#### Listado de Órdenes (Multiple Versiones)
- **WorkOrderListScreenSimple:** Versión básica con datos simplificados
- **WorkOrderListScreenV3:** Versión avanzada con manejo de errores
- **Pull-to-refresh** para actualización manual
- **Auto-refresh con useFocusEffect** cuando la pantalla gana foco
- **Generación automática de números de OT** usando UUID
- **Formato:** OT-XXXXXXXX (primeros 8 caracteres del UUID)
- **Estados visuales** con colores diferenciados
- **Indicadores de prioridad** con iconografía

#### Creación de Órdenes (CreateWorkOrderScreen)
- **Formulario completo** con validación
- **Selectores modales** para estados, prioridades, equipos y tipos
- **DatePicker integrado** para fechas
- **Validación de campos obligatorios**
- **Integración completa con Supabase**

#### Edición de Órdenes (EditWorkOrderScreen)
- **Pre-población de datos** existentes
- **Formulario idéntico** al de creación
- **DatePicker mejorado para iOS** con modal personalizado
- **Validación antes de guardar**
- **Actualización en tiempo real**
- **Manejo de errores robusto**

#### Detalle de Órdenes (WorkOrderDetailScreen)
- **Vista completa** de información de la orden
- **Información de equipo, estado, prioridad**
- **Navegación a edición**
- **Auto-refresh** cuando regresa de edición
- **Botón de edición integrado**

### 5. Selección de Datos

#### Modales de Selección
- **Estados:** Lista de estados disponibles con descripciones
- **Prioridades:** Ordenadas por nivel de importancia
- **Equipos:** Lista de equipos activos con código y nombre
- **Tipos de Mantenimiento:** Categorías de mantenimiento

#### DatePicker Mejorado
- **Componente CustomDatePickerIOS** específico para iOS
- **Lógica por plataforma:** iOS usa CustomDatePickerIOS, Android usa DateTimePicker nativo
- **Modal personalizado** evita overlay transparente en iOS
- **Display tipo "spinner"** más estable que "default"
- **Botones de control:** "Cancelar" y "Listo" con lógica de confirmación
- **Fecha temporal:** Solo se aplica al confirmar, mejor UX
- **Reutilizable:** Implementado en CreateWorkOrderScreen y EditWorkOrderScreen

### 6. Sincronización de Datos
- **Auto-refresh inteligente** usando useFocusEffect
- **Actualización automática** al regresar de pantallas de edición
- **Manejo de estados de carga**
- **Fallback a datos de ejemplo** en caso de error de conexión

### 7. Manejo de Errores
- **Datos de fallback** para desarrollo sin conexión
- **Alertas informativas** para el usuario
- **Logging completo** en consola para debugging
- **Recuperación graceful** de errores de red

### 8. UI/UX
- **Design System consistente** con colores corporativos
- **Estilos globales** reutilizables
- **Responsive design** para múltiples tamaños de pantalla
- **Safe Area** handling para iOS
- **Loading states** en todas las operaciones

## 🎨 SISTEMA DE DISEÑO

### Paleta de Colores (colors.js)
```javascript
export const colors = {
  // Colores principales
  primary: '#007AFF',
  secondary: '#5856D6',
  
  // Estados
  success: '#34C759',
  warning: '#FF9500', 
  error: '#FF3B30',
  info: '#5AC8FA',
  
  // Mantenimiento específicos
  pending: '#FF9500',      // Naranja para pendiente
  inProgress: '#007AFF',   // Azul para en progreso
  completed: '#34C759',    // Verde para completado
  cancelled: '#FF3B30',    // Rojo para cancelado
  
  // Grises
  white: '#FFFFFF',
  black: '#000000',
  text: '#1C1C1E',
  textMuted: '#8E8E93',
  border: '#C6C6C8',
  borderLight: '#F2F2F7',
  background: '#F2F2F7',
  surface: '#FFFFFF'
};
```

### Estilos Globales (globalStyles.js)
- **Containers:** Layouts básicos y seguros
- **Typography:** Títulos, subtítulos, texto
- **Buttons:** Primarios, secundarios, estados
- **Forms:** Inputs, labels, validación
- **Cards:** Contenedores de información
- **Status:** Estados específicos de CMMS

## 📱 FLUJO DE NAVEGACIÓN

### Estructura de Navegación
```
AppNavigator
├── AuthStack (No autenticado)
│   ├── LoginScreen
│   └── ForgotPasswordScreen
└── AppStack (Autenticado)
    ├── MainTabs
    │   ├── Dashboard
    │   └── WorkOrders (WorkOrdersScreenV3)
    │       └── WorkOrderListScreenV3
    ├── CreateWorkOrder (Modal)
    ├── EditWorkOrder
    └── WorkOrderDetail
```

### Flujos Principales

#### 1. Flujo de Autenticación
```
Login → Validación → Dashboard/WorkOrders
```

#### 2. Flujo de Órdenes de Trabajo
```
Lista → Detalle → Edición → Guardar → Regreso con Refresh
Lista → Crear Nueva → Guardar → Lista Actualizada
```

#### 3. Flujo de Datos
```
Pantalla → useFocusEffect → Carga desde Supabase → Actualiza UI
Edición → Validación → Update Supabase → Navegación → Refresh automático
```

## 🔧 CONFIGURACIÓN TÉCNICA

### Variables de Entorno (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuración de Expo (app.json)
```json
{
  "expo": {
    "name": "pmlinkacliente",
    "slug": "pmlinkacliente", 
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "edgeToEdgeEnabled": true
    }
  }
}
```

### Configuración de Babel (babel.config.js)
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

## 🔍 CARACTERÍSTICAS TÉCNICAS DESTACADAS

### 1. Auto-Refresh Inteligente
- **useFocusEffect** en lugar de useEffect para refresh automático
- **Sincronización** cuando el usuario regresa de otras pantallas
- **Mejora UX** sin necesidad de pull-to-refresh manual

### 2. Generación de Números de OT
- **UUID como base** para unicidad garantizada
- **Formato legible:** OT-XXXXXXXX usando substring(0,8)
- **Consistencia** en toda la aplicación

### 3. DatePicker iOS Optimizado
- **Modal personalizado** evita overlay transparente
- **Display "spinner"** más estable que "default"
- **UX nativa** con botones de control

### 4. Manejo Robusto de Errores
- **Datos de fallback** para desarrollo sin conexión
- **Logging detallado** para debugging
- **UI consistente** incluso con errores de red

### 5. Validación de Formularios
- **Validación en tiempo real**
- **Mensajes de error descriptivos**
- **Prevención de envíos inválidos**

## 🚧 ESTADO ACTUAL DEL DESARROLLO

### ✅ Completado
- [x] Sistema de autenticación completo
- [x] Navegación principal (Tabs + Stack)
- [x] Listado de órdenes de trabajo
- [x] Creación de órdenes de trabajo
- [x] Edición de órdenes de trabajo
- [x] Detalle de órdenes de trabajo
- [x] Auto-refresh con useFocusEffect
- [x] DatePicker optimizado para iOS con CustomDatePickerIOS
- [x] Integración completa con Supabase
- [x] Manejo de estados y prioridades
- [x] Generación automática de números de OT
- [x] Sistema de colores y estilos
- [x] Componente CustomDatePickerIOS reutilizable
- [x] Lógica específica por plataforma para DatePickers

### 🔄 En Desarrollo
- [ ] Sistema de comentarios en órdenes
- [ ] Adjuntos y fotos en órdenes
- [ ] Notificaciones push
- [ ] Reportes y métricas avanzadas
- [ ] Gestión de técnicos/usuarios

### 🎯 Próximas Mejoras
- [ ] Filtros avanzados en lista de órdenes
- [ ] Búsqueda en tiempo real
- [ ] Export de datos
- [ ] Sincronización offline
- [ ] Gestión de inventario

## 🐛 PROBLEMAS RESUELTOS

### 1. Overlay Transparente en iOS
**Problema:** DateTimePicker creaba overlay invisible que bloqueaba interacción
**Solución:** Componente CustomDatePickerIOS con Modal personalizado y controles específicos para iOS

**Implementación:**
- Creado `CustomDatePickerIOS.jsx` como componente reutilizable
- Lógica específica por plataforma: iOS usa CustomDatePickerIOS, Android usa DateTimePicker nativo
- Modal con display="spinner" más estable que "default"
- Botones "Cancelar" y "Listo" con lógica de confirmación
- Fecha temporal que solo se aplica al confirmar (mejor UX)
- Integrado en CreateWorkOrderScreen y EditWorkOrderScreen

### 2. "OT-SIN-NUMERO" en Lista
**Problema:** UUID no se mostraba como número de orden legible
**Solución:** Generación automática usando UUID.substring(0,8) con formato OT-XXXXXXXX

### 3. Datos No se Refrescan Después de Edición
**Problema:** useEffect no se disparaba al regresar de pantallas
**Solución:** useFocusEffect para auto-refresh cuando pantalla gana foco

### 4. Estados Duplicados en DatePicker
**Problema:** Funciones de manejo de fecha declaradas múltiples veces
**Solución:** Eliminación de duplicados y consolidación de funciones

## 📚 DOCUMENTACIÓN PARA DESARROLLADORES

### Comandos Principales
```bash
# Iniciar desarrollo
npm start

# Plataformas específicas  
npm run android
npm run ios
npm run web

# Limpiar cache
npx expo start --clear
```

### Estructura de Componentes
```jsx
// Patrón típico de pantalla
export default function ScreenName() {
  // Estados
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Hooks de navegación
  const navigation = useNavigation();
  
  // Auto-refresh
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );
  
  // Funciones
  const loadData = async () => {
    // Lógica de carga
  };
  
  // Render
  return (
    <SafeAreaView style={globalStyles.container}>
      {/* UI */}
    </SafeAreaView>
  );
}
```

### Integración con Supabase
```javascript
// Cargar datos
const { data, error } = await supabase
  .from('tabla')
  .select('*')
  .order('created_at', { ascending: false });

// Insertar datos  
const { data, error } = await supabase
  .from('tabla')
  .insert(newData)
  .select()
  .single();

// Actualizar datos
const { data, error } = await supabase
  .from('tabla')
  .update(updateData)
  .eq('id', id)
  .select()
  .single();
```

## 🤝 GUÍA PARA COLABORADORES

### Convenciones de Código
- **Nomenclatura:** camelCase para variables, PascalCase para componentes
- **Archivos:** Componentes en .jsx, servicios en .js
- **Estilos:** StyleSheet.create al final de cada archivo
- **Imports:** Agrupados por tipo (React, React Native, librerías, archivos locales)

### Estructura de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `style:` Cambios de estilos
- `refactor:` Refactorización de código
- `docs:` Actualización de documentación

### Testing
- Probar en iOS y Android
- Verificar con/sin conexión a internet
- Validar flujos completos de usuario
- Testing en dispositivos reales

---

**Última actualización:** 30 de agosto de 2025
**Versión del documento:** 1.0
**Desarrollado por:** PMLink AI Team
