#!/bin/bash

# Script para executar frontend e backend simultaneamente
echo "🚀 Iniciando aplicação..."

# Função para cleanup ao sair
cleanup() {
    echo ""
    echo "🛑 Parando aplicação..."
    pkill -f "uvicorn"
    pkill -f "npm start"
    pkill -f "craco start"
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Verificando dependências...${NC}"

# Verificar se está no diretório correto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Execute este script na raiz do projeto (onde estão as pastas backend e frontend)${NC}"
    exit 1
fi

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 não encontrado. Instale o Python3 primeiro.${NC}"
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js primeiro.${NC}"
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado. Instale o npm primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências verificadas${NC}"

# Instalar dependências do backend se necessário
echo -e "${BLUE}🐍 Verificando dependências do backend...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Criando ambiente virtual...${NC}"
    python3 -m venv venv
fi

echo -e "${YELLOW}📦 Ativando ambiente virtual e instalando dependências...${NC}"
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1

# Voltar para raiz
cd ..

# Instalar dependências do frontend se necessário
echo -e "${BLUE}⚛️ Verificando dependências do frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install > /dev/null 2>&1
fi

# Voltar para raiz
cd ..

echo -e "${GREEN}✅ Todas as dependências instaladas${NC}"
echo ""
echo -e "${GREEN}🚀 Iniciando aplicação...${NC}"
echo -e "${BLUE}Backend: http://localhost:8000${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para parar a aplicação${NC}"
echo ""

# Iniciar backend em background
echo -e "${GREEN}🐍 Iniciando backend...${NC}"
cd backend
source venv/bin/activate
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Aguardar um pouco para o backend iniciar
sleep 3

# Iniciar frontend em background
echo -e "${GREEN}⚛️ Iniciando frontend...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Aguardar os processos
wait $BACKEND_PID $FRONTEND_PID
