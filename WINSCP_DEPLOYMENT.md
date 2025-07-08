# 🔌 Deployment con WinSCP - PMLink Admin en Hostinger

## 📋 Configuración de WinSCP para Hostinger

### 1. **Obtener Datos de Conexión de Hostinger**

1. **Ve a hPanel de Hostinger**
2. **Busca "FTP Access" o "Acceso FTP"**
3. **Anota los siguientes datos:**
   ```
   Servidor FTP: ftp.tudominio.com (o IP que te den)
   Usuario FTP: tu_usuario_ftp
   Contraseña: tu_contraseña_ftp
   Puerto: 21 (FTP) o 22 (SFTP)
   ```

### 2. **Configurar WinSCP**

1. **Abrir WinSCP**
2. **Crear nueva sesión:**
   - **File protocol:** SFTP o FTP
   - **Host name:** `ftp.tudominio.com` (o la IP de Hostinger)
   - **Port number:** `22` (SFTP) o `21` (FTP)
   - **User name:** Tu usuario FTP de Hostinger
   - **Password:** Tu contraseña FTP

3. **Configuración avanzada (recomendado):**
   - Click en "Advanced"
   - Directories → Remote directory: `/public_html`
   - Click "OK"

4. **Guardar configuración:**
   - Click "Save"
   - Nombre: "Hostinger - PMLink"

### 3. **Conectar y Subir Archivos**

#### Paso a paso:

1. **Conectar a Hostinger:**
   - Click "Login" en WinSCP
   - Acepta el certificado si te pregunta

2. **Navegar en el servidor:**
   ```
   Lado derecho (servidor): /public_html/
   Lado izquierdo (tu PC): C:\Visual Studio Code\pmlinkadmin\temp-deploy\
   ```

3. **Crear carpeta pmlinkadmin:**
   - En el lado derecho (servidor), click derecho en `/public_html/`
   - "New" → "Directory"
   - Nombre: `pmlinkadmin`
   - Entra a la carpeta creada

4. **Subir archivos:**
   - En el lado izquierdo, navega a: `C:\Visual Studio Code\pmlinkadmin\temp-deploy\`
   - Selecciona TODOS los archivos (Ctrl+A)
   - Arrastra del lado izquierdo al derecho
   - O click derecho → "Upload"

### 4. **Verificar la Subida**

Deberías ver en `/public_html/pmlinkadmin/`:
```
index.html
assets/
├── index.Bzb8vyLm.js
└── index.D6ENHKjC.css
.htaccess
.env
INSTRUCCIONES.txt
vite.svg
test.html
```

### 5. **Editar Variables de Entorno**

**Opción A: Editar con WinSCP**
1. En WinSCP, doble click en el archivo `.env`
2. Se abrirá un editor
3. Reemplaza el contenido:

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

4. Guarda y cierra el editor

**Opción B: Editar desde hPanel**
1. Ve a hPanel → File Manager
2. Navega a `/public_html/pmlinkadmin/.env`
3. Click derecho → "Edit"
4. Modifica el contenido
5. Guarda

### 6. **Configuración de Permisos (Importante)**

En WinSCP, verifica los permisos:
- **Carpetas:** 755 (rwxr-xr-x)
- **Archivos:** 644 (rw-r--r--)

Para cambiar permisos:
1. Click derecho en archivo/carpeta
2. "Properties"
3. Ajusta permisos si es necesario

### 7. **Probar la Aplicación**

1. **Accede a:** `https://tudominio.com/pmlinkadmin/`
2. **Login:** admin@pmlink.com / admin123
3. **Verifica que todo funcione**

## 🔧 Troubleshooting WinSCP + Hostinger

### Problema: No puedo conectar
**Solución:**
1. Verifica los datos FTP en hPanel
2. Prueba con SFTP (puerto 22) en lugar de FTP
3. Desactiva firewall temporalmente

### Problema: Acceso denegado
**Solución:**
1. Verifica usuario y contraseña
2. Asegúrate de estar en `/public_html/`
3. Contacta soporte de Hostinger si persiste

### Problema: Archivos no se ven
**Solución:**
1. Verifica que estés en `/public_html/pmlinkadmin/`
2. Revisa permisos de archivos
3. Espera unos minutos para propagación

## 🎯 Ventajas de WinSCP vs File Manager Web

### ✅ WinSCP:
- Más rápido para archivos grandes
- Mejor para múltiples archivos
- Editor integrado
- Sincronización de carpetas
- Gestión de permisos fácil

### ✅ File Manager Web:
- No requiere software adicional
- Funciona desde cualquier lugar
- Interfaz más simple
- Ideal para cambios rápidos

## 📱 Pasos Rápidos

1. **WinSCP:** Conectar a Hostinger
2. **Servidor:** `/public_html/` → Crear carpeta `pmlinkadmin`
3. **Local:** `C:\Visual Studio Code\pmlinkadmin\temp-deploy\`
4. **Subir:** Todos los archivos a `/public_html/pmlinkadmin/`
5. **Editar:** `.env` con datos reales de Supabase
6. **Probar:** `https://tudominio.com/pmlinkadmin/`

---

**¿Necesitas ayuda con la configuración de WinSCP o tienes problemas de conexión?**
