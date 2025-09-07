#!/bin/bash

echo "🚀 Preparando deploy para produção..."

# Build do frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Verificar se build foi criado
if [ -d "frontend/build" ]; then
    echo "✅ Frontend build criado com sucesso!"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi

# Testar backend
echo "🧪 Testando backend..."
cd backend
python -c "import server; print('✅ Backend OK')"
cd ..

echo "🎉 Projeto pronto para deploy!"
echo ""
echo "📋 Próximos passos:"
echo "1. Faça push das alterações: git add . && git commit -m 'Deploy config' && git push"
echo "2. Acesse https://vercel.com e conecte seu repositório"
echo "3. Configure as variáveis de ambiente no painel do Vercel"
echo ""
echo "🌐 Alternativas gratuitas:"
echo "- Vercel: https://vercel.com (Recomendado)"
echo "- Railway: https://railway.app (Full Stack)"
echo "- Render: https://render.com (Plano gratuito)"
