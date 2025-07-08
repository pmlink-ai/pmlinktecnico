# Configuración de Base de Datos - PMLink Admin

## ⚠️ IMPORTANTE: Cómo funciona la autenticación

### 🔍 **Supabase tiene DOS lugares para usuarios:**

1. **`auth.users`** (Sistema interno de Supabase):
   - Maneja email, password, tokens
   - **Aquí se valida el login**
   - No es accesible directamente

2. **`usuario`** (Nuestra tabla personalizada):
   - Guarda nombres, rol, empresa, etc.
   - **Aquí verificamos permisos y datos**
   - Vinculada con `auth.users` por `usuario_id`

### 📋 **Flujo de login:**
1. Usuario ingresa email/password
2. App verifica si existe en tabla `usuario` y está activo
3. Si existe, hace login en `auth.users` de Supabase
4. Si login exitoso, obtiene rol y permisos de tabla `usuario`

**Por eso necesitamos el usuario en AMBAS tablas.**

## Pasos para configurar Supabase

### 1. Crear el proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un nuevo proyecto
3. Copia la URL del proyecto y la clave anónima
4. Actualiza el archivo `.env` con estas credenciales

### 2. Ejecutar el script de base de datos
1. Ve al SQL Editor en tu dashboard de Supabase
2. Copia y pega el contenido del archivo `database/setup.sql`
3. Ejecuta el script

### 3. Configurar autenticación
1. Ve a Authentication > Settings en Supabase
2. Configura los proveedores de autenticación (Email por defecto está bien)
3. Opcionalmente, configura URLs de redirección si es necesario

### 4. Crear usuario administrador de prueba

**Opción 1 - Script incluido (Recomendado):**
El script `setup.sql` ya incluye la creación del usuario administrador. Si ejecutaste el script completo, el usuario ya debería existir.

**Opción 2 - Script separado:**
Si necesitas crear el usuario por separado, ejecuta el archivo `create_user.sql`:

```sql
-- Ejecutar en SQL Editor de Supabase
SELECT auth.signup(
    'admin@pmlink.com',
    'admin123456',
    '{"nombres": "Administrador", "apellidos": "PM-Link"}'::jsonb
);

-- Confirmar email automáticamente (para testing)
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@pmlink.com' AND email_confirmed_at IS NULL;
```

**Opción 3 - Desde el Dashboard:**
1. Ve a Authentication > Users en Supabase
2. Clic en "Add user"
3. Agrega:
   - Email: admin@pmlink.com
   - Password: admin123456
   - Auto Confirm User: ✓ (habilitado)

**Credenciales de prueba:**
- **Email**: admin@pmlink.com
- **Password**: admin123456

### 5. Verificar la configuración
1. Inicia la aplicación con `npm run dev`
2. Ve a `http://localhost:3004/pmlinkadmin/`
3. Intenta hacer login con las credenciales:
   - Email: admin@pmlink.com
   - Password: admin123456

## Estructura de la Base de Datos

### Tablas principales:
- **rol**: Roles de usuario (Administrador PM-Link, Administrador Empresa, Técnico, Usuario)
- **empresa**: Empresas cliente
- **local**: Sedes/locales de las empresas
- **usuario**: Usuarios del sistema (vinculado con auth.users)
- **TiposMantenimiento**: Tipos de mantenimiento
- **equipos**: Equipos y activos

### Políticas de Seguridad (RLS):
- Los usuarios pueden ver su propia información
- Los administradores pueden ver todos los datos
- Acceso controlado por roles

## Datos de Prueba

El script incluye:
- 4 roles predefinidos
- 1 empresa de prueba
- Configuración automática de usuarios nuevos como administradores

## Troubleshooting

### Error de conexión:
- Verifica que las variables de entorno estén configuradas correctamente
- Verifica que la URL y clave de Supabase sean correctas

### Error de autenticación:
- Verifica que el usuario existe en Authentication > Users
- Verifica que las políticas RLS estén configuradas
- Revisa los logs en el dashboard de Supabase
