<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# PMLink Admin - CMMS Web Application

Esta es una aplicación web de Sistema de Gestión de Mantenimiento Computarizado (CMMS) desarrollada con React, TypeScript, Vite y Supabase.

## Estructura del Proyecto

- **Base URL**: `/pmlinkadmin` - La aplicación funciona en un subdirectorio
- **Framework**: React 19 con TypeScript
- **Build Tool**: Vite con configuración para subdirectorios
- **Base de datos**: Supabase PostgreSQL
- **Autenticación**: Supabase Auth con roles personalizados
- **Styling**: Tailwind CSS con tema personalizado (color primario #FFA500)
- **Routing**: React Router DOM con protección de rutas
- **Estado**: React Query para manejo de datos

## Colores de la Aplicación

- Color primario: #FFA500 (naranja)
- Configurado en `tailwind.config.js` como `primary-500`

## Estructura de Base de Datos

### Tablas principales:
- `empresa`: Empresas cliente
- `local`: Sedes/locales de las empresas  
- `equipos`: Equipos y activos
- `rol`: Roles de usuario
- `usuario`: Usuarios del sistema
- `TiposMantenimiento`: Tipos de mantenimiento

## Funcionalidades Implementadas

- ✅ Sistema de autenticación con roles
- ✅ Dashboard principal
- ✅ Gestión de Empresas (CRUD completo)
- ✅ Gestión de Locales (CRUD completo)
- ⏳ Gestión de Equipos (pendiente)
- ⏳ Gestión de Roles (pendiente)
- ⏳ Gestión de Usuarios (pendiente)
- ⏳ Gestión de Tipos de Mantenimiento (pendiente)
- ⏳ Módulo de Operaciones
- ⏳ Módulo de Reportes
- ⏳ Módulo de Notificaciones

## Deployment

La aplicación está configurada para funcionar tanto en:
- **localhost:3001/pmlinkadmin/** (desarrollo)
- **VPS con Nginx** en subdirectorio `/pmlinkadmin/`

## Patrones de Código

- Componentes funcionales con hooks
- TypeScript estricto
- Manejo de errores con toast notifications
- Formularios con validación
- Tablas responsivas con acciones CRUD
- Modales para edición/creación
- Protección de rutas basada en roles

## Variables de Entorno

Configurar en `.env`:
```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```
