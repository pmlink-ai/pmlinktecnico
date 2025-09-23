#!/usr/bin/env powershell
# Script para reiniciar Expo con configuración predefinida

Write-Host "🔄 Reiniciando Expo en puerto 8085..." -ForegroundColor Cyan

# Detener cualquier proceso de Expo que esté corriendo
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo*" } | Stop-Process -Force

# Esperar un momento para que se libere el puerto
Start-Sleep -Seconds 2

# Iniciar Expo con cache limpio en puerto específico
npx expo start --port 8085 --clear