@echo off
echo ========================================
echo  WhatsApp Bot Builder - Instalacao
echo ========================================
echo.

:: Verificar se Node.js esta instalado
echo [1/7] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale Node.js em: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado

:: Verificar se Python esta instalado
echo [2/7] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Por favor, instale Python em: https://python.org/
    pause
    exit /b 1
)
echo ✓ Python encontrado

:: Verificar se MongoDB esta instalado
echo [3/7] Verificando MongoDB...
mongo --version >nul 2>&1
if errorlevel 1 (
    echo AVISO: MongoDB nao encontrado no PATH
    echo Tentando iniciar servico do MongoDB...
    net start MongoDB >nul 2>&1
) else (
    echo ✓ MongoDB encontrado
)

:: Instalar dependencias do backend
echo [4/7] Configurando backend Python...
cd backend
if not exist venv (
    echo Criando ambiente virtual Python...
    python -m venv venv
)

echo Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo Instalando dependencias Python...
pip install -r requirements.txt

cd ..

:: Instalar dependencias do frontend
echo [5/7] Configurando frontend React...
cd frontend

echo Instalando dependencias Node.js...
npm install

cd ..

:: Verificar se MongoDB esta rodando
echo [6/7] Verificando servicos...
netstat -an | find "27017" >nul
if errorlevel 1 (
    echo Tentando iniciar MongoDB...
    start "" mongod
    timeout /t 3 >nul
)

:: Executar os servicos
echo [7/7] Iniciando aplicacao...
echo.
echo ========================================
echo  Iniciando Backend e Frontend
echo ========================================
echo.
echo Backend rodara em: http://localhost:8000
echo Frontend rodara em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar os servicos
echo.

:: Iniciar backend em segundo plano
start "Backend" cmd /k "cd backend && venv\Scripts\activate.bat && python server.py"

:: Aguardar 3 segundos para backend iniciar
timeout /t 3 >nul

:: Iniciar frontend
cd frontend
start "Frontend" cmd /k "npm start"

echo.
echo ========================================
echo  Instalacao e Execucao Completa!
echo ========================================
echo.
echo Acesse o sistema em: http://localhost:3000
echo.
echo Contas padrao:
echo Admin: adm@adm.com / adm123
echo Mod: mod@mod.com / mod123
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
