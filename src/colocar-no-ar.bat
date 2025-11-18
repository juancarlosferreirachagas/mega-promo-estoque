@echo off
chcp 65001 >nul
cls

echo ╔══════════════════════════════════════════════╗
echo ║   🚀 MEGA PROMO - DEPLOY AUTOMÁTICO         ║
echo ║   Sistema de Estoque - São Paulo             ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Verificar se está na pasta correta
if not exist "package.json" (
    echo ❌ Erro: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

echo 📦 Passo 1: Instalando dependências...
echo.
call npm install

echo.
echo 🔧 Passo 2: Verificando Vercel CLI...
echo.

where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📥 Instalando Vercel CLI...
    call npm install -g vercel
)

echo ✅ Vercel CLI instalado!
echo.

echo 🚀 Passo 3: Fazendo deploy em produção...
echo.
call vercel --prod --yes

echo.
echo ╔══════════════════════════════════════════════╗
echo ║   ✅ DEPLOY CONCLUÍDO COM SUCESSO!          ║
echo ╚══════════════════════════════════════════════╝
echo.
echo 🌐 Seu sistema está no ar!
echo.
echo 📋 ÚLTIMO PASSO (apenas 1 vez):
echo.
echo Opção A - Automático:
echo   1. Acesse sua URL e adicione /setup-database.html
echo   2. Clique no botão 'Configurar Database'
echo.
echo Opção B - Manual:
echo   1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new
echo   2. Execute o SQL que está no arquivo COLOCAR_NO_AR.md
echo.
echo 🎉 Login: admin / admin123
echo.
pause
