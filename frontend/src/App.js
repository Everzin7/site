import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [botConfig, setBotConfig] = useState({
    id: '',
    user_id: 'demo-user',
    bot_name: 'Meu Bot',
    welcome_message: 'Olá! Bem-vindo ao nosso atendimento! Como posso ajudar você hoje?',
    buttons: [],
    products: [],
    business_info: { name: 'Minha Empresa' },
    ai_enabled: true
  });
  
  const [chatSession, setChatSession] = useState({
    session_id: '',
    messages: []
  });
  
  const [newButton, setNewButton] = useState({
    text: '',
    action: 'custom_message',
    response_message: '',
    redirect_url: ''
  });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category: ''
  });
  
  const [simulatorMessage, setSimulatorMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const parallaxRef = useRef(null);
  const chatEndRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  // Efeito parallax e animações de scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      
      // Parallax da imagem de fundo
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }

      // Animações dos elementos baseadas no scroll
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-in');
        }
      });

      // Animação dos ícones flutuantes
      const icons = document.querySelectorAll('.floating-icon');
      icons.forEach((icon, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        icon.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto scroll do chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatSession.messages]);

  // Criar bot inicial
  useEffect(() => {
    if (!botConfig.id) {
      const newBotId = 'demo-bot-' + Date.now();
      setBotConfig(prev => ({ ...prev, id: newBotId }));
    }
  }, []);

  // Salvar configuração do bot
  const saveBotConfig = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(botConfig)
      });
      
      if (response.ok) {
        // Animação de sucesso
        const btn = document.querySelector('.save-btn');
        btn.classList.add('success-pulse');
        setTimeout(() => btn.classList.remove('success-pulse'), 2000);
        
        // Mostrar notificação
        showNotification('✅ Configuração salva com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showNotification('❌ Erro ao salvar configuração', 'error');
    }
  };

  // Função para mostrar notificações
  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  // Adicionar botão
  const addButton = () => {
    if (!newButton.text.trim()) return;
    
    const button = {
      ...newButton,
      id: Date.now().toString()
    };
    
    setBotConfig(prev => ({
      ...prev,
      buttons: [...prev.buttons, button]
    }));
    
    setNewButton({
      text: '',
      action: 'custom_message',
      response_message: '',
      redirect_url: ''
    });

    showNotification('🔘 Botão adicionado!', 'success');
  };

  // Remover botão
  const removeButton = (buttonId) => {
    setBotConfig(prev => ({
      ...prev,
      buttons: prev.buttons.filter(b => b.id !== buttonId)
    }));
    showNotification('🗑️ Botão removido!', 'info');
  };

  // Adicionar produto
  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) return;
    
    const product = {
      ...newProduct,
      id: Date.now().toString(),
      price: parseFloat(newProduct.price)
    };
    
    setBotConfig(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
    
    setNewProduct({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category: ''
    });

    showNotification('📦 Produto adicionado!', 'success');
  };

  // Remover produto
  const removeProduct = (productId) => {
    setBotConfig(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
    showNotification('🗑️ Produto removido!', 'info');
  };

  // Simular mensagem no chat
  const sendSimulatorMessage = async () => {
    if (!simulatorMessage.trim()) return;
    
    const newUserMessage = {
      id: Date.now(),
      message: simulatorMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    setChatSession(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMessage]
    }));
    
    setSimulatorMessage('');
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/chat/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_id: botConfig.id,
          session_id: chatSession.session_id || 'demo-session-' + Date.now(),
          message: simulatorMessage
        })
      });
      
      const data = await response.json();
      
      if (!chatSession.session_id) {
        setChatSession(prev => ({ ...prev, session_id: data.session_id }));
      }
      
      const botMessage = {
        id: Date.now() + 1,
        message: data.bot_response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setTimeout(() => {
        setIsTyping(false);
        setChatSession(prev => ({
          ...prev,
          messages: [...prev.messages, botMessage]
        }));
      }, 1500);
      
    } catch (error) {
      console.error('Erro na simulação:', error);
      setIsTyping(false);
    }
  };

  // Importar CSV
  const handleCSVImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE}/api/bots/${botConfig.id}/products/import-csv`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      showNotification(data.message, response.ok ? 'success' : 'error');
      
      // Recarregar bot para ver produtos importados
      if (response.ok) {
        const botResponse = await fetch(`${API_BASE}/api/bots/${botConfig.id}`);
        if (botResponse.ok) {
          const updatedBot = await botResponse.json();
          setBotConfig(updatedBot);
        }
      }
      
    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      showNotification('❌ Erro ao importar arquivo CSV', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-dark-theme relative overflow-hidden">
      {/* Background com parallax que se estende por toda a página */}
      <div className="fixed inset-0 z-0">
        <div 
          ref={parallaxRef}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 scale-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1563273941-3f576efb8738?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHx0ZWNobm9sb2d5JTIwYXV0b21hdGlvbnxlbnwwfHx8Ymx1ZXwxNzU3MTg5NTQwfDA&ixlib=rb-4.1.0&q=85')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-black/90" />
      </div>

      {/* Ícones flutuantes animados */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="floating-icon" style={{top: '10%', left: '10%'}}>
          <div className="w-8 h-8 text-purple-400 opacity-60">🤖</div>
        </div>
        <div className="floating-icon" style={{top: '20%', right: '15%'}}>
          <div className="w-6 h-6 text-cyan-400 opacity-50">💬</div>
        </div>
        <div className="floating-icon" style={{top: '60%', left: '5%'}}>
          <div className="w-10 h-10 text-purple-300 opacity-40">⚡</div>
        </div>
        <div className="floating-icon" style={{bottom: '20%', right: '10%'}}>
          <div className="w-7 h-7 text-cyan-300 opacity-60">🚀</div>
        </div>
        <div className="floating-icon" style={{bottom: '40%', left: '20%'}}>
          <div className="w-9 h-9 text-purple-500 opacity-50">✨</div>
        </div>
        <div className="floating-icon" style={{top: '45%', right: '25%'}}>
          <div className="w-5 h-5 text-cyan-500 opacity-45">💎</div>
        </div>
      </div>

      {/* Header futurista */}
      <nav className="bg-black/40 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-white font-bold text-lg">🤖</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                WhatsApp Bot Builder
              </h1>
            </div>
            <div className="flex space-x-2">
              {['home', 'builder', 'simulator'].map((section) => (
                <button
                  key={section}
                  onClick={() => setCurrentSection(section)}
                  className={`px-6 py-2 rounded-xl transition-all duration-300 font-medium ${
                    currentSection === section 
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50' 
                      : 'text-purple-300 hover:text-white hover:bg-purple-800/30 border border-purple-500/20'
                  }`}
                >
                  {section === 'home' ? '🏠 Home' : section === 'builder' ? '🛠️ Construtor' : '📱 Simulador'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-20">
        {/* Home Section */}
        {currentSection === 'home' && (
          <div className="relative">
            {/* Hero Section futurista */}
            <div ref={heroRef} className="min-h-screen flex items-center justify-center relative">
              <div className="text-center max-w-6xl mx-auto px-4 scroll-animate">
                <div className="mb-8">
                  <h1 className="text-7xl md:text-8xl font-bold mb-6 leading-tight">
                    <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                      Crie Seu Bot
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                      do WhatsApp
                    </span>
                  </h1>
                  <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full mb-8"></div>
                </div>
                
                <p className="text-2xl md:text-3xl text-gray-300 mb-12 leading-relaxed max-w-4xl mx-auto">
                  Automatize suas vendas com <span className="text-purple-400 font-semibold">inteligência artificial</span>, 
                  botões personalizados e catálogo de produtos integrado
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <button 
                    onClick={() => setCurrentSection('builder')}
                    className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70"
                  >
                    <span className="mr-3">🚀</span>
                    Começar Agora
                    <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button 
                    onClick={() => setCurrentSection('simulator')}
                    className="group px-10 py-5 bg-black/50 text-white rounded-2xl text-xl font-bold border-2 border-purple-500/50 hover:bg-purple-900/30 hover:border-purple-400 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  >
                    <span className="mr-3">🔍</span>
                    Ver Demo
                    <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                {/* Stats animados */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                  <div className="text-center scroll-animate">
                    <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                    <div className="text-gray-400">Bots Criados</div>
                  </div>
                  <div className="text-center scroll-animate">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">99%</div>
                    <div className="text-gray-400">Uptime</div>
                  </div>
                  <div className="text-center scroll-animate">
                    <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                    <div className="text-gray-400">Suporte IA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section futurista */}
            <div ref={featuresRef} className="py-32 relative">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-20 scroll-animate">
                  <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Recursos Avançados
                  </h2>
                  <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-12">
                  <div className="group feature-card scroll-animate">
                    <div className="feature-icon-container">
                      <div className="text-4xl mb-6">🤖</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-purple-400 transition-colors">
                      IA Gemini 2.0
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Respostas inteligentes e contextuais com a mais avançada tecnologia de IA do Google
                    </p>
                  </div>
                  
                  <div className="group feature-card scroll-animate">
                    <div className="feature-icon-container">
                      <div className="text-4xl mb-6">🛍️</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-cyan-400 transition-colors">
                      Catálogo Inteligente
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      Upload de imagens, importação CSV e gerenciamento completo do seu inventário
                    </p>
                  </div>
                  
                  <div className="group feature-card scroll-animate">
                    <div className="feature-icon-container">
                      <div className="text-4xl mb-6">💳</div>
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-purple-400 transition-colors">
                      Pagamentos Integrados
                    </h3>
                    <p className="text-gray-400 text-lg leading-relaxed">
                      PIX instantâneo e cartões de crédito para maximizar suas conversões
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 text-center scroll-animate">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-bold mb-8 text-white">
                  Pronto para revolucionar seu atendimento?
                </h2>
                <button 
                  onClick={() => setCurrentSection('builder')}
                  className="px-12 py-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50"
                >
                  Criar Meu Bot Agora 🚀
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Builder Section */}
        {currentSection === 'builder' && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  🛠️ Construtor de Bot Avançado
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Configurações Básicas */}
                <div className="space-y-8">
                  <div className="bg-purple-900/20 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-purple-300 flex items-center">
                      <span className="mr-3">⚙️</span> Configurações Básicas
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Nome do Bot</label>
                        <input
                          type="text"
                          value={botConfig.bot_name}
                          onChange={(e) => setBotConfig(prev => ({ ...prev, bot_name: e.target.value }))}
                          className="futuristic-input"
                          placeholder="Ex: Atendimento AutoMart"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Nome da Empresa</label>
                        <input
                          type="text"
                          value={botConfig.business_info.name}
                          onChange={(e) => setBotConfig(prev => ({ 
                            ...prev, 
                            business_info: { ...prev.business_info, name: e.target.value }
                          }))}
                          className="futuristic-input"
                          placeholder="Ex: AutoMart Veículos"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-3">Mensagem de Boas-vindas</label>
                        <textarea
                          value={botConfig.welcome_message}
                          onChange={(e) => setBotConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                          rows={4}
                          className="futuristic-input"
                          placeholder="Digite a mensagem de boas-vindas..."
                        />
                      </div>
                      
                      <div className="flex items-center p-4 bg-black/30 rounded-xl border border-purple-500/20">
                        <input
                          type="checkbox"
                          id="ai_enabled"
                          checked={botConfig.ai_enabled}
                          onChange={(e) => setBotConfig(prev => ({ ...prev, ai_enabled: e.target.checked }))}
                          className="futuristic-checkbox mr-4"
                        />
                        <label htmlFor="ai_enabled" className="text-gray-300 flex items-center">
                          <span className="mr-2">🧠</span>
                          Ativar respostas inteligentes com IA Gemini 2.0
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Botões Personalizados */}
                  <div className="bg-green-900/20 backdrop-blur-sm p-8 rounded-2xl border border-green-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-green-300 flex items-center">
                      <span className="mr-3">🔘</span> Botões Personalizados
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Texto do botão"
                          value={newButton.text}
                          onChange={(e) => setNewButton(prev => ({ ...prev, text: e.target.value }))}
                          className="futuristic-input-sm"
                        />
                        <select
                          value={newButton.action}
                          onChange={(e) => setNewButton(prev => ({ ...prev, action: e.target.value }))}
                          className="futuristic-select"
                        >
                          <option value="custom_message">Mensagem Personalizada</option>
                          <option value="show_catalog">Mostrar Catálogo</option>
                          <option value="redirect">Redirecionar URL</option>
                        </select>
                      </div>
                      
                      {newButton.action === 'custom_message' && (
                        <textarea
                          placeholder="Mensagem de resposta"
                          value={newButton.response_message}
                          onChange={(e) => setNewButton(prev => ({ ...prev, response_message: e.target.value }))}
                          rows={3}
                          className="futuristic-input"
                        />
                      )}
                      
                      {newButton.action === 'redirect' && (
                        <input
                          type="url"
                          placeholder="URL de redirecionamento"
                          value={newButton.redirect_url}
                          onChange={(e) => setNewButton(prev => ({ ...prev, redirect_url: e.target.value }))}
                          className="futuristic-input"
                        />
                      )}
                      
                      <button
                        onClick={addButton}
                        className="futuristic-btn-green w-full"
                      >
                        <span className="mr-2">➕</span>
                        Adicionar Botão
                      </button>
                    </div>
                    
                    {/* Lista de Botões */}
                    <div className="mt-6 space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                      {botConfig.buttons.map((button, index) => (
                        <div key={button.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-green-500/20">
                          <div>
                            <span className="font-medium text-white">{index + 1}. {button.text}</span>
                            <span className="text-sm text-gray-400 ml-3">({button.action})</span>
                          </div>
                          <button
                            onClick={() => removeButton(button.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Produtos */}
                <div className="space-y-8">
                  <div className="bg-blue-900/20 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-blue-300 flex items-center">
                      <span className="mr-3">📦</span> Gerenciar Produtos
                    </h3>
                    
                    {/* Importar CSV */}
                    <div className="mb-8 p-6 bg-black/30 rounded-xl border border-blue-500/20">
                      <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center">
                        <span className="mr-2">📄</span> Importar produtos via CSV
                      </label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVImport}
                        className="futuristic-file-input"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Formato: name,description,price,image_url,category
                      </p>
                    </div>
                    
                    {/* Adicionar Produto Manualmente */}
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nome do produto"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="futuristic-input"
                      />
                      <textarea
                        placeholder="Descrição do produto"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="futuristic-input"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Preço (R$)"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                          className="futuristic-input-sm"
                        />
                        <input
                          type="text"
                          placeholder="Categoria"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                          className="futuristic-input-sm"
                        />
                      </div>
                      <input
                        type="url"
                        placeholder="URL da imagem"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                        className="futuristic-input"
                      />
                      <button
                        onClick={addProduct}
                        className="futuristic-btn-blue w-full"
                      >
                        <span className="mr-2">📦</span>
                        Adicionar Produto
                      </button>
                    </div>
                    
                    {/* Lista de Produtos */}
                    <div className="mt-6 max-h-64 overflow-y-auto custom-scrollbar space-y-3">
                      {botConfig.products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-blue-500/20">
                          <div className="flex items-center space-x-4">
                            {product.image_url && (
                              <img 
                                src={product.image_url} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg border border-blue-500/30"
                              />
                            )}
                            <div>
                              <div className="font-medium text-white">{product.name}</div>
                              <div className="text-sm text-blue-400">R$ {product.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Salvar Configuração */}
                  <button
                    onClick={saveBotConfig}
                    className="save-btn futuristic-btn-main w-full py-6 text-xl"
                  >
                    <span className="mr-3">💾</span>
                    Salvar Configuração
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulator Section */}
        {currentSection === 'simulator' && (
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden">
              {/* Header do simulador */}
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white relative">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Simulador WhatsApp - {botConfig.bot_name}</h2>
                    <p className="text-green-100 mt-1">Teste seu bot em tempo real com IA integrada</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex h-[600px]">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
                  {/* Messages */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}>
                    {chatSession.messages.length === 0 && (
                      <div className="text-center text-gray-500 mt-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <span className="text-3xl">💬</span>
                        </div>
                        <p className="text-lg font-medium">Inicie uma conversa enviando uma mensagem</p>
                        <p className="text-sm mt-2">Teste todas as funcionalidades do seu bot</p>
                      </div>
                    )}
                    
                    {chatSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md group ${
                          message.sender === 'user' ? 'message-user' : 'message-bot'
                        }`}>
                          <div className={`px-4 py-3 rounded-2xl shadow-lg ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
                          </div>
                          <p className={`text-xs mt-1 px-2 ${
                            message.sender === 'user' ? 'text-right text-purple-200' : 'text-left text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing indicator */}
                    {isTyping && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-white px-4 py-3 rounded-2xl shadow-lg border border-gray-200">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={simulatorMessage}
                          onChange={(e) => setSimulatorMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendSimulatorMessage()}
                          placeholder="Digite sua mensagem..."
                          className="w-full px-6 py-4 bg-gray-100 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-500"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          😊
                        </div>
                      </div>
                      <button
                        onClick={sendSimulatorMessage}
                        disabled={!simulatorMessage.trim()}
                        className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-full hover:from-purple-600 hover:to-cyan-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg"
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Side Panel - Bot Info */}
                <div className="w-80 bg-black/60 backdrop-blur-sm p-6 border-l border-purple-500/20">
                  <h3 className="font-bold text-white mb-6 flex items-center text-lg">
                    <span className="mr-2">ℹ️</span> Informações do Bot
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                      <div className="flex justify-between">
                        <strong className="text-purple-300">Nome:</strong>
                        <span className="text-white">{botConfig.bot_name}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                      <div className="flex justify-between">
                        <strong className="text-purple-300">Empresa:</strong>
                        <span className="text-white">{botConfig.business_info.name}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                      <div className="flex justify-between">
                        <strong className="text-purple-300">IA:</strong>
                        <span className={botConfig.ai_enabled ? 'text-green-400' : 'text-red-400'}>
                          {botConfig.ai_enabled ? '✅ Ativa' : '❌ Inativa'}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                      <div className="flex justify-between">
                        <strong className="text-purple-300">Botões:</strong>
                        <span className="text-cyan-400">{botConfig.buttons.length}</span>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
                      <div className="flex justify-between">
                        <strong className="text-purple-300">Produtos:</strong>
                        <span className="text-cyan-400">{botConfig.products.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  {botConfig.buttons.length > 0 && (
                    <div className="mt-8">
                      <h4 className="font-medium text-purple-300 mb-4 flex items-center">
                        <span className="mr-2">🔘</span> Botões Disponíveis:
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {botConfig.buttons.map((button, index) => (
                          <div key={button.id} className="text-xs bg-black/40 p-3 rounded-lg border border-purple-500/20">
                            <strong className="text-white">{index + 1}.</strong>
                            <span className="text-gray-300 ml-2">{button.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setChatSession({ session_id: '', messages: [] })}
                    className="w-full mt-8 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium"
                  >
                    🔄 Limpar Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;