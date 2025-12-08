# PMLINK CMMS - Script de Despliegue a Producción

Write-Host "🚀 INICIANDO DESPLIEGUE A PRODUCCIÓN - PMLINK CMMS" -ForegroundColor Green
Write-Host "=" * 60

# 1. Verificar instalaciones
Write-Host "🔍 Verificando dependencias..." -ForegroundColor Yellow

# Verificar Node.js
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar Expo CLI
$expoVersion = npx expo --version 2>$null
if ($expoVersion) {
    Write-Host "✅ Expo CLI: $expoVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Expo CLI no encontrado" -ForegroundColor Red
    exit 1
}

# 2. Instalar EAS CLI si no existe
Write-Host "🔧 Verificando EAS CLI..." -ForegroundColor Yellow
$easVersion = npx eas-cli --version 2>$null
if (-not $easVersion) {
    Write-Host "📦 Instalando EAS CLI..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
}

# 3. Configurar variables de entorno de producción
Write-Host "⚙️ Configurando variables de entorno de producción..." -ForegroundColor Yellow

# Copiar archivos de producción
if (Test-Path "app.json.production") {
    Copy-Item "app.json.production" "app.json" -Force
    Write-Host "✅ app.json configurado para producción" -ForegroundColor Green
}

if (Test-Path "eas.json.production") {
    Copy-Item "eas.json.production" "eas.json" -Force
    Write-Host "✅ eas.json configurado para producción" -ForegroundColor Green
}

# 4. Limpiar y reinstalar dependencias
Write-Host "🧹 Limpiando e instalando dependencias..." -ForegroundColor Yellow
Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
npm install

# 5. Verificar configuración de Supabase
Write-Host "🔍 Verificando configuración de Supabase..." -ForegroundColor Yellow
if (Test-Path "lib/supabase.js") {
    $supabaseConfig = Get-Content "lib/supabase.js" -Raw
    if ($supabaseConfig -match "localhost" -or $supabaseConfig -match "127.0.0.1") {
        Write-Host "⚠️ ADVERTENCIA: Configuración de Supabase parece ser local" -ForegroundColor Red
        Write-Host "Asegúrate de usar URLs de producción" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar o Ctrl+C para cancelar"
    } else {
        Write-Host "✅ Configuración de Supabase verificada" -ForegroundColor Green
    }
}

# 6. Crear builds
Write-Host "🏗️ Creando builds de producción..." -ForegroundColor Yellow

Write-Host "📱 ¿Qué plataformas quieres buildear?" -ForegroundColor Cyan
Write-Host "1. Solo Android (APK para testing)" -ForegroundColor White
Write-Host "2. Solo Android (AAB para Play Store)" -ForegroundColor White
Write-Host "3. Solo iOS" -ForegroundColor White
Write-Host "4. Ambas plataformas" -ForegroundColor White

$choice = Read-Host "Selecciona una opción (1-4)"

switch ($choice) {
    "1" { 
        Write-Host "📱 Creando APK de Android..." -ForegroundColor Yellow
        npx eas build --platform android --profile preview
    }
    "2" { 
        Write-Host "📱 Creando AAB de Android..." -ForegroundColor Yellow
        npx eas build --platform android --profile production
    }
    "3" { 
        Write-Host "🍎 Creando build de iOS..." -ForegroundColor Yellow
        npx eas build --platform ios --profile production
    }
    "4" { 
        Write-Host "📱🍎 Creando builds para ambas plataformas..." -ForegroundColor Yellow
        npx eas build --platform all --profile production
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ PROCESO DE BUILD INICIADO" -ForegroundColor Green
Write-Host "📊 Puedes monitorear el progreso en: https://expo.dev" -ForegroundColor Cyan
Write-Host "⏱️ Los builds típicamente toman 10-20 minutos" -ForegroundColor Yellow