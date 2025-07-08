# Comandos paso a paso para configurar PMLink Admin en VPS

## 1. Verificación inicial del sistema
```bash
# Verificar directorio actual
pwd

# Verificar estructura de /var/www/
ls -la /var/www/

# Verificar versión de Nginx
nginx -v

# Verificar estado de Nginx
systemctl status nginx
```

## 2. Crear directorio para la aplicación
```bash
# Crear directorio para PMLink Admin
mkdir -p /var/www/pmlinkadmin

# Establecer permisos correctos
chown -R www-data:www-data /var/www/pmlinkadmin
chmod -R 755 /var/www/pmlinkadmin

# Verificar creación
ls -la /var/www/pmlinkadmin/
```

## 3. Configurar Nginx
```bash
# Hacer backup de configuración actual
cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup

# Editar configuración (agregar bloque para /pmlinkadmin)
nano /etc/nginx/sites-available/default
```

### Configuración a agregar en /etc/nginx/sites-available/default:
```nginx
# Bloque para PMLink Admin
location /pmlinkadmin {
    alias /var/www/pmlinkadmin;
    index index.html;
    try_files $uri $uri/ /pmlinkadmin/index.html;
    
    # Headers para SPA
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 4. Validar y recargar Nginx
```bash
# Verificar configuración
nginx -t

# Si no hay errores, recargar Nginx
systemctl reload nginx

# Verificar estado
systemctl status nginx
```

## 5. Verificar desde el exterior
```bash
# Desde tu PC local (PowerShell/CMD)
curl http://212.85.17.125/pmlinkadmin/
```

## Notas importantes:
1. Los archivos de la aplicación deben subirse a `/var/www/pmlinkadmin/`
2. El archivo `.env` debe editarse con las credenciales reales de Supabase
3. La aplicación estará disponible en: `http://212.85.17.125/pmlinkadmin/`
