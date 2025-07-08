# Script para subir archivos al VPS usando SCP
# Ejecutar desde PowerShell en el directorio del proyecto

$VPS_HOST = "212.85.17.125"
$VPS_USER = "root"
$LOCAL_PATH = "C:\Visual Studio Code\pmlinkadmin\temp-deploy\*"
$REMOTE_PATH = "/var/www/pmlinkadmin/"

Write-Host "========================================" -ForegroundColor Green
Write-Host "SUBIENDO ARCHIVOS AL VPS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Origen: $LOCAL_PATH" -ForegroundColor Yellow
Write-Host "Destino: ${VPS_USER}@${VPS_HOST}:${REMOTE_PATH}" -ForegroundColor Yellow
Write-Host ""
Write-Host "Credenciales SSH:" -ForegroundColor Cyan
Write-Host "- Host: $VPS_HOST" -ForegroundColor Cyan
Write-Host "- Usuario: $VPS_USER" -ForegroundColor Cyan
Write-Host "- Contraseña: Trav13s0#2025" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el directorio local
if (!(Test-Path "C:\Visual Studio Code\pmlinkadmin\temp-deploy")) {
    Write-Host "ERROR: No existe el directorio temp-deploy" -ForegroundColor Red
    Write-Host "Ejecuta primero: .\deploy\prepare-deployment.bat" -ForegroundColor Red
    exit 1
}

Write-Host "Archivos a subir:" -ForegroundColor Green
Get-ChildItem "C:\Visual Studio Code\pmlinkadmin\temp-deploy" -Recurse | ForEach-Object {
    Write-Host "  $($_.FullName.Replace('C:\Visual Studio Code\pmlinkadmin\temp-deploy\', ''))" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "COMANDOS PARA EJECUTAR:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Opción 1: SCP (si está disponible)
Write-Host "OPCIÓN 1 - Usando SCP:" -ForegroundColor Yellow
Write-Host "scp -r `"C:\Visual Studio Code\pmlinkadmin\temp-deploy\*`" root@212.85.17.125:/var/www/pmlinkadmin/" -ForegroundColor White
Write-Host ""

# Opción 2: WinSCP
Write-Host "OPCIÓN 2 - Usando WinSCP:" -ForegroundColor Yellow
Write-Host "1. Abrir WinSCP" -ForegroundColor White
Write-Host "2. Protocolo: SFTP" -ForegroundColor White
Write-Host "3. Host: 212.85.17.125" -ForegroundColor White
Write-Host "4. Usuario: root" -ForegroundColor White
Write-Host "5. Contraseña: Trav13s0#2025" -ForegroundColor White
Write-Host "6. Navegar a /var/www/pmlinkadmin/" -ForegroundColor White
Write-Host "7. Subir todos los archivos de temp-deploy\" -ForegroundColor White
Write-Host ""

# Verificar si SCP está disponible
try {
    $scpTest = Get-Command scp -ErrorAction Stop
    Write-Host "SCP está disponible. ¿Ejecutar subida automática? (s/n): " -ForegroundColor Green -NoNewline
    $response = Read-Host
    
    if ($response -eq "s" -or $response -eq "S") {
        Write-Host "Ejecutando SCP..." -ForegroundColor Green
        scp -r "C:\Visual Studio Code\pmlinkadmin\temp-deploy\*" root@212.85.17.125:/var/www/pmlinkadmin/
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Archivos subidos exitosamente!" -ForegroundColor Green
        } else {
            Write-Host "❌ Error al subir archivos" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "SCP no está disponible. Usar WinSCP o instalar OpenSSH." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SIGUIENTES PASOS:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "1. Conectar al VPS: ssh root@212.85.17.125" -ForegroundColor White
Write-Host "2. Seguir comandos en: deploy\vps-setup-commands.md" -ForegroundColor White
Write-Host "3. Editar .env con credenciales reales de Supabase" -ForegroundColor White
Write-Host "4. Configurar Nginx y recargar" -ForegroundColor White
Write-Host "5. Probar: http://212.85.17.125/pmlinkadmin/" -ForegroundColor White
