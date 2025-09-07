#!/bin/bash

echo "🚀 Iniciando aplicação completa..."

# Função para cleanup
cleanup() {
    echo "🛑 Parando aplicação..."
    pkill -f "uvicorn"
    pkill -f "npm start"
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Iniciar backend
echo "🐍 Iniciando backend..."
cd backend
source venv/bin/activate
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Aguardar backend iniciar
sleep 5

# Iniciar frontend
echo "⚛️ Iniciando frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Aplicação iniciada!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Pressione Ctrl+C para parar"

# Aguardar os processos
wait $BACKEND_PID $FRONTEND_PID
