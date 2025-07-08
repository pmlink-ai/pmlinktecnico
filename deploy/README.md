# 🚀 Guía de Deployment - PMLink Admin

Esta guía te ayudará a desplegar la aplicación PMLink Admin en tu servidor de hosting.

## 📋 Requisitos Previos

### En tu servidor:
- Ubuntu/Debian Linux (recomendado)
- Nginx instalado
- Node.js 18+ (solo si planeas hacer builds en el servidor)
- Acceso SSH al servidor
- Dominio configurado (opcional)

### Información necesaria:
- URL de tu proyecto Supabase
- Clave anónima de Supabase (anon key)
- Acceso SSH a tu servidor

## 🛠️ Pasos de Deployment

### Paso 1: Preparar archivos localmente

```bash
# En tu máquina local
cd "c:\Visual Studio Code\pmlinkadmin"

# Generar build de producción
npm run build

# Comprimir archivos para upload
tar -czf pmlinkadmin-deploy.tar.gz build/ deploy/
```

### Paso 2: Subir archivos al servidor

```bash
# Opción A: Usando SCP
scp pmlinkadmin-deploy.tar.gz usuario@tu-servidor.com:/tmp/

# Opción B: Usando SFTP
sftp usuario@tu-servidor.com
put pmlinkadmin-deploy.tar.gz /tmp/
```

### Paso 3: Configurar en el servidor

```bash
# Conectar al servidor
ssh usuario@tu-servidor.com

# Extraer archivos
cd /tmp
tar -xzf pmlinkadmin-deploy.tar.gz

# Ejecutar script de deployment
chmod +x deploy/deploy.sh
sudo ./deploy/deploy.sh
```

### Paso 4: Configurar variables de entorno

```bash
# Editar configuración de Nginx si es necesario
sudo nano /etc/nginx/sites-available/pmlinkadmin

# Cambiar "tu-dominio.com" por tu dominio real

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔧 Configuración Específica por Tipo de Hosting

### VPS/Servidor Dedicado:
1. Sigue todos los pasos anteriores
2. Configura firewall (puertos 80/443)
3. Considera configurar SSL con Let's Encrypt

### Hosting Compartido:
1. Sube solo la carpeta `build/` via FTP/cPanel
2. Configura el subdirectorio en el panel de control
3. Asegúrate de que las rutas estén configuradas correctamente

### Cloud Hosting (AWS, DigitalOcean, etc.):
1. Usa el mismo proceso que VPS
2. Configura Load Balancer si es necesario
3. Considera usar CDN para mejor rendimiento

## 🌐 URLs de Acceso

Después del deployment, tu aplicación estará disponible en:

- **Desarrollo local**: http://localhost:3003/pmlinkadmin/
- **Producción**: http://tu-dominio.com/pmlinkadmin/

## ✅ Verificación Post-Deployment

1. **Probar acceso**: Visita la URL de producción
2. **Probar login**: Usa admin@pmlink.com / admin123
3. **Probar navegación**: Verifica que todas las rutas funcionen
4. **Probar CRUD**: Crea/edita empresas y locales
5. **Verificar logs**: `sudo tail -f /var/log/nginx/error.log`

## 🔄 Actualizaciones Futuras

Para futuras actualizaciones:

```bash
# 1. Generar nuevo build localmente
npm run build

# 2. Subir archivos
scp -r build/* usuario@servidor:/var/www/pmlinkadmin/

# 3. Reiniciar servicios si es necesario
sudo systemctl reload nginx
```

## 🚨 Troubleshooting

### Problema: "404 Not Found"
- Verificar que Nginx esté configurado correctamente
- Comprobar permisos de archivos
- Verificar que try_files esté configurado para SPA

### Problema: "Error de conexión a Supabase"
- Verificar variables de entorno
- Comprobar conectividad desde el servidor
- Verificar CORS en Supabase

### Problema: "Rutas no funcionan"
- Verificar configuración de history fallback
- Comprobar que base path esté configurado

## 📞 Soporte

Si necesitas ayuda con el deployment, proporciona:
1. Tipo de servidor/hosting
2. Logs de error específicos
3. Configuración actual de Nginx
4. URL donde intentas acceder
