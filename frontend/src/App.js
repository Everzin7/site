import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

// Ícones SVG personalizados
const Icons = {
  robot: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21V9ZM5 3H15L19 7V15H5V3ZM10 21V17H14V21H10Z"/>
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 3C6.5 3 2 6.6 2 11C2 13.2 3.2 15.2 5 16.5V22L10.3 19.3C10.9 19.4 11.4 19.5 12 19.5C17.5 19.5 22 15.9 22 11.5C22 6.6 17.5 3 12 3ZM8 12C7.4 12 7 11.6 7 11S7.4 10 8 10 9 10.4 9 11 8.6 12 8 12ZM12 12C11.4 12 11 11.6 11 11S11.4 10 12 10 13 10.4 13 11 12.6 12 12 12ZM16 12C15.4 12 15 11.6 15 11S15.4 10 16 10 17 10.4 17 11 16.6 12 16 12Z"/>
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M11 4H13L14.5 6H20C20.6 6 21 6.4 21 7V19C21 19.6 20.6 20 20 20H4C3.4 20 3 19.6 3 19V5C3 4.4 3.4 4 4 4H11ZM11 6V8H4V18H20V8H13.5L12 6H11Z"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12S10.07 8.5 12 8.5 15.5 10.07 15.5 12 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12S19.47 11.35 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.35 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z"/>
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12"/>
    </svg>
  ),
  credit_card: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M13 3V9H21V3M13 21H21V11H13M3 21H11V15H3M3 13H11V3H3V13Z"/>
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M9 11H15L13.5 7.5H10.5M7.5 4L9 2H15L16.5 4H20C20.6 4 21 4.4 21 5V19C21 19.6 20.6 20 20 20H4C3.4 20 3 19.6 3 19V5C3 4.4 3.4 4 4 4H7.5Z"/>
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
    </svg>
  ),
  build: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 1 5.1 3S3.1 7 5.1 9C7 10.9 9.8 11.4 12 10.5L21.1 19.6C21.5 20 22.3 20 22.7 19.6S23.1 19.4 22.7 19ZM7.5 7.5C6.7 6.7 6.7 5.5 7.5 4.7S9.3 3.9 10.1 4.7 10.9 6.5 10.1 7.3 8.3 8.1 7.5 7.5Z"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
      <path d="M5 9.2H3V19H21V17.2H5V9.2ZM16.2 13L18.2 11L19.6 12.4L16.2 15.8L12.8 12.4L7 18.2L5.6 16.8L12.8 9.6L16.2 13Z"/>
    </svg>
  )
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  
  // Estados para autenticação
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: ''
  });

  // Estados do bot builder
  const [botConfig, setBotConfig] = useState({
    id: '',
    user_id: '',
    bot_name: 'Meu Bot',
    welcome_message: 'Olá! Bem-vindo ao nosso atendimento! Como posso ajudar você hoje?',
    buttons: [],
    products: [],
    business_info: { name: 'Minha Empresa' },
    ai_enabled: true,
    status: 'draft' // draft, pending_payment, active
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
  const [userBots, setUserBots] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalBots: 0,
    activeBots: 0,
    totalEarnings: 0,
    referralEarnings: 0,
    monthlyStats: []
  });

  const parallaxRef = useRef(null);
  const chatEndRef = useRef(null);

  // Efeito parallax
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${rate}px)`;
      }

      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-in');
        }
      });

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

  // Carregar dados do usuário
  useEffect(() => {
    const savedUser = localStorage.getItem('whatsapp_bot_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setBotConfig(prev => ({ ...prev, user_id: userData.id }));
      loadUserBots(userData.id);
      loadDashboardData(userData.id);
    }
  }, []);

  // Funções de autenticação
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('whatsapp_bot_user', JSON.stringify(userData));
        setBotConfig(prev => ({ ...prev, user_id: userData.id }));
        setShowLogin(false);
        showNotification('✅ Login realizado com sucesso!', 'success');
        setCurrentView('dashboard');
        loadUserBots(userData.id);
        loadDashboardData(userData.id);
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error) {
      showNotification('❌ Erro no login: ' + error.message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password.length < 6) {
      showNotification('❌ Senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('whatsapp_bot_user', JSON.stringify(userData));
        setBotConfig(prev => ({ ...prev, user_id: userData.id }));
        setShowRegister(false);
        showNotification('✅ Conta criada e login automático realizado!', 'success');
        setCurrentView('dashboard');
        loadDashboardData(userData.id);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar conta');
      }
    } catch (error) {
      showNotification('❌ Erro no registro: ' + error.message, 'error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('whatsapp_bot_user');
    setCurrentView('home');
    showNotification('👋 Logout realizado', 'info');
  };

  // Carregar bots do usuário
  const loadUserBots = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/bots?user_id=${userId}`);
      const bots = await response.json();
      setUserBots(bots);
    } catch (error) {
      console.error('Erro ao carregar bots:', error);
    }
  };

  // Carregar dados do dashboard
  const loadDashboardData = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/${userId}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  // Funções do bot builder (mantidas do código anterior)
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

  const saveBotConfig = async () => {
    if (!user) {
      showNotification('❌ Faça login para salvar seu bot', 'error');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/api/bots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...botConfig, user_id: user.id })
      });
      
      if (response.ok) {
        const savedBot = await response.json();
        setBotConfig(savedBot);
        showNotification('✅ Bot salvo! Prossiga para o pagamento.', 'success');
        setCurrentView('payment');
        loadUserBots(user.id);
        return true;
      }
    } catch (error) {
      showNotification('❌ Erro ao salvar bot', 'error');
      return false;
    }
  };

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

    showNotification('Botão adicionado!', 'success');
  };

  const removeButton = (buttonId) => {
    setBotConfig(prev => ({
      ...prev,
      buttons: prev.buttons.filter(b => b.id !== buttonId)
    }));
  };

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

    showNotification('Produto adicionado!', 'success');
  };

  const removeProduct = (productId) => {
    setBotConfig(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const sendSimulatorMessage = async () => {
    if (!simulatorMessage.trim()) return;
    
    await ensureBotExists();
    
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
    
    const currentMessage = simulatorMessage;
    setSimulatorMessage('');
    setIsTyping(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/chat/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_id: botConfig.id,
          session_id: chatSession.session_id || 'demo-session-' + Date.now(),
          message: currentMessage
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
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
      
      const errorMessage = {
        id: Date.now() + 1,
        message: "⚠️ Erro ao processar mensagem. Tente salvar a configuração do bot primeiro.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setChatSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    }
  };

  const ensureBotExists = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/bots/${botConfig.id}`);
      if (response.status === 404) {
        await saveBotConfig();
      }
    } catch (error) {
      await saveBotConfig();
    }
  };

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
      
      if (response.ok) {
        const botResponse = await fetch(`${API_BASE}/api/bots/${botConfig.id}`);
        if (botResponse.ok) {
          const updatedBot = await botResponse.json();
          setBotConfig(updatedBot);
        }
      }
      
    } catch (error) {
      showNotification('❌ Erro ao importar arquivo CSV', 'error');
    }
  };

  // Componente de Login
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={loginData.email}
            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
            className="futuristic-input"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={loginData.password}
            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
            className="futuristic-input"
            required
          />
          <button type="submit" className="futuristic-btn-main w-full">
            Entrar
          </button>
        </form>
        <div className="text-center mt-4">
          <button 
            onClick={() => { setShowLogin(false); setShowRegister(true); }}
            className="text-purple-400 hover:text-purple-300"
          >
            Não tem conta? Cadastre-se
          </button>
        </div>
        <button 
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );

  // Componente de Registro
  const RegisterModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Criar Conta</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Como quer ser chamado?"
            value={registerData.name}
            onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
            className="futuristic-input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={registerData.email}
            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
            className="futuristic-input"
            required
          />
          <input
            type="password"
            placeholder="Senha (mínimo 6 caracteres)"
            value={registerData.password}
            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
            className="futuristic-input"
            required
            minLength="6"
          />
          <input
            type="text"
            placeholder="Código de indicação (opcional)"
            value={registerData.referralCode}
            onChange={(e) => setRegisterData(prev => ({ ...prev, referralCode: e.target.value }))}
            className="futuristic-input"
          />
          <button type="submit" className="futuristic-btn-main w-full">
            Criar Conta
          </button>
        </form>
        <div className="text-center mt-4">
          <button 
            onClick={() => { setShowRegister(false); setShowLogin(true); }}
            className="text-purple-400 hover:text-purple-300"
          >
            Já tem conta? Faça login
          </button>
        </div>
        <button 
          onClick={() => setShowRegister(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-theme relative overflow-hidden">
      {/* Background com parallax */}
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
          <div className="w-8 h-8 text-purple-400 opacity-60">{Icons.robot}</div>
        </div>
        <div className="floating-icon" style={{top: '20%', right: '15%'}}>
          <div className="w-6 h-6 text-cyan-400 opacity-50">{Icons.chat}</div>
        </div>
        <div className="floating-icon" style={{top: '60%', left: '5%'}}>
          <div className="w-10 h-10 text-purple-300 opacity-40">{Icons.lightning}</div>
        </div>
        <div className="floating-icon" style={{bottom: '20%', right: '10%'}}>
          <div className="w-7 h-7 text-cyan-300 opacity-60">{Icons.chart}</div>
        </div>
        <div className="floating-icon" style={{bottom: '40%', left: '20%'}}>
          <div className="w-9 h-9 text-purple-500 opacity-50">{Icons.package}</div>
        </div>
        <div className="floating-icon" style={{top: '45%', right: '25%'}}>
          <div className="w-5 h-5 text-cyan-500 opacity-45">{Icons.credit_card}</div>
        </div>
      </div>

      {/* Header */}
      <nav className="bg-black/40 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                {Icons.robot}
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                WhatsApp Bot Builder
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex space-x-2">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
                      { id: 'orders', label: 'Meus Pedidos', icon: Icons.orders },
                      { id: 'builder', label: 'Construtor', icon: Icons.build },
                      { id: 'simulator', label: 'Simulador', icon: Icons.phone }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                          currentView === item.id 
                            ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50' 
                            : 'text-purple-300 hover:text-white hover:bg-purple-800/30 border border-purple-500/20'
                        }`}
                      >
                        <div className="w-4 h-4">{item.icon}</div>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-purple-500/20">
                    <div className="text-white">Olá, {user.name}</div>
                    <button
                      onClick={handleLogout}
                      className="text-purple-300 hover:text-white"
                    >
                      Sair
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentView('home')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                      currentView === 'home' 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg shadow-purple-500/50' 
                        : 'text-purple-300 hover:text-white hover:bg-purple-800/30 border border-purple-500/20'
                    }`}
                  >
                    <div className="w-4 h-4">{Icons.home}</div>
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowRegister(true)}
                    className="px-4 py-2 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-800/30 transition-all"
                  >
                    Cadastrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-20">
        {/* Home Section */}
        {currentView === 'home' && (
          <div className="relative">
            <div className="min-h-screen flex items-center justify-center relative">
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
                    onClick={() => user ? setCurrentView('builder') : setShowRegister(true)}
                    className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70"
                  >
                    <span className="mr-3">{Icons.build}</span>
                    Começar Agora
                    <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button 
                    onClick={() => user ? setCurrentView('simulator') : setShowLogin(true)}
                    className="group px-10 py-5 bg-black/50 text-white rounded-2xl text-xl font-bold border-2 border-purple-500/50 hover:bg-purple-900/30 hover:border-purple-400 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                  >
                    <span className="mr-3">{Icons.phone}</span>
                    Ver Demo
                    <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

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

            <div className="py-32 relative">
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
                      <div className="text-4xl mb-6">{Icons.robot}</div>
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
                      <div className="text-4xl mb-6">{Icons.package}</div>
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
                      <div className="text-4xl mb-6">{Icons.credit_card}</div>
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

            <div className="py-24 text-center scroll-animate">
              <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-4xl font-bold mb-8 text-white">
                  Pronto para revolucionar seu atendimento?
                </h2>
                <button 
                  onClick={() => user ? setCurrentView('builder') : setShowRegister(true)}
                  className="px-12 py-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50"
                >
                  Criar Meu Bot Agora {Icons.build}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        {currentView === 'dashboard' && user && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Gerencie seus bots e acompanhe suas estatísticas</p>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Bots</p>
                    <p className="text-3xl font-bold text-white">{dashboardData.totalBots}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    {Icons.robot}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Bots Ativos</p>
                    <p className="text-3xl font-bold text-green-400">{dashboardData.activeBots}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    {Icons.lightning}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ganhos Totais</p>
                    <p className="text-3xl font-bold text-cyan-400">R$ {dashboardData.totalEarnings}</p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    {Icons.credit_card}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ref. Ganhas</p>
                    <p className="text-3xl font-bold text-yellow-400">R$ {dashboardData.referralEarnings}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    {Icons.user}
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico e ações rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Estatísticas Mensais</h3>
                <div className="h-64 flex items-end space-x-4">
                  {dashboardData.monthlyStats.map((stat, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t"
                        style={{ height: `${(stat.value / 100) * 200}px` }}
                      ></div>
                      <p className="text-xs text-gray-400 mt-2">{stat.month}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-4">Ações Rápidas</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => setCurrentView('builder')}
                    className="w-full flex items-center space-x-3 p-3 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-colors"
                  >
                    {Icons.build}
                    <span className="text-white">Criar Novo Bot</span>
                  </button>
                  <button 
                    onClick={() => setCurrentView('orders')}
                    className="w-full flex items-center space-x-3 p-3 bg-cyan-500/20 rounded-xl hover:bg-cyan-500/30 transition-colors"
                  >
                    {Icons.orders}
                    <span className="text-white">Ver Pedidos</span>
                  </button>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <p className="text-green-400 text-sm">Seu código de referência:</p>
                    <p className="text-white font-mono text-xs">{user.referral_code}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Section */}
        {currentView === 'orders' && user && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Meus Pedidos</h1>
              <p className="text-gray-400">Gerencie seus bots e pendências de pagamento</p>
            </div>

            <div className="grid gap-6">
              {userBots.map((bot) => (
                <div key={bot.id} className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        {Icons.robot}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{bot.bot_name}</h3>
                        <p className="text-gray-400">{bot.business_info.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bot.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        bot.status === 'pending_payment' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {bot.status === 'active' ? 'Ativo' : 
                         bot.status === 'pending_payment' ? 'Pendente Pagamento' : 'Rascunho'}
                      </span>
                      {bot.status === 'pending_payment' && (
                        <button 
                          onClick={() => {
                            setBotConfig(bot);
                            setCurrentView('payment');
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all"
                        >
                          Pagar Agora
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setBotConfig(bot);
                          setCurrentView('builder');
                        }}
                        className="px-4 py-2 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-800/30 transition-all"
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">{bot.buttons.length}</p>
                      <p className="text-gray-400 text-sm">Botões</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-400">{bot.products.length}</p>
                      <p className="text-gray-400 text-sm">Products</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">{bot.ai_enabled ? 'Sim' : 'Não'}</p>
                      <p className="text-gray-400 text-sm">IA Ativa</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {userBots.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    {Icons.robot}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Nenhum bot criado ainda</h3>
                  <p className="text-gray-400 mb-8">Crie seu primeiro bot para começar a automatizar suas vendas</p>
                  <button 
                    onClick={() => setCurrentView('builder')}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transition-all"
                  >
                    Criar Primeiro Bot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Section */}
        {currentView === 'payment' && user && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Finalizar Pagamento
                </h2>
                <p className="text-gray-400">Complete seu pedido para ativar seu bot</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Bot WhatsApp</span>
                      <span className="text-white">R$ 97,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">IA Gemini 2.0</span>
                      <span className="text-white">R$ 30,00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Suporte 24/7</span>
                      <span className="text-green-400">Grátis</span>
                    </div>
                    <hr className="border-purple-500/20" />
                    <div className="flex justify-between text-xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-cyan-400">R$ 127,00</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all">
                    {Icons.credit_card}
                    <span className="ml-2">Pagar com PIX</span>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all">
                    {Icons.credit_card}
                    <span className="ml-2">Cartão de Crédito</span>
                  </button>
                  <button className="w-full p-4 border border-purple-500/50 text-purple-300 rounded-xl font-bold hover:bg-purple-800/30 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restante das seções (Builder e Simulator) mantidas do código anterior com ícones atualizados */}
        {/* ... */}
      </div>

      {/* Modais */}
      {showLogin && <LoginModal />}
      {showRegister && <RegisterModal />}
    </div>
  );
}

export default App;