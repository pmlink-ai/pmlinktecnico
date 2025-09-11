<!-- Copilot instructions for PMLink CMMS Mobile project -->

# PMLink CMMS Mobile - Sistema para Técnicos en Terreno

Aplicación móvil desarrollada con Expo (React Native) para técnicos en terreno del sistema CMMS.

## Configuración
- **Frontend**: Expo + React Native
- **Base de datos**: Supabase PostgreSQL
- **Plataformas**: iOS, Android, Web
- **Propósito**: Sistema CMMS móvil para técnicos en terreno

## Estado del Proyecto
- [x] Instrucciones de Copilot actualizadas
- [x] Estructura del proyecto Expo creada
- [x] Configuración de Supabase para móvil
- [x] Esquema completo de base de datos definido
- [x] Funciones CRUD implementadas
- [x] Interfaz de navegación básica
- [x] Conexión a GitHub configurada
- [ ] Formularios específicos implementados
- [ ] Captura de fotografías integrada
- [ ] Generación de PDF implementada

## Esquema de Base de Datos
El sistema incluye las siguientes tablas:
- `orden_trabajo` - Órdenes de trabajo principales
- `informe_ansul_r102` - Sistemas contra incendios
- `informe_electromecanico` - Mantenimiento eléctrico
- `informe_limpieza_ductos` - Sistemas de ventilación
- `informe_reparaciones_adicionales` - Trabajos extra
- `informe_fotografias` - Documentación visual

## Tipos de Informes
1. **Ansul R102** 🚨 - Sistemas contra incendios
2. **Electromecánico** ⚡ - Motores y sistemas eléctricos
3. **Limpieza Ductos** 🌪️ - Ventilación y ductos
4. **Reparaciones** 🔨 - Trabajos adicionales

## Tecnologías
- Expo SDK 49
- React Native 0.72
- Supabase JavaScript Client
- Expo SecureStore para autenticación
- AsyncStorage para cache local
