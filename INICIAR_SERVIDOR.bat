@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ════════════════════════════════════════
echo 🚀  MARRAKECH - Admin Dashboard
echo ════════════════════════════════════════
echo.

REM Verificar se Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não detectado
    echo Abra "INSTALAR_E_EXECUTAR.bat" primeiro
    pause
    exit /b 1
)

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo ⚠️  Primeira execução detectada...
    echo Execute "INSTALAR_E_EXECUTAR.bat" para preparar o ambiente
    pause
    exit /b 1
)

REM Verificar se .next existe
if not exist ".next" (
    echo 🔨 Compilando aplicação (primeira vez)...
    call npm run build
    echo.
)

REM Iniciar servidor
echo.
echo 📍 Acesse: http://localhost:3000/admin/login
echo.
echo ⚠️  NÃO feche esta janela enquanto usar o app
echo.

call npm start

pause
