#!/bin/bash

echo "========================================"
echo " WhatsApp Bot Builder - Instalação"
echo "========================================"
echo

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar comando
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $1 encontrado"
        return 0
    else
        echo -e "${RED}✗${NC} $1 não encontrado"
        return 1
    fi
}

# Verificar pré-requisitos
echo "[1/7] Verificando pré-requisitos..."

if ! check_command node; then
    echo "ERRO: Node.js não está instalado!"
    echo "Por favor, instale Node.js em: https://nodejs.org/"
    exit 1
fi

if ! check_command python3; then
    if ! check_command python; then
        echo "ERRO: Python não está instalado!"
        echo "Por favor, instale Python em: https://python.org/"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

if ! check_command pip3; then
    if ! check_command pip; then
        echo "ERRO: pip não está instalado!"
        exit 1
    else
        PIP_CMD="pip"
    fi
else
    PIP_CMD="pip3"
fi

# Verificar MongoDB
echo "[2/7] Verificando MongoDB..."
if command -v mongod >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB encontrado"
    
    # Tentar iniciar MongoDB se não estiver rodando
    if ! pgrep -x "mongod" > /dev/null; then
        echo "Iniciando MongoDB..."
        
        # Detectar sistema operacional
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew >/dev/null 2>&1; then
                brew services start mongodb-community >/dev/null 2>&1 || \
                brew services start mongodb/brew/mongodb-community >/dev/null 2>&1
            else
                mongod --config /usr/local/etc/mongod.conf --fork >/dev/null 2>&1
            fi
        else
            # Linux
            sudo systemctl start mongod >/dev/null 2>&1 || \
            sudo service mongod start >/dev/null 2>&1 || \
            mongod --fork --logpath /var/log/mongodb/mongod.log >/dev/null 2>&1
        fi
        
        sleep 3
    fi
else
    echo -e "${YELLOW}⚠${NC} MongoDB não encontrado no PATH"
    echo "Continuando... (MongoDB pode estar instalado de outra forma)"
fi

# Configurar backend
echo "[3/7] Configurando backend Python..."
cd backend

if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual Python..."
    $PYTHON_CMD -m venv venv
fi

echo "Ativando ambiente virtual..."
source venv/bin/activate

echo "Instalando dependências Python..."
$PIP_CMD install -r requirements.txt

cd ..

# Configurar frontend
echo "[4/7] Configurando frontend React..."
cd frontend

echo "Instalando dependências Node.js..."
npm install

cd ..

# Verificar serviços
echo "[5/7] Verificando serviços..."

# Verificar se MongoDB está rodando
if lsof -Pi :27017 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB rodando na porta 27017"
else
    echo -e "${YELLOW}⚠${NC} MongoDB pode não estar rodando na porta 27017"
fi

# Verificar se as portas estão livres
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Porta 8000 está ocupada, tentando liberar..."
    kill -9 $(lsof -t -i:8000) >/dev/null 2>&1
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Porta 3000 está ocupada, tentando liberar..."
    kill -9 $(lsof -t -i:3000) >/dev/null 2>&1
fi

# Executar aplicação
echo "[6/7] Iniciando aplicação..."
echo
echo "========================================"
echo " Iniciando Backend e Frontend"
echo "========================================"
echo
echo "Backend rodará em: http://localhost:8000"
echo "Frontend rodará em: http://localhost:3000"
echo
echo "Pressione Ctrl+C para parar os serviços"
echo

# Função para limpeza ao sair
cleanup() {
    echo
    echo "Parando serviços..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Capturar Ctrl+C
trap cleanup INT

# Iniciar backend
cd backend
source venv/bin/activate
$PYTHON_CMD server.py &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 3

# Verificar se backend iniciou
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}ERRO:${NC} Falha ao iniciar backend!"
    exit 1
fi

echo -e "${GREEN}✓${NC} Backend iniciado (PID: $BACKEND_PID)"

# Iniciar frontend
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✓${NC} Frontend iniciado (PID: $FRONTEND_PID)"

echo "[7/7] Aplicação iniciada com sucesso!"
echo
echo "========================================"
echo " Instalação e Execução Completa!"
echo "========================================"
echo
echo "Acesse o sistema em: http://localhost:3000"
echo
echo "Contas padrão:"
echo "Admin: adm@ever.com / everto1n"
echo "Mod: mod@ever.com / mod123"
echo
echo "Pressione Ctrl+C para parar os serviços..."

# Aguardar os processos
wait $BACKEND_PID $FRONTEND_PID
