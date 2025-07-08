#!/bin/bash
# Script de deployment para PMLink Admin
# Ejecutar en el servidor después de subir los archivos

# Variables de configuración
APP_NAME="pmlinkadmin"
DEPLOY_PATH="/var/www/pmlinkadmin"
NGINX_CONFIG="/etc/nginx/sites-available/pmlinkadmin"
BACKUP_PATH="/var/backups/pmlinkadmin"

echo "🚀 Iniciando deployment de PMLink Admin..."

# 1. Crear backup de la versión anterior (si existe)
if [ -d "$DEPLOY_PATH" ]; then
    echo "📦 Creando backup de la versión anterior..."
    sudo mkdir -p "$BACKUP_PATH"
    sudo cp -r "$DEPLOY_PATH" "$BACKUP_PATH/backup-$(date +%Y%m%d-%H%M%S)"
fi

# 2. Crear directorio de la aplicación
echo "📁 Preparando directorio de deployment..."
sudo mkdir -p "$DEPLOY_PATH"

# 3. Copiar archivos del build (asumir que están en ./build)
echo "📂 Copiando archivos de la aplicación..."
sudo cp -r ./build/* "$DEPLOY_PATH/"

# 4. Configurar permisos
echo "🔐 Configurando permisos..."
sudo chown -R www-data:www-data "$DEPLOY_PATH"
sudo chmod -R 755 "$DEPLOY_PATH"

# 5. Configurar Nginx (si no existe)
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "⚙️ Configurando Nginx..."
    sudo cp ./deploy/nginx.conf "$NGINX_CONFIG"
    sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    
    # Verificar configuración de Nginx
    sudo nginx -t
    if [ $? -eq 0 ]; then
        echo "✅ Configuración de Nginx válida"
        sudo systemctl reload nginx
    else
        echo "❌ Error en la configuración de Nginx"
        exit 1
    fi
else
    echo "ℹ️ Configuración de Nginx ya existe"
fi

# 6. Verificar que el servicio web esté funcionando
echo "🔍 Verificando servicios..."
sudo systemctl status nginx --no-pager

echo "✅ Deployment completado!"
echo "🌐 La aplicación debería estar disponible en: http://tu-dominio.com/pmlinkadmin/"
echo ""
echo "📋 Pasos adicionales recomendados:"
echo "   1. Verificar que las variables de entorno estén configuradas"
echo "   2. Configurar SSL/HTTPS si es necesario"
echo "   3. Configurar monitoreo y logs"
echo "   4. Realizar pruebas de funcionamiento"
