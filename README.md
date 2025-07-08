# PMLink Admin - CMMS Web Application

Una aplicación web de Sistema de Gestión de Mantenimiento Computarizado (CMMS) desarrollada para gestionar empresas, locales, equipos y servicios de mantenimiento.

## 🚀 Características

- **Autenticación segura** con roles de usuario
- **Gestión de datos maestros** (Empresas, Locales, Equipos, etc.)
- **Interface responsiva** con diseño moderno
- **Base de datos en la nube** con Supabase
- **Deployment flexible** para localhost y VPS

## 🛠️ Tecnologías

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Routing**: React Router DOM
- **Estado**: React Query
- **UI Components**: Lucide React Icons

## 🎨 Diseño

- **Color primario**: #FFA500 (Naranja)
- **Tema**: Moderno y profesional
- **Responsive**: Optimizado para desktop y móvil

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── maestros/       # Componentes de datos maestros
│   ├── Dashboard.tsx   # Panel principal
│   ├── Layout.tsx      # Layout principal
│   ├── Login.tsx       # Pantalla de login
│   └── ...
├── context/            # Contextos de React
│   └── AuthContext.tsx # Contexto de autenticación
├── lib/                # Utilidades y configuración
│   └── supabase.ts     # Cliente de Supabase
└── ...
```

## ⚙️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_url_de_supabase_aqui
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase_aqui
```

### 2. Instalación de Dependencias

```bash
npm install
```

### 3. Ejecución en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3001/pmlinkadmin/`

## 🏗️ Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run dev:subdirectory` - Ejecutar con base en subdirectorio
- `npm run build` - Construir para producción
- `npm run build:production` - Construir para producción optimizado
- `npm run preview` - Previsualizar build de producción
- `npm run preview:subdirectory` - Previsualizar con subdirectorio
- `npm run serve:local` - Servir localmente con configuración de subdirectorio

## 🚀 Deployment

### Para VPS con Nginx

1. Construir la aplicación:
```bash
npm run build:production
```

2. Copiar el contenido de `build/` a `/var/www/pmlinkadmin/build/`

3. Configurar Nginx:
```nginx
location /pmlinkadmin/ {
    alias /var/www/pmlinkadmin/build/;
    try_files $uri $uri/ /pmlinkadmin/index.html;
    
    # Headers para SPA
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 📊 Base de Datos

### Tablas Principales

1. **empresa** - Empresas cliente
2. **local** - Sedes y ubicaciones
3. **equipos** - Equipos y activos
4. **rol** - Roles de usuario
5. **usuario** - Usuarios del sistema
6. **TiposMantenimiento** - Tipos de mantenimiento

### Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar las migraciones SQL para crear las tablas
3. Configurar Row Level Security (RLS)
4. Obtener URL y clave anónima del proyecto

## 👥 Roles de Usuario

- **Administrador PM-Link**: Acceso completo al sistema
- **Administrador Empresa**: Gestión de su empresa
- **Técnico**: Acceso a operaciones
- **Supervisor**: Supervisión de servicios
- **Lector**: Solo lectura

## 🔐 Seguridad

- Autenticación basada en JWT
- Protección de rutas por roles
- Row Level Security en base de datos
- Validación de datos en frontend y backend

## 📱 Responsive Design

La aplicación está optimizada para:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto es privado y propietario.

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.

---

**PMLink Admin** - Sistema de Gestión de Mantenimiento Computarizado

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
