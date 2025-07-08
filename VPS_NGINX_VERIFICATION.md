# 🔍 Verificación VPS con Nginx - Lista de comandos para ejecutar

## 📋 Comandos para verificar la configuración actual del VPS

### 1. **Verificar estructura de directorios web:**
```bash
# Verificar si existe /var/www/
ls -la /var/www/

# Verificar configuración actual de Nginx
sudo nginx -t

# Ver configuración de sitios habilitados
ls -la /etc/nginx/sites-enabled/

# Ver configuración del sitio por defecto
cat /etc/nginx/sites-enabled/default
```

### 2. **Verificar configuración de Nginx actual:**
```bash
# Ver configuración completa de Nginx
sudo cat /etc/nginx/nginx.conf

# Ver configuración específica del dominio (si existe)
sudo cat /etc/nginx/sites-available/tudominio.com
```

### 3. **Verificar permisos y propietario:**
```bash
# Ver propietario de /var/www/
ls -la /var/www/

# Ver usuario de Nginx
ps aux | grep nginx
```

### 4. **Verificar si ya hay algo configurado:**
```bash
# Ver qué hay actualmente en /var/www/
sudo find /var/www/ -type f -name "*.html" 2>/dev/null

# Verificar si el dominio ya apunta al servidor
curl -I http://tu-ip-servidor/
```

## 🔧 **Configuración recomendada para PMLink Admin**

### **Estructura sugerida:**
```
/var/www/pmlinkadmin/
├── index.html
├── assets/
├── .env
└── otros archivos...
```

### **Configuración de Nginx para PMLink Admin:**
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    
    # Configuración para PMLink Admin en subdirectorio
    location /pmlinkadmin {
        alias /var/www/pmlinkadmin;
        try_files $uri $uri/ /pmlinkadmin/index.html;
        
        # Headers para SPA
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Configuración para el sitio principal (si existe)
    location / {
        root /var/www/html;
        index index.html index.htm;
        try_files $uri $uri/ =404;
    }
}
```

## 📝 **Lista de verificación ANTES de subir archivos:**

### ✅ **Ejecutar en el VPS:**

1. **Verificar estructura actual:**
   ```bash
   sudo ls -la /var/www/
   ```

2. **Crear directorio si no existe:**
   ```bash
   sudo mkdir -p /var/www/pmlinkadmin
   sudo chown -R www-data:www-data /var/www/pmlinkadmin
   sudo chmod -R 755 /var/www/pmlinkadmin
   ```

3. **Verificar configuración de Nginx:**
   ```bash
   sudo cat /etc/nginx/sites-enabled/default
   ```

4. **Backup de configuración actual:**
   ```bash
   sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.backup
   ```

## 🚀 **Plan de deployment para VPS:**

### **Opción A: Usar WinSCP con configuración SFTP**
- **Host:** IP del servidor
- **Port:** 22
- **Protocol:** SFTP
- **Directory:** `/var/www/pmlinkadmin/`

### **Opción B: Usar SCP desde línea de comandos**
```bash
# Subir archivos desde tu PC
scp -r C:\Visual Studio Code\pmlinkadmin\temp-deploy\* usuario@ip-servidor:/var/www/pmlinkadmin/
```

### **Opción C: Usar rsync (recomendado)**
```bash
# Sincronizar archivos
rsync -avz C:\Visual Studio Code\pmlinkadmin\temp-deploy/ usuario@ip-servidor:/var/www/pmlinkadmin/
```

## ❓ **Preguntas para verificar:**

1. **¿Tienes acceso SSH al VPS?**
2. **¿Conoces la IP del servidor?**
3. **¿Tienes las credenciales de usuario sudo?**
4. **¿Ya hay un sitio web funcionando en el VPS?**
5. **¿Quieres PMLink Admin en un subdirectorio (/pmlinkadmin) o como sitio principal?**

## 🛠️ **Próximos pasos sugeridos:**

1. **Ejecutar comandos de verificación** en el VPS
2. **Confirmar la estructura** y configuración actual
3. **Preparar configuración de Nginx** específica
4. **Subir archivos** a la ubicación correcta
5. **Configurar Nginx** para servir la aplicación
6. **Probar** la aplicación

¿Puedes ejecutar algunos de estos comandos de verificación en tu VPS para confirmar la configuración actual?
