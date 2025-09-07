# WhatsApp Bot Builder Platform

Uma plataforma completa para criação e gerenciamento de bots do WhatsApp com interface administrativa refatorada e componentizada.

## 🚀 Recursos

- **Construtor de Bot Visual**: Interface intuitiva para criar bots personalizados
- **Painel Administrativo**: Gerenciamento completo de usuários, senhas e saldos
- **Sistema de Autenticação**: Login seguro para administradores  
- **Arquitetura Componentizada**: Código organizado em componentes reutilizáveis
- **Gerenciamento de Usuários**: Criar, editar e buscar usuários
- **Controle de Saldos**: Editar e zerar saldos de usuários
- **Visibilidade de Senhas**: Sistema para exibir/ocultar senhas de usuários

## 🛠️ Arquitetura Refatorada

### Componentes Criados
- **Icons.js**: Componente centralizado com todos os ícones SVG
- **DashboardOverview.js**: Painel principal com estatísticas e navegação
- **BotBuilder.js**: Interface para construção de bots
- **AdminPanel.js**: Painel administrativo completo

### Benefícios da Refatoração
- ✅ Código mais limpo e organizado
- ✅ Componentes reutilizáveis
- ✅ Melhor manutenibilidade
- ✅ Separação de responsabilidades
- ✅ Redução significativa do tamanho do App.js (de 3400+ linhas para ~180 linhas)

## 🛠️ Tecnologias

### Backend
- **FastAPI**: Framework web moderno e rápido
- **MongoDB**: Banco de dados NoSQL
- **Motor**: Driver assíncrono para MongoDB
- **Python 3.8+**: Linguagem de programação

### Frontend
- **React**: Biblioteca JavaScript para UI
- **Components**: Arquitetura componentizada
- **Tailwind CSS**: Framework CSS utilitário
- **JavaScript ES6+**: Linguagem de programação

## 📦 Instalação

### Configuração Rápida

1. **Execute o script de inicialização:**
   ```bash
   ./start.sh
   ```

   O script irá:
   - Verificar dependências
   - Instalar pacotes automaticamente
   - Iniciar o backend (porta 8000)
   - Iniciar o frontend (porta 3000)

### Configuração Manual

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
python server.py
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

### Credenciais de Administrador
- **Usuário**: admin
- **Senha**: admin123

## 📂 Estrutura Refatorada

```
├── backend/
│   ├── server.py          # Servidor FastAPI
│   └── requirements.txt   # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── App.js        # Aplicação principal (REFATORADO - 180 linhas)
│   │   ├── components/   # Componentes React (NOVO)
│   │   │   ├── Icons.js           # Ícones centralizados
│   │   │   ├── DashboardOverview.js # Painel principal
│   │   │   ├── BotBuilder.js      # Construtor de bot
│   │   │   └── AdminPanel.js      # Painel administrativo
│   │   └── ...
│   ├── package.json      # Dependências Node.js
│   └── ...
├── start.sh              # Script de inicialização
└── README.md
```

## 🔧 Funcionalidades por Componente

### DashboardOverview.js
- ✅ Cards de estatísticas
- ✅ Navegação para outras seções
- ✅ Interface responsiva

### BotBuilder.js
- ✅ Configuração básica do bot
- ✅ Mensagem de boas-vindas personalizada
- ✅ Comandos personalizados
- ✅ Sistema de respostas automáticas

### AdminPanel.js
- ✅ Criar novos usuários
- ✅ Visualizar todos os usuários
- ✅ Buscar usuários por nome, email ou ID
- ✅ Exibir/ocultar senhas de usuários
- ✅ Editar saldos de usuários
- ✅ Zerar saldos de todos os usuários

### Icons.js
- ✅ Componente centralizado de ícones
- ✅ Ícones SVG otimizados
- ✅ Fácil reutilização em qualquer componente

## 🎯 Melhorias da Refatoração

### Antes
- ❌ Arquivo App.js com 3400+ linhas
- ❌ Código difícil de manter
- ❌ Ícones duplicados
- ❌ Componentes misturados

### Depois  
- ✅ App.js com apenas 180 linhas
- ✅ Código organizado e limpo
- ✅ Componentes reutilizáveis
- ✅ Fácil manutenção e extensibilidade

## 🐛 Debugging

### Logs do Backend
- Todas as operações de CRUD são logadas
- Debug detalhado para atualizações de saldo
- Logs de autenticação e autorização

### Logs do Frontend
- Estados de componentes são monitorados
- Interações do usuário são trackeadas
- Erros de requisição são capturados

## 🚀 Desenvolvimento

### Para adicionar novos componentes:
1. Crie o arquivo em `frontend/src/components/`
2. Importe os ícones de `Icons.js`
3. Importe o componente no `App.js`
4. Use no roteamento apropriado

### Para modificar ícones:
- Edite apenas o arquivo `Icons.js`
- Todos os componentes serão atualizados automaticamente

## 📞 Suporte

Para suporte ou dúvidas sobre o sistema:
- Verifique os logs do terminal onde os serviços estão rodando
- Console do navegador para erros do frontend
- Documentação da API em http://localhost:8000/docs

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.
