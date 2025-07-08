@echo off
echo ========================================
echo Verificando estado del VPS
echo ========================================
echo.
echo Credenciales:
echo Host: 212.85.17.125
echo User: root
echo Password: Trav13s0#2025
echo.
echo ========================================
echo Comandos a ejecutar en el VPS:
echo ========================================
echo.
echo 1. Verificar directorio actual y /var/www/:
echo    pwd
echo    ls -la /var/www/
echo.
echo 2. Verificar Nginx:
echo    nginx -v
echo    systemctl status nginx
echo.
echo 3. Crear directorio para la aplicacion:
echo    mkdir -p /var/www/pmlinkadmin
echo    chown -R www-data:www-data /var/www/pmlinkadmin
echo    chmod -R 755 /var/www/pmlinkadmin
echo.
echo 4. Verificar estructura:
echo    ls -la /var/www/pmlinkadmin/
echo.
echo ========================================
echo Conectar ahora con:
echo ssh root@212.85.17.125
echo ========================================
pause
