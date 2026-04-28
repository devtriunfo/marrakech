@echo off
REM Marrakech - Admin Dashboard
REM Este script inicia o servidor Node.js e abre a página de login

cd /d "%~dp0"

REM Verificar se Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js não foi encontrado. Por favor, instale Node.js primeiro.
    pause
    exit /b 1
)

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo Instalando dependências...
    call npm install
)

REM Iniciar o servidor
echo.
echo ========================================
echo    Marrakech - Admin Dashboard
echo ========================================
echo.
echo Iniciando servidor...
echo O navegador abrirá automaticamente em poucos segundos.
echo.

REM Build Next.js se necessário
if not exist ".next" (
    echo Compilando Next.js...
    call npm run build
)

REM Iniciar o servidor Node.js
node server.js

pause
