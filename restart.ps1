#!/usr/bin/env powershell
# Script para reiniciar Expo con limpieza automática de puerto

Write-Host "🔄 Limpiando puerto 8085 y reiniciando Expo..." -ForegroundColor Cyan

# Función para matar procesos en el puerto 8085
function Kill-Port {
    param($Port)
    Write-Host "🧹 Limpiando puerto $Port..." -ForegroundColor Yellow
    
    # Buscar procesos usando el puerto
    $processes = netstat -ano | findstr (":${Port}")
    if ($processes) {
        Write-Host "Procesos encontrados en puerto ${Port}:" -ForegroundColor Red
        Write-Host $processes
        
        # Extraer PIDs y matarlos
        $processes | ForEach-Object {
            $processId = ($_ -split '\s+')[-1]
            if ($processId -match '^\d+$') {
                try {
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Proceso $processId terminado" -ForegroundColor Green
                } catch {
                    Write-Host "⚠️ No se pudo terminar proceso $processId" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "✅ Puerto ${Port} está libre" -ForegroundColor Green
    }
}

# Detener procesos de node/expo
Write-Host "🛑 Deteniendo procesos de Node/Expo..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "expo" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Limpiar puerto específico
Kill-Port 8085

# Esperar para que se liberen los recursos
Write-Host "⏳ Esperando liberación de recursos..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

# Iniciar Expo con cache limpio
Write-Host "🚀 Iniciando Expo en puerto 8085..." -ForegroundColor Green
npx expo start --port 8085 --clear