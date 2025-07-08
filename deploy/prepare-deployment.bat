@echo off
REM Script para Windows - Preparar archivos para deployment
REM Ejecutar desde: c:\Visual Studio Code\pmlinkadmin\

echo 🚀 Preparando archivos para deployment...

REM Verificar que existe el build
if not exist "build\" (
    echo ❌ Error: No existe la carpeta 'build'. Ejecuta 'npm run build' primero.
    echo 🔧 Ejecutando build automáticamente...
    call npm run build
    if errorlevel 1 (
        echo ❌ Error en el build. Verifica tu código.
        pause
        exit /b 1
    )
)

REM Crear carpeta temporal para deployment
if exist "temp-deploy\" rmdir /s /q "temp-deploy\"
mkdir "temp-deploy"

echo 📂 Copiando archivos del build...
xcopy "build\*" "temp-deploy\" /s /e /q

REM Copiar archivos de configuración
echo ⚙️ Copiando archivos de configuración...
copy "deploy\.htaccess" "temp-deploy\"
copy "deploy\.env.production" "temp-deploy\.env"

REM Crear archivo de instrucciones
echo 📋 Creando archivo de instrucciones...
echo INSTRUCCIONES DE DEPLOYMENT > "temp-deploy\INSTRUCCIONES.txt"
echo. >> "temp-deploy\INSTRUCCIONES.txt"
echo 1. Subir todos estos archivos a tu servidor >> "temp-deploy\INSTRUCCIONES.txt"
echo 2. Si usas hosting compartido, subir a /public_html/pmlinkadmin/ >> "temp-deploy\INSTRUCCIONES.txt"
echo 3. Si usas VPS, subir a /var/www/pmlinkadmin/ >> "temp-deploy\INSTRUCCIONES.txt"
echo 4. Configurar las variables de entorno en .env >> "temp-deploy\INSTRUCCIONES.txt"
echo 5. Configurar el servidor web (Nginx/Apache) >> "temp-deploy\INSTRUCCIONES.txt"
echo. >> "temp-deploy\INSTRUCCIONES.txt"
echo Variables de entorno necesarias: >> "temp-deploy\INSTRUCCIONES.txt"
echo - VITE_SUPABASE_URL >> "temp-deploy\INSTRUCCIONES.txt"
echo - VITE_SUPABASE_ANON_KEY >> "temp-deploy\INSTRUCCIONES.txt"

REM Crear archivo ZIP si está disponible
echo 📦 Intentando crear archivo ZIP...
if exist "C:\Program Files\7-Zip\7z.exe" (
    "C:\Program Files\7-Zip\7z.exe" a -tzip "pmlinkadmin-deploy.zip" "temp-deploy\*"
    echo ✅ Archivo ZIP creado: pmlinkadmin-deploy.zip
) else (
    echo ℹ️ 7-Zip no encontrado. Los archivos están en temp-deploy\
)

echo.
echo ✅ Preparación completada!
echo.
echo 📁 Archivos listos en: temp-deploy\
if exist "pmlinkadmin-deploy.zip" echo 📦 Archivo ZIP: pmlinkadmin-deploy.zip
echo.
echo 🌐 Próximos pasos:
echo    1. Subir archivos a tu servidor
echo    2. Configurar variables de entorno
echo    3. Configurar servidor web
echo    4. Probar la aplicación
echo.
pause
