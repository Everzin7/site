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
  const parallaxRef = useRef(null);
  const chatEndRef = useRef(null);

  // Efeito parallax
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }
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
        alert('✅ Configuração salva com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar configuração');
    }
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
  };

  // Remover botão
  const removeButton = (buttonId) => {
    setBotConfig(prev => ({
      ...prev,
      buttons: prev.buttons.filter(b => b.id !== buttonId)
    }));
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
  };

  // Remover produto
  const removeProduct = (productId) => {
    setBotConfig(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
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
        setChatSession(prev => ({
          ...prev,
          messages: [...prev.messages, botMessage]
        }));
      }, 1000);
      
    } catch (error) {
      console.error('Erro na simulação:', error);
    }
    
    setSimulatorMessage('');
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
      alert(data.message);
      
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
      alert('❌ Erro ao importar arquivo CSV');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WB</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">WhatsApp Bot Builder</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentSection('home')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentSection === 'home' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentSection('builder')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentSection === 'builder' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                Construtor
              </button>
              <button
                onClick={() => setCurrentSection('simulator')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentSection === 'simulator' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-blue-50'
                }`}
              >
                Simulador
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      {currentSection === 'home' && (
        <div className="relative overflow-hidden">
          {/* Hero Section com Parallax */}
          <div className="relative min-h-screen flex items-center justify-center">
            <div 
              ref={parallaxRef}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1563273941-3f576efb8738?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHx0ZWNobm9sb2d5JTIwYXV0b21hdGlvbnxlbnwwfHx8Ymx1ZXwxNzU3MTg5NTQwfDA&ixlib=rb-4.1.0&q=85')`
              }}
            />
            
            <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-pulse">
                Crie Seu Bot do WhatsApp
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                Automatize suas vendas com inteligência artificial, botões personalizados e catálogo de produtos integrado
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button 
                  onClick={() => setCurrentSection('builder')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all shadow-xl"
                >
                  🚀 Começar Agora
                </button>
                <button 
                  onClick={() => setCurrentSection('simulator')}
                  className="px-8 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold border-2 border-blue-200 hover:bg-blue-50 transform hover:scale-105 transition-all shadow-xl"
                >
                  🔍 Ver Demo
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                Recursos Poderosos
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🤖</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">IA Integrada</h3>
                  <p className="text-gray-600">Respostas inteligentes com Gemini 2.0 para atendimento personalizado</p>
                </div>
                
                <div className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">🛍️</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Catálogo Produtos</h3>
                  <p className="text-gray-600">Upload de imagens e importação via CSV para seu catálogo completo</p>
                </div>
                
                <div className="text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all transform hover:scale-105">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">💳</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Pagamentos</h3>
                  <p className="text-gray-600">Integração com PIX e cartões para facilitar suas vendas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Builder Section */}
      {currentSection === 'builder' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
              🛠️ Construtor de Bot
            </h2>
            
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Configurações Básicas */}
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-blue-800">Configurações Básicas</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Bot</label>
                      <input
                        type="text"
                        value={botConfig.bot_name}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, bot_name: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Atendimento AutoMart"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                      <input
                        type="text"
                        value={botConfig.business_info.name}
                        onChange={(e) => setBotConfig(prev => ({ 
                          ...prev, 
                          business_info: { ...prev.business_info, name: e.target.value }
                        }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: AutoMart Veículos"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem de Boas-vindas</label>
                      <textarea
                        value={botConfig.welcome_message}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, welcome_message: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite a mensagem de boas-vindas..."
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ai_enabled"
                        checked={botConfig.ai_enabled}
                        onChange={(e) => setBotConfig(prev => ({ ...prev, ai_enabled: e.target.checked }))}
                        className="mr-2"
                      />
                      <label htmlFor="ai_enabled" className="text-sm text-gray-700">
                        Ativar respostas inteligentes com IA
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botões Personalizados */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-green-800">Botões Personalizados</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Texto do botão"
                        value={newButton.text}
                        onChange={(e) => setNewButton(prev => ({ ...prev, text: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <select
                        value={newButton.action}
                        onChange={(e) => setNewButton(prev => ({ ...prev, action: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}
                    
                    {newButton.action === 'redirect' && (
                      <input
                        type="url"
                        placeholder="URL de redirecionamento"
                        value={newButton.redirect_url}
                        onChange={(e) => setNewButton(prev => ({ ...prev, redirect_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}
                    
                    <button
                      onClick={addButton}
                      className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ➕ Adicionar Botão
                    </button>
                  </div>
                  
                  {/* Lista de Botões */}
                  <div className="mt-4 space-y-2">
                    {botConfig.buttons.map((button, index) => (
                      <div key={button.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div>
                          <span className="font-medium">{index + 1}. {button.text}</span>
                          <span className="text-sm text-gray-500 ml-2">({button.action})</span>
                        </div>
                        <button
                          onClick={() => removeButton(button.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Produtos */}
              <div className="space-y-6">
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4 text-purple-800">Produtos</h3>
                  
                  {/* Importar CSV */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Importar produtos via CSV
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Formato: name,description,price,image_url,category
                    </p>
                  </div>
                  
                  {/* Adicionar Produto Manualmente */}
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nome do produto"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      placeholder="Descrição"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço (R$)"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Categoria"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <input
                      type="url"
                      placeholder="URL da imagem"
                      value={newProduct.image_url}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, image_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={addProduct}
                      className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      ➕ Adicionar Produto
                    </button>
                  </div>
                  
                  {/* Lista de Produtos */}
                  <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                    {botConfig.products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between bg-white p-3 rounded border">
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">R$ {product.price.toFixed(2)}</div>
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded mt-1"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
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
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                >
                  💾 Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Section */}
      {currentSection === 'simulator' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center">
                📱 Simulador WhatsApp - {botConfig.bot_name}
              </h2>
              <p className="text-green-100 mt-2">Teste seu bot em tempo real</p>
            </div>
            
            <div className="flex h-96">
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                  {chatSession.messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                      <p>💬 Inicie uma conversa enviando uma mensagem</p>
                    </div>
                  )}
                  
                  {chatSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-white border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={simulatorMessage}
                      onChange={(e) => setSimulatorMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendSimulatorMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendSimulatorMessage}
                      disabled={!simulatorMessage.trim()}
                      className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Side Panel - Bot Info */}
              <div className="w-80 bg-gray-100 p-4 border-l">
                <h3 className="font-semibold text-gray-800 mb-4">ℹ️ Informações do Bot</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>Nome:</strong> {botConfig.bot_name}
                  </div>
                  <div>
                    <strong>Empresa:</strong> {botConfig.business_info.name}
                  </div>
                  <div>
                    <strong>IA Ativada:</strong> {botConfig.ai_enabled ? '✅ Sim' : '❌ Não'}
                  </div>
                  <div>
                    <strong>Botões:</strong> {botConfig.buttons.length}
                  </div>
                  <div>
                    <strong>Produtos:</strong> {botConfig.products.length}
                  </div>
                </div>
                
                {botConfig.buttons.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-700 mb-2">Botões Disponíveis:</h4>
                    <div className="space-y-1">
                      {botConfig.buttons.map((button, index) => (
                        <div key={button.id} className="text-xs bg-white p-2 rounded border">
                          <strong>{index + 1}.</strong> {button.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setChatSession({ session_id: '', messages: [] })}
                  className="w-full mt-4 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  🔄 Limpar Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;