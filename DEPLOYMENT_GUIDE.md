# 🚀 Guía Completa de Deployment - PMLink Admin

## ✅ Archivos Preparados

Tu aplicación está lista para deployment. Los archivos se encuentran en:
- **Carpeta:** `temp-deploy/`
- **Archivo ZIP:** `pmlinkadmin-production.zip`

## 📁 Estructura de Archivos

```
temp-deploy/
├── index.html              # Página principal
├── assets/                 # Archivos CSS y JS compilados
│   ├── index.Bzb8vyLm.js   # JavaScript de la aplicación
│   └── index.D6ENHKjC.css  # Estilos CSS
├── .htaccess              # Configuración para Apache
├── .env                   # Variables de entorno (¡IMPORTANTE!)
├── INSTRUCCIONES.txt      # Instrucciones básicas
└── otros archivos...

```

## 🌐 Pasos para Deployment

### 1. **Subir Archivos al Servidor**

#### Opción A: Hosting Compartido (cPanel, Plesk, etc.)
```
/public_html/pmlinkadmin/
├── index.html
├── assets/
├── .htaccess
├── .env
└── otros archivos...
```

#### Opción B: VPS/Servidor Dedicado
```
/var/www/pmlinkadmin/
├── index.html
├── assets/
├── .htaccess
├── .env
└── otros archivos...
```

### 2. **Configurar Variables de Entorno**

**¡MUY IMPORTANTE!** Edita el archivo `.env` con tus datos reales de Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_real

# Application Configuration
VITE_APP_NAME=PMLink Admin
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
VITE_APP_BASE_PATH=/pmlinkadmin
```

**¿Dónde obtener estos valores?**
1. Ve a tu dashboard de Supabase
2. Settings > API
3. Copia la URL y la clave anónima (anon key)

### 3. **Configuración del Servidor Web**

#### Para Apache (Hosting Compartido)
El archivo `.htaccess` ya está incluido y configurado.

#### Para Nginx (VPS)
Agrega esta configuración a tu archivo de Nginx:

```nginx
location /pmlinkadmin {
    alias /var/www/pmlinkadmin;
    try_files $uri $uri/ /pmlinkadmin/index.html;
    
    # Cache para archivos estáticos
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. **Verificar el Deployment**

1. **Accede a tu aplicación:** `https://tudominio.com/pmlinkadmin/`
2. **Prueba el login:** admin@pmlink.com / admin123
3. **Verifica las funcionalidades:**
   - ✅ Dashboard
   - ✅ Gestión de Empresas
   - ✅ Gestión de Locales

### 5. **Troubleshooting**

#### Problema: Página en blanco
- **Causa:** Variables de entorno incorrectas
- **Solución:** Verifica `.env` con datos reales de Supabase

#### Problema: Error 404 al navegar
- **Causa:** Configuración de rutas incorrecta
- **Solución:** Verifica `.htaccess` (Apache) o configuración Nginx

#### Problema: No puede conectar a la base de datos
- **Causa:** URL o clave de Supabase incorrecta
- **Solución:** Verifica las variables en `.env`

## 🔧 Comandos Útiles

### Para hosting compartido (cPanel):
1. Sube el archivo ZIP a File Manager
2. Extráelo en `/public_html/pmlinkadmin/`
3. Edita `.env` desde el File Manager

### Para VPS:
```bash
# Subir archivos
scp pmlinkadmin-production.zip usuario@servidor:/tmp/

# Extraer en el servidor
unzip /tmp/pmlinkadmin-production.zip -d /var/www/pmlinkadmin/

# Configurar permisos
chown -R www-data:www-data /var/www/pmlinkadmin/
chmod -R 755 /var/www/pmlinkadmin/
```

## 📞 Soporte

Si tienes problemas con el deployment:
1. Verifica que todas las variables de entorno estén correctas
2. Revisa los logs del servidor web
3. Verifica que Supabase esté accesible desde tu servidor

---

## 🎉 ¡Listo!

Tu aplicación PMLink Admin debería estar funcionando en:
**https://tudominio.com/pmlinkadmin/**

¡Felicidades por tu deployment exitoso! 🚀
