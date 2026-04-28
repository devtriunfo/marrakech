@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════╗
echo ║     MARRAKECH - Admin Dashboard        ║
echo ║           Primeira Execução             ║
echo ╚════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não foi encontrado!
    echo.
    echo Baixe e instale Node.js em:
    echo https://nodejs.org
    echo.
    echo Certifique-se de marcar "Add to PATH" durante a instalação.
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js detectado
echo.

REM Navegar para o diretório do app
cd /d "%~dp0"

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo ✓ Dependências instaladas com sucesso
echo.

REM Compilar Next.js
echo 🔨 Compilando aplicação...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro ao compilar
    pause
    exit /b 1
)

echo.
echo ✓ Compilação concluída!
echo.

REM Iniciar servidor
echo ═════════════════════════════════════════
echo 🚀  SERVIDOR INICIANDO...
echo.
echo 📍 Acesse em: http://localhost:3000/admin/login
echo.
echo ⚠️  NÃO feche esta janela enquanto usar o app
echo ═════════════════════════════════════════
echo.

REM Abrir navegador automaticamente
timeout /t 3 /nobreak
start http://localhost:3000/admin/login

call npm start

pause
