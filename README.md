# 🤖 WhatsApp Bot Builder (PROTÓTIPO)

> Sistema completo para criação e gerenciamento de chatbots inteligentes para WhatsApp com IA avançada
> Projeto feito 100% com IA, apenas dei instruções de acordo com minhas ideias.
> (Precisa refatorar código e etc. Apenas coloquei uma das minhas ideias em prática para você continuar :))

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](http://localhost:3000)
[![Admin](https://img.shields.io/badge/Admin-adm%40adm.com%20%2F%20adm123-blue)](http://localhost:3000)
[![Mod](https://img.shields.io/badge/Mod-mod%40mod.com%20%2F%20mod123-orange)](http://localhost:3000)

## 📋 Sobre o Projeto

O WhatsApp Bot Builder é uma plataforma completa que permite criar, configurar e gerenciar chatbots para WhatsApp de forma visual e intuitiva. Com IA integrada, sistema de usuários, pagamentos e painel administrativo completo.

Basicamente você faz as funcionalidades do bot, registra seu catálogo, configura palavras chaves e configura do jeito que quiser.
Após você (ou o cliente) terminar as configurações, ele será redirecionado para o pagamento, o sistema conta com saldo, se o usuário tiver saldo adicionado > ele consegue pagar com o saldo
se ele não tiver saldo, pode adicionar por alguma das formas de pagamento (ainda não atribuidas).

Após o pagamento, o bot que ele construiu vai para a página de meus pedidos, e será possível baixar o bot com todas as funcionalidades que ele criou em python! E ainda vai um requeriments.txt e um readme para caso o usuário tenha alguma dúvida!

o usuário admin também consegue gerar um giftcard para o usuario utilizar e adicionar saldo automaticamente na sua conta :)

### 🚀 Teste Rápido
**Admin:** `adm@adm.com` / `adm123`  
**Moderador:** `mod@mod.com` / `mod123`

## ✨ Principais Funcionalidades

- 🤖 **Construtor Visual de Bots** - Crie bots sem programar
- 🧠 **IA Conversacional** - Respostas inteligentes baseadas em produtos
- 🛍️ **Catálogo Integrado** - Gerencie produtos com busca automática
- 💳 **Sistema de Pagamentos** - PIX, cartão e outras formas
- 👥 **Gestão de Usuários** - Sistema completo com referências
- 📊 **Dashboard Avançado** - Estatísticas e relatórios em tempo real
- 🎁 **Sistema de Giftcards** - Códigos promocionais e bônus
- 🔐 **Painel Admin** - Controle total do sistema

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
- **Email**: adm@adm.com
- **Senha**: adm123

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

## 🚀 Instalação Rápida

### Opção 1: Instalação Automática (Recomendada)

```bash
# Clone o repositório
git clone https://github.com/Everzin7/site.git
cd site

# Execute o script de instalação (Windows)
./install-and-run.bat

# Ou no macOS/Linux
chmod +x install-and-run.sh
./install-and-run.sh
```

### Opção 2: Instalação Manual

#### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [Python](https://python.org/) (versão 3.9 ou superior)
- [MongoDB](https://mongodb.com/) (versão 4.4 ou superior)
- [Git](https://git-scm.com/)

#### Passo a Passo

1. **Clone o repositório:**
```bash
git clone https://github.com/Everzin7/site.git
cd site
```

2. **Configure o Backend:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

3. **Configure o Frontend:**
```bash
cd ../frontend
npm install
```

4. **Configure o MongoDB:**
```bash
# Inicie o MongoDB (comando varia por sistema)
# Windows: mongod
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

5. **Execute o projeto:**
```bash
# Terminal 1 - Backend
cd backend
python server.py

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 🌐 Acessos

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentação API:** http://localhost:8000/docs

## 👨‍💼 Contas Padrão

O sistema cria automaticamente as seguintes contas:

### Administrador
- **Email:** adm@adm.com
- **Senha:** adm123
- **Acesso:** Completo ao sistema

### Moderador  
- **Email:** mod@mod.com
- **Senha:** mod123
- **Acesso:** Moderação de usuários

## 📞 Suporte

- **Issues:** https://github.com/Everzin7/site/issues
- **Documentação:** Veja FUNCIONALIDADES.txt
- **Email:** Crie uma issue no GitHub

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 🏆 Créditos

Desenvolvido por **Ever** - Uma solução completa para automação de atendimento WhatsApp.

---

⭐ **Se este projeto foi útil, deixe uma estrela no GitHub!**
