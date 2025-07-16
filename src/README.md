# Estructura del Proyecto PMLink Cliente

## 📁 Descripción de Carpetas

### `src/assets/`
Contiene recursos estáticos como:
- Imágenes e iconos
- Fuentes personalizadas
- Archivos multimedia

### `src/components/`
Componentes UI reutilizables:
- Botones personalizados
- Inputs y formularios
- Cards y modales
- Componentes de navegación

### `src/navigation/`
Configuración de React Navigation:
- Stack Navigator
- Tab Navigator
- Configuración de rutas

### `src/pages/`
Pantallas principales de la aplicación:
- `Auth/`: Login, ForgotPassword, Register
- `WorkOrders/`: Create, List, Detail, Edit

### `src/services/`
Lógica de negocio y APIs:
- Configuración de Supabase
- Servicios de autenticación
- Servicios de datos (CRUD)

### `src/styles/`
Sistema de diseño global:
- `colors.js`: Paleta de colores
- `globalStyles.js`: Estilos reutilizables
- `index.js`: Exportaciones centralizadas

## 🎨 Paleta de Colores

- **Primario**: `#FFA500` (Naranja)
- **Secundario**: `#FF8C00` (Naranja oscuro)
- **Texto**: `#333333` (Gris oscuro)
- **Fondo**: `#FFFFFF` (Blanco)
- **Estados**: Verde, Rojo, Azul, Amarillo

## 🚀 Próximos Pasos

1. Implementar navegación con React Navigation
2. Crear componentes UI reutilizables
3. Desarrollar pantallas de autenticación
4. Implementar funcionalidades CMMS
