# 🌐 Deployment en Hostinger - PMLink Admin

## 📋 Pasos Específicos para Hostinger.com

### 1. **Preparar los Archivos (✅ Ya está listo)**
- Tienes el archivo: `pmlinkadmin-production.zip`
- Ubicación: `C:\Visual Studio Code\pmlinkadmin\pmlinkadmin-production.zip`

### 2. **Acceder a Hostinger hPanel**

1. Ve a [hostinger.com](https://hostinger.com)
2. Inicia sesión en tu cuenta
3. Accede al **hPanel** (Panel de Control)
4. Selecciona tu dominio/hosting

### 3. **Subir Archivos usando File Manager**

#### Paso a paso:

1. **En hPanel, busca "File Manager"**
   - Click en "Website" > "File Manager"
   - O busca "Administrador de archivos"

2. **Navegar a la carpeta correcta:**
   ```
   /public_html/
   ```

3. **Crear carpeta pmlinkadmin:**
   - Click derecho en `public_html`
   - "New Folder" / "Nueva Carpeta"
   - Nombre: `pmlinkadmin`

4. **Subir el archivo ZIP:**
   - Entra a la carpeta `public_html/pmlinkadmin/`
   - Click en "Upload" / "Subir archivos"
   - Selecciona `pmlinkadmin-production.zip`
   - Espera a que se suba completamente

5. **Extraer el archivo:**
   - Click derecho en `pmlinkadmin-production.zip`
   - Selecciona "Extract" / "Extraer"
   - Confirma la extracción
   - Elimina el archivo ZIP después de extraer

### 4. **Configurar Variables de Entorno**

**¡MUY IMPORTANTE!** Debes editar el archivo `.env`:

1. **En File Manager, abre el archivo `.env`**
2. **Reemplaza con tus datos reales de Supabase:**

```env
# Supabase Configuration - CAMBIAR POR TUS DATOS REALES
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxx

# Application Configuration
VITE_APP_NAME=PMLink Admin
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_APP_BASE_PATH=/pmlinkadmin
```

**¿Dónde obtener estos valores?**
1. Ve a [supabase.com](https://supabase.com)
2. Abre tu proyecto
3. Settings > API
4. Copia la "URL" y "anon public key"

### 5. **Estructura Final en Hostinger**

Después de extraer, deberías tener:
```
/public_html/pmlinkadmin/
├── index.html
├── assets/
│   ├── index.Bzb8vyLm.js
│   └── index.D6ENHKjC.css
├── .htaccess
├── .env
├── INSTRUCCIONES.txt
└── otros archivos...
```

### 6. **Verificar el .htaccess**

El archivo `.htaccess` debe estar en `/public_html/pmlinkadmin/.htaccess` y debe contener:

```apache
# Configuración para Hostinger
RewriteEngine On

# Manejar rutas de SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /pmlinkadmin/index.html [QSA,L]

# Cache para assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

### 7. **Probar la Aplicación**

1. **Accede a tu aplicación:**
   ```
   https://tudominio.com/pmlinkadmin/
   ```

2. **Probar el login:**
   - Email: `admin@pmlink.com`
   - Password: `admin123`

3. **Verificar funcionalidades:**
   - ✅ Dashboard carga correctamente
   - ✅ Gestión de Empresas funciona
   - ✅ Gestión de Locales funciona

### 8. **Troubleshooting Específico para Hostinger**

#### Problema: Página en blanco
**Solución:**
1. Verifica que el archivo `.env` tenga las URLs correctas de Supabase
2. Verifica que los archivos estén en `/public_html/pmlinkadmin/` y no en subcarpetas

#### Problema: Error 404 al navegar
**Solución:**
1. Verifica que el archivo `.htaccess` esté presente
2. Asegúrate de que las reglas de reescritura estén habilitadas

#### Problema: No carga estilos o JavaScript
**Solución:**
1. Verifica que la carpeta `assets/` esté presente
2. Verifica permisos de archivos (755 para carpetas, 644 para archivos)

### 9. **Configuración SSL (Recomendado)**

Si tu dominio no tiene SSL habilitado:
1. En hPanel > "Security" > "SSL/TLS"
2. Activa "Let's Encrypt SSL"
3. Espera a que se active (puede tomar unos minutos)

### 10. **Dominio Personalizado (Opcional)**

Si quieres que la aplicación esté en la raíz del dominio:
1. Mueve todos los archivos de `/public_html/pmlinkadmin/` a `/public_html/`
2. Modifica el `.htaccess` y cambia `/pmlinkadmin/` por `/`
3. Actualiza las variables de entorno

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **Con subdirectorio:** `https://tudominio.com/pmlinkadmin/`
- **Sin subdirectorio:** `https://tudominio.com/` (si moviste a la raíz)

## 📞 Soporte Hostinger

Si tienes problemas específicos con Hostinger:
- Chat en vivo disponible 24/7
- Base de conocimientos: [hostinger.com/tutorials](https://hostinger.com/tutorials)
- Soporte técnico especializado en hPanel

---

**¿Necesitas ayuda con algún paso específico?** ¡Pregúntame!
