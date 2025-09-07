import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8000';
console.log('🔧 API_BASE configurado como:', API_BASE);

// Teste de conexão será executado após a inicialização do componente

// Ícones SVG personalizados mais sofisticados e menores
const Icons = {
  robot: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21V9ZM5 3H15L19 7V15H5V3ZM10 21V17H14V21H10Z"/>
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 3C6.5 3 2 6.6 2 11C2 13.2 3.2 15.2 5 16.5V22L10.3 19.3C10.9 19.4 11.4 19.5 12 19.5C17.5 19.5 22 15.9 22 11.5C22 6.6 17.5 3 12 3ZM8 12C7.4 12 7 11.6 7 11S7.4 10 8 10 9 10.4 9 11 8.6 12 8 12ZM12 12C11.4 12 11 11.6 11 11S11.4 10 12 10 13 10.4 13 11 12.6 12 12 12ZM16 12C15.4 12 15 11.6 15 11S15.4 10 16 10 17 10.4 17 11 16.6 12 16 12Z"/>
    </svg>
  ),
  lightning: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M7 2V13H10V22L17 10H13L17 2H7Z"/>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 8C9.79 8 8 9.79 8 12S9.79 16 12 16 16 14.21 16 12 14.21 8 12 8ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12S19.47 11.35 19.43 11.03L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.03C4.53 11.35 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z"/>
    </svg>
  ),
  package: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12"/>
    </svg>
  ),
  credit_card: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M13 3V9H21V3M13 21H21V11H13M3 21H11V15H3M3 13H11V3H3V13Z"/>
    </svg>
  ),
  orders: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19,7H16V6A4,4 0 0,0 12,2A4,4 0 0,0 8,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6V7H10V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H8V10A1,1 0 0,0 9,11A1,1 0 0,0 10,10V9H14V10A1,1 0 0,0 15,11A1,1 0 0,0 16,10V9H18V19Z"/>
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z"/>
    </svg>
  ),
  build: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 20 23.1 19.3 22.7 19Z"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M5 9.2H3V19H21V17.2H5V9.2ZM16.2 13L18.2 11L19.6 12.4L16.2 15.8L12.8 12.4L7 18.2L5.6 16.8L12.8 9.6L16.2 13Z"/>
    </svg>
  ),
  trending_up: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.7L22 12V6H16Z"/>
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M21,18V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V6H20A2,2 0 0,0 18,8V16A2,2 0 0,0 20,18M20,8V16H18V8H20Z"/>
    </svg>
  ),
  pix: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 2C17.5 2 22 6.5 22 12S17.5 22 12 22 2 17.5 2 12 6.5 2 12 2ZM12 4C7.6 4 4 7.6 4 12S7.6 20 12 20 20 16.4 20 12 16.4 4 12 4ZM13.4 8.4L15.8 6L17.2 7.4L14.8 9.8L17.2 12.2L15.8 13.6L13.4 11.2L11 13.6L9.6 12.2L12 9.8L9.6 7.4L11 6L13.4 8.4Z"/>
    </svg>
  ),
  add: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M13.5 8H12V13L16.28 15.54L17 14.33L13.5 12.25V8ZM13 3C16.86 3 20 6.13 20 10S16.86 17 13 17H11V19H13C17.97 19 22 14.97 22 10S17.97 1 13 1 4 5.03 4 10H1L4.96 14.03L9 10H6C6 7.24 8.24 5 11 5S16 7.24 16 10 13.76 15 11 15H9V17H11C14.31 17 17 14.31 17 11S14.31 5 11 5 5 7.69 5 11H7C7 8.79 8.79 7 11 7S15 8.79 15 11 13.21 15 11 15H13Z"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 1L21 8V18C21 19.1 20.1 20 19 20H5C3.9 20 3 19.1 3 18V8L12 1ZM12 3.18L5 8.18V18H19V8.18L12 3.18ZM12 6C13.1 6 14 6.9 14 8S13.1 10 12 10 10 9.1 10 8 10.9 6 12 6ZM12 11.5C13.5 11.5 16 12.26 16 13.75V15H8V13.75C8 12.26 10.5 11.5 12 11.5Z"/>
    </svg>
  ),

  shield: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.1 7 14 7.9 14 9S13.1 11 12 11 10 10.1 10 9 10.9 7 12 7ZM12 17C10.33 17 8.9 16.16 8.17 14.89C8.27 13.55 10.33 12.83 12 12.83S15.73 13.55 15.83 14.89C15.1 16.16 13.67 17 12 17Z"/>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M12,8A4,4 0 0,0 8,12V20A1,1 0 0,0 9,21H15A1,1 0 0,0 16,20V12A4,4 0 0,0 12,8M12,10A2,2 0 0,1 14,12V19H10V12A2,2 0 0,1 12,10M12,2A1,1 0 0,0 11,3V6H4A1,1 0 0,0 3,7V9A1,1 0 0,0 4,10H20A1,1 0 0,0 21,9V7A1,1 0 0,0 20,6H13V3A1,1 0 0,0 12,2Z"/>
    </svg>
  ),
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sistema de roteamento baseado na URL
  useEffect(() => {
    const path = window.location.pathname;
    const routeMap = {
      '/': 'home',
      '/dashboard': 'dashboard',
      '/carteira': 'wallet',
      '/pedidos': 'orders',
      '/referral': 'referral',
      '/admin': 'admin',
      '/criar-bot': 'bot-builder',
      '/builder': 'builder',
      '/simulator': 'simulator',
      '/add-balance': 'add-balance',
      '/pagamento': 'payment'
    };
    
    const route = routeMap[path] || 'home';
    navigateTo(route);

    // Listener para mudanças na URL (botão voltar/avançar do navegador)
    const handlePopState = () => {
      const newPath = window.location.pathname;
      const newRoute = routeMap[newPath] || 'home';
      navigateTo(newRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Estados para autenticação - corrigindo o bug do cursor
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
    status: 'draft'
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
  const [walletData, setWalletData] = useState({
    balance: 0.00,
    transactions: []
  });
  const [addBalanceData, setAddBalanceData] = useState({
    amount: '',
    method: 'pix'
  });
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState(null);
  const [giftcardData, setGiftcardData] = useState({
    code: '',
    amount: '',
    created_by: ''
  });
  const [redeemCode, setRedeemCode] = useState('');
  const [referralData, setReferralData] = useState({
    referral_code: '',
    total_referrals: 0,
    total_earnings: 0,
    referrals: [],
    user_referral_earnings: 0
  });
  const [adminActiveTab, setAdminActiveTab] = useState('overview'); // overview, users, giftcards
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: ''
  });
  const [ordersActiveTab, setOrdersActiveTab] = useState('pending'); // pending, completed
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalDeposits: {
      last7days: 0,
      last14days: 0,
      last28days: 0
    },
    recentUsers: [],
    giftcards: [],
    allUsers: []
  });
  const [dashboardData, setDashboardData] = useState({
    totalBots: 0,
    activeBots: 0,
    totalEarnings: 0.00,
    referralEarnings: 0.00,
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

      // Scroll animation removida - elementos visíveis por padrão

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
      
      // Carregar saldo real do usuário
      setTimeout(() => {
        loadUserProfile();
      }, 100); // Pequeno delay para garantir que o setUser foi processado
    }
  }, []);

  // Testar conexão com backend na inicialização
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('🧪 Testando conexão com backend...');
        const response = await fetch(`${API_BASE}/api/health`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend conectado:', data);
        } else {
          console.error('❌ Backend erro:', response.status);
        }
      } catch (error) {
        console.error('❌ Erro conexão:', error);
      }
    };
    testConnection();
  }, []);

  // Garantir que elementos scroll-animate sejam visíveis imediatamente
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(element => {
      element.classList.add('animate-in');
    });
  }, []);

  // Criar bot inicial
  useEffect(() => {
    if (user && !botConfig.id) {
      const newBotId = 'demo-bot-' + Date.now();
      setBotConfig(prev => ({ ...prev, id: newBotId, user_id: user.id }));
    }
  }, [user]);

  // Carregar dados de referência quando visualizar carteira
  useEffect(() => {
    if (currentView === 'wallet' && user) {
      fetchReferralData();
      loadUserProfile(); // Atualizar saldo sempre que acessar carteira
      
      // Refresh periódico para capturar novos bônus
      const interval = setInterval(() => {
        loadUserProfile();
        fetchReferralData();
      }, 10000); // A cada 10 segundos
      
      return () => clearInterval(interval);
    }
  }, [currentView, user]);

  // Função para navegar entre páginas e atualizar URL
  const navigateTo = (view) => {
    const viewToPath = {
      'home': '/',
      'dashboard': '/dashboard',
      'wallet': '/carteira',
      'orders': '/pedidos',
      'referral': '/referral',
      'admin': '/admin',
      'bot-builder': '/criar-bot',
      'builder': '/builder',
      'simulator': '/simulator',
      'add-balance': '/add-balance',
      'payment': '/pagamento'
    };
    
    const path = viewToPath[view] || '/';
    window.history.pushState({}, '', path);
    setCurrentView(view);
    console.log(`🔄 Navegando para: ${view} (${path})`);
  };

  // Função auxiliar para fazer requests
  const makeRequest = async (url, options = {}) => {
    try {
      console.log(`🌐 Request: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      console.log(`📡 Status: ${response.status}`);
      return response;
      
    } catch (error) {
      console.error(`❌ Request error:`, error);
      throw error;
    }
  };

  // Funções de autenticação
  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('🔐 Login iniciado');
    
    if (!loginData.email || !loginData.password) {
      showNotification('❌ Preencha todos os campos', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📧 Email:', loginData.email);
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
      
      console.log('📡 Status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Sucesso:', userData.name);
        setUser(userData);
        localStorage.setItem('whatsapp_bot_user', JSON.stringify(userData));
        setBotConfig(prev => ({ ...prev, user_id: userData.id }));
        setShowLogin(false);
        showNotification('✅ Login realizado com sucesso!', 'success');
        navigateTo('dashboard');
        loadUserBots(userData.id);
        loadDashboardData(userData.id);
        
        // Carregar saldo real do usuário
        loadUserProfile();
        
        // Carregar dados de admin se for admin
        if (userData.role === 'admin') {
          loadAdminData();
        }
      } else if (response.status === 401) {
        showNotification('❌ Email ou senha incorretos', 'error');
      } else {
        showNotification('❌ Erro no servidor', 'error');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      showNotification('❌ Erro de conexão. Verifique sua internet e tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    console.log('📝 Tentativa de registro iniciada');
    
    // Validações
    if (!registerData.name || !registerData.email || !registerData.password) {
      showNotification('❌ Preencha todos os campos', 'error');
      return;
    }
    
    if (registerData.password.length < 6) {
      showNotification('❌ Senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      showNotification('❌ Email inválido', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('📧 Registro com email:', registerData.email);
      console.log('🌐 URL completa:', `${API_BASE}/api/auth/register`);
      
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Registro bem-sucedido:', userData.name);
        setUser(userData);
        localStorage.setItem('whatsapp_bot_user', JSON.stringify(userData));
        setBotConfig(prev => ({ ...prev, user_id: userData.id }));
        setShowRegister(false);
        
        // Mensagem diferente se usou código de referência
        if (registerData.referralCode) {
          showNotification('✅ Conta criada! Seu indicador ganhou R$ 0,50 de bônus!', 'success');
        } else {
          showNotification('✅ Conta criada e login automático realizado!', 'success');
        }
        
        navigateTo('dashboard');
        loadDashboardData(userData.id);
        
        // Carregar saldo real do usuário
        loadUserProfile();
        
        // Limpar dados do formulário
        setRegisterData({ name: '', email: '', password: '', referralCode: '' });
      } else if (response.status === 400) {
        console.log('❌ Erro de validação - 400');
        const errorData = await response.json().catch(() => ({ detail: 'Email já cadastrado' }));
        showNotification('❌ ' + (errorData.detail || 'Email já cadastrado'), 'error');
      } else {
        console.log('❌ Erro no servidor:', response.status);
        const errorData = await response.json().catch(() => ({ detail: 'Erro no servidor' }));
        showNotification('❌ Erro no registro: ' + (errorData.detail || 'Erro desconhecido'), 'error');
      }
    } catch (error) {
      console.error('💥 Erro capturado no registro:', error);
      
      if (error.name === 'AbortError') {
        showNotification('❌ Timeout na conexão. Tente novamente.', 'error');
      } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        showNotification('❌ Erro de conexão. Verifique sua internet e tente novamente.', 'error');
      } else {
        showNotification('❌ Erro no registro: ' + error.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('whatsapp_bot_user');
    navigateTo('home');
    setBotConfig({
      id: '',
      user_id: '',
      bot_name: 'Meu Bot',
      welcome_message: 'Olá! Bem-vindo ao nosso atendimento! Como posso ajudar você hoje?',
      buttons: [],
      products: [],
      business_info: { name: 'Minha Empresa' },
      ai_enabled: true,
      status: 'draft'
    });
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

  // Função para adicionar saldo
  const processAddBalance = async () => {
    const amount = parseFloat(addBalanceData.amount);
    if (!amount || amount < 1) {
      showNotification('❌ Valor mínimo para recarga é R$ 1,00', 'error');
      return;
    }

    if (addBalanceData.method === 'pix') {
      // Gerar dados do PIX
      const pixData = {
        amount: amount,
        qrCode: `00020126360014BR.GOV.BCB.PIX0114+55119876543210520400005303986540${amount.toFixed(2)}5802BR5925WHATSAPP BOT BUILDER LTDA6009SAO PAULO62070503***6304`,
        pixKey: '+55 (11) 98765-4321',
        paymentId: 'PIX' + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      };
      
      setPixPaymentData(pixData);
      setShowPixPayment(true);
    }
  };

  // Função para confirmar pagamento PIX (simulado)
  const confirmPixPayment = async () => {
    const amount = parseFloat(addBalanceData.amount);
    
    // Simular processamento
    showNotification('⏳ Processando pagamento PIX...', 'info');
    
    setTimeout(async () => {
      // Adicionar saldo
      setWalletData(prev => ({
        ...prev,
        balance: prev.balance + amount,
        transactions: [
          {
            id: Date.now(),
            type: 'deposit',
            amount: amount,
            method: 'PIX',
            status: 'completed',
            date: new Date().toISOString(),
            description: 'Recarga de saldo via PIX'
          },
          ...prev.transactions
        ]
      }));

      // Processar bônus de referência se >= R$50
      if (amount >= 50 && user?.referred_by) {
        const referralBonus = amount * 0.10;
        
        // Simular adição do bônus para o indicador
        setTimeout(() => {
          showNotification(`🎉 Seu indicador ganhou R$ ${referralBonus.toFixed(2)} de bônus!`, 'success');
        }, 1000);
      }

      setShowPixPayment(false);
      setAddBalanceData({ amount: '', method: 'pix' });
      showNotification('✅ Pagamento confirmado! Saldo adicionado com sucesso.', 'success');
    }, 3000);
  };

  // Função para pagamento com saldo
  const payWithBalance = async () => {
    const orderValue = 39.90; // Valor fixo do pedido
    
    if (!user) {
      showNotification('❌ Faça login para realizar o pagamento', 'error');
      return;
    }

    if (walletData.balance < orderValue) {
      showNotification(`❌ Saldo insuficiente. Você tem R$ ${walletData.balance.toFixed(2)} e precisa de R$ ${orderValue.toFixed(2)}`, 'error');
      return;
    }

    // Mostrar animação de processamento
    showNotification('⏳ Processando pagamento com saldo...', 'info');

    setTimeout(async () => {
      try {
        // Calcular novo saldo
        const newBalance = walletData.balance - orderValue;
        
        // Atualizar saldo no backend (usando a rota de admin para atualizar o próprio saldo)
        if (user && user.role === 'admin') {
          const response = await fetch(`${API_BASE}/api/admin/users/${user.id}/balance?admin_user_id=${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
          });
          
          if (response.ok) {
            // Atualizar saldo local após confirmação do backend
            loadUserProfile();
          }
        }
        
        // Deduzir valor do saldo localmente (para resposta imediata)
        setWalletData(prev => ({
          ...prev,
          balance: newBalance,
          transactions: [
            {
              id: Date.now(),
              type: 'purchase',
              amount: -orderValue,
              method: 'balance',
              status: 'completed',
              date: new Date().toISOString(),
              description: 'Compra Bot Premium - Pagamento com Saldo'
            },
            ...prev.transactions
          ]
        }));

        // Simular ativação do bot
        showNotification('✅ Pagamento aprovado! Bot ativado com sucesso!', 'success');
        
        // Atualizar status do bot para ativo
        if (botConfig && botConfig.id) {
          const updatedBot = { ...botConfig, status: 'active' };
          setBotConfig(updatedBot);
          
          // Atualizar na lista de bots do usuário
          setUserBots(prevBots => 
            prevBots.map(bot => 
              bot.id === botConfig.id ? updatedBot : bot
            )
          );
        }
        
        // Redirecionar para a aba de pedidos completos
        setTimeout(() => {
          navigateTo('orders');
          setOrdersActiveTab('completed');
        }, 1500);
      } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        showNotification('✅ Pagamento processado localmente! Bot ativado com sucesso!', 'success');
        
        // Mesmo com erro no backend, manter o fluxo local
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance - orderValue,
          transactions: [
            {
              id: Date.now(),
              type: 'purchase',
              amount: -orderValue,
              method: 'balance',
              status: 'completed',
              date: new Date().toISOString(),
              description: 'Compra Bot Premium - Pagamento com Saldo'
            },
            ...prev.transactions
          ]
        }));
        
        setTimeout(() => {
          navigateTo('orders');
        }, 1500);
      }
    }, 2000); // 2 segundos de animação
  };

  // Função para gerar e baixar bot em Python
  const downloadBot = async (bot) => {
    try {
      showNotification('⏳ Gerando seu bot em Python...', 'info');

      // Gerar código Python do bot
      const pythonCode = generatePythonBot(bot);
      const readmeContent = generateReadme(bot);
      const requirementsContent = generateRequirements();

      // Criar arquivos em formato ZIP usando JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Adicionar arquivos ao ZIP
      zip.file('bot.py', pythonCode);
      zip.file('README.md', readmeContent);
      zip.file('requirements.txt', requirementsContent);
      zip.file('config.json', JSON.stringify({
        bot_name: bot.bot_name,
        business_name: bot.business_info.name,
        welcome_message: bot.welcome_message,
        ai_enabled: bot.ai_enabled
      }, null, 2));

      // Gerar e baixar ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${bot.bot_name.replace(/\s+/g, '_').toLowerCase()}_bot.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('✅ Bot baixado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar bot:', error);
      showNotification('❌ Erro ao gerar o bot. Tente novamente.', 'error');
    }
  };

  // Função para gerar código Python do bot
  const generatePythonBot = (bot) => {
    return `# -*- coding: utf-8 -*-
"""
Bot WhatsApp - ${bot.bot_name}
Empresa: ${bot.business_info.name}
Gerado automaticamente pelo WhatsApp Bot Builder
"""

import json
import time
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import google.generativeai as genai

# Configuração do logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class WhatsAppBot:
    def __init__(self):
        self.config = self.load_config()
        self.driver = None
        self.setup_ai()
        
    def load_config(self):
        """Carrega configurações do arquivo config.json"""
        try:
            with open('config.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error("Arquivo config.json não encontrado!")
            return {}
    
    def setup_ai(self):
        """Configura a IA se habilitada"""
        if self.config.get('ai_enabled', False):
            # CONFIGURE SUA API KEY DO GEMINI AQUI
            # genai.configure(api_key="SUA_API_KEY_AQUI")
            # self.model = genai.GenerativeModel('gemini-pro')
            logger.info("IA habilitada - Configure sua API key do Gemini")
        
    def setup_driver(self):
        """Configura o navegador Chrome"""
        chrome_options = Options()
        chrome_options.add_argument('--user-data-dir=./chrome_profile')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.get('https://web.whatsapp.com')
        
        logger.info("WhatsApp Web aberto. Escaneie o QR Code para conectar.")
        input("Pressione Enter após escanear o QR Code...")
        
    def send_message(self, contact, message):
        """Envia mensagem para um contato"""
        try:
            # Buscar contato
            search_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]'))
            )
            search_box.clear()
            search_box.send_keys(contact)
            time.sleep(2)
            
            # Clicar no contato
            contact_element = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, f'//span[@title="{contact}"]'))
            )
            contact_element.click()
            
            # Digite e envie a mensagem
            message_box = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, '//div[@contenteditable="true"][@data-tab="10"]'))
            )
            message_box.send_keys(message)
            
            # Clique no botão enviar
            send_button = self.driver.find_element(By.XPATH, '//span[@data-icon="send"]')
            send_button.click()
            
            logger.info(f"Mensagem enviada para {contact}: {message[:50]}...")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem: {e}")
            return False
    
    def process_message(self, message_text):
        """Processa mensagem recebida e gera resposta"""
        message_lower = message_text.lower().strip()
        
        # Respostas automáticas baseadas nos botões configurados
        responses = {
${bot.buttons.map(button => `            '${button.text.toLowerCase()}': '''${button.response_message}''',`).join('\n')}
        }
        
        # Verificar se a mensagem corresponde a algum botão
        for key, response in responses.items():
            if key in message_lower:
                return response
        
        # Se IA estiver habilitada, usar para resposta personalizada
        if self.config.get('ai_enabled', False):
            try:
                # Descomente e configure quando tiver a API key
                # prompt = f"Você é um assistente da empresa {self.config.get('business_name', '')}. Responda de forma útil e profissional: {message_text}"
                # response = self.model.generate_content(prompt)
                # return response.text
                pass
            except Exception as e:
                logger.error(f"Erro na IA: {e}")
        
        # Resposta padrão
        return "${bot.welcome_message}"
    
    def monitor_messages(self):
        """Monitora mensagens recebidas"""
        logger.info("Iniciando monitoramento de mensagens...")
        
        last_message_count = 0
        
        while True:
            try:
                # Verificar mensagens não lidas
                messages = self.driver.find_elements(By.XPATH, '//div[@class="_2AOIt"]')
                
                if len(messages) > last_message_count:
                    logger.info("Nova mensagem detectada!")
                    # Aqui você pode adicionar lógica para processar mensagens automaticamente
                    last_message_count = len(messages)
                
                time.sleep(5)  # Verificar a cada 5 segundos
                
            except Exception as e:
                logger.error(f"Erro no monitoramento: {e}")
                time.sleep(10)
    
    def show_menu(self):
        """Exibe menu interativo"""
        print("\\n" + "="*50)
        print(f"🤖 BOT WHATSAPP - {self.config.get('bot_name', 'Sem Nome')}")
        print(f"🏢 Empresa: {self.config.get('business_name', 'Não informada')}")
        print("="*50)
        print("\\n📋 MENU DE OPÇÕES:")
        print("1. Enviar mensagem manual")
        print("2. Iniciar monitoramento automático")
        print("3. Mostrar configurações")
        print("4. Sair")
        print("\\n" + "="*50)
    
    def run(self):
        """Executa o bot"""
        try:
            self.setup_driver()
            
            while True:
                self.show_menu()
                choice = input("\\nEscolha uma opção (1-4): ").strip()
                
                if choice == '1':
                    contact = input("Digite o nome do contato: ")
                    message = input("Digite a mensagem: ")
                    self.send_message(contact, message)
                    
                elif choice == '2':
                    print("Iniciando monitoramento automático...")
                    print("Pressione Ctrl+C para parar")
                    self.monitor_messages()
                    
                elif choice == '3':
                    print(f"\\n📊 CONFIGURAÇÕES ATUAIS:")
                    print(f"Nome do Bot: {self.config.get('bot_name', 'N/A')}")
                    print(f"Empresa: {self.config.get('business_name', 'N/A')}")
                    print(f"IA Habilitada: {'Sim' if self.config.get('ai_enabled') else 'Não'}")
                    print(f"Botões Configurados: ${bot.buttons.length}")
                    
                elif choice == '4':
                    print("Encerrando bot...")
                    break
                    
                else:
                    print("Opção inválida!")
                    
        except KeyboardInterrupt:
            print("\\nBot interrompido pelo usuário.")
        except Exception as e:
            logger.error(f"Erro fatal: {e}")
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    bot = WhatsAppBot()
    bot.run()
`;
  };

  // Função para gerar README
  const generateReadme = (bot) => {
    return `# 🤖 ${bot.bot_name}

Bot WhatsApp automatizado gerado pelo **WhatsApp Bot Builder**.

## 📋 Sobre o Bot

- **Nome:** ${bot.bot_name}
- **Empresa:** ${bot.business_info.name}
- **IA Habilitada:** ${bot.ai_enabled ? 'Sim' : 'Não'}
- **Botões Configurados:** ${bot.buttons.length}
- **Produtos Cadastrados:** ${bot.products.length}

## 🚀 Como Executar

### 1. Instalar Dependências

\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 2. Configurar Chrome Driver

1. Baixe o ChromeDriver compatível com sua versão do Chrome em: https://chromedriver.chromium.org/
2. Adicione o ChromeDriver ao PATH do sistema ou coloque na pasta do bot

### 3. Configurar IA (Opcional)

Se a IA estiver habilitada, você precisa:
1. Obter uma API key do Google Gemini: https://makersuite.google.com/app/apikey
2. Editar o arquivo \`bot.py\` e adicionar sua API key na linha indicada

### 4. Executar o Bot

\`\`\`bash
python bot.py
\`\`\`

## 📱 Como Usar

1. **Primeira execução:** O bot abrirá o WhatsApp Web no Chrome
2. **Escanear QR Code:** Use seu celular para escanear o código QR
3. **Menu interativo:** Escolha uma das opções disponíveis:
   - Enviar mensagem manual
   - Monitoramento automático
   - Ver configurações
   - Sair

## ⚙️ Configurações

As configurações do bot estão no arquivo \`config.json\`:

\`\`\`json
{
  "bot_name": "${bot.bot_name}",
  "business_name": "${bot.business_info.name}",
  "welcome_message": "${bot.welcome_message}",
  "ai_enabled": ${bot.ai_enabled}
}
\`\`\`

## 🔘 Respostas Automáticas

O bot foi configurado com as seguintes respostas automáticas:

${bot.buttons.map(button => `- **"${button.text}"** → ${button.response_message}`).join('\n')}

## 📦 Produtos Cadastrados

${bot.products.length > 0 ? bot.products.map(product => `- **${product.name}** - R$ ${product.price}`).join('\n') : 'Nenhum produto cadastrado'}

## ⚠️ Importante

- Mantenha o WhatsApp Web sempre logado
- Não feche o navegador Chrome durante o uso
- O bot funciona apenas com o WhatsApp Web aberto
- Para uso comercial, verifique os termos de uso do WhatsApp

## 🆘 Problemas Comuns

1. **ChromeDriver não encontrado:** Baixe e configure o ChromeDriver
2. **WhatsApp desconectado:** Reescaneie o QR Code
3. **IA não funciona:** Configure a API key do Gemini
4. **Mensagens não enviadas:** Verifique se o contato existe

## 📞 Suporte

Este bot foi gerado automaticamente. Para suporte técnico, entre em contato com o WhatsApp Bot Builder.

---
**Gerado em:** ${new Date().toLocaleDateString('pt-BR')}
**Versão:** 1.0.0
`;
  };

  // Função para gerar requirements.txt
  const generateRequirements = () => {
    return `selenium==4.15.0
google-generativeai==0.3.0
webdriver-manager==4.0.1
python-dotenv==1.0.0
requests==2.31.0
`;
  };

  // Função separada para salvar e ir para pagamento
  const saveBotAndGoToPayment = async () => {
    if (!user) {
      showNotification('❌ Faça login para salvar seu bot e prosseguir com o pagamento', 'error');
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
        showNotification('✅ Bot salvo! Redirecionando para pagamento...', 'success');
        navigateTo('payment');
        loadUserBots(user.id);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao salvar bot');
      }
    } catch (error) {
      showNotification('❌ Erro ao salvar bot', 'error');
      return false;
    }
  };
  const cancelPixPayment = () => {
    setShowPixPayment(false);
    setPixPaymentData(null);
    showNotification('❌ Pagamento cancelado', 'info');
  };

  // Função para gerar giftcard (apenas admins)
  const generateGiftcard = async () => {
    if (!user || user.role !== 'admin') {
      showNotification('❌ Apenas administradores podem criar giftcards', 'error');
      return;
    }

    const amount = parseFloat(giftcardData.amount);
    if (!amount || amount < 1) {
      showNotification('❌ Valor mínimo para giftcard é R$ 1,00', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/giftcards?admin_user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount })
      });

      if (response.ok) {
        const newGiftcard = await response.json();
        
        // Atualizar lista local de giftcards
        setAdminData(prev => ({
          ...prev,
          giftcards: [newGiftcard, ...prev.giftcards]
        }));

        setGiftcardData({ code: '', amount: '', created_by: '' });
        showNotification(`✅ Giftcard criado: ${newGiftcard.code}`, 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar giftcard');
      }
    } catch (error) {
      showNotification('❌ Erro ao criar giftcard: ' + error.message, 'error');
    }
  };

  // Função para resgatar giftcard
  const redeemGiftcard = async () => {
    if (!redeemCode.trim()) {
      showNotification('❌ Digite o código do giftcard', 'error');
      return;
    }

    if (!user) {
      showNotification('❌ Faça login para resgatar giftcard', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/giftcards/redeem?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: redeemCode.toUpperCase() })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Atualizar saldo local (recarregar dados do usuário seria melhor)
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance + result.amount,
          transactions: [
            {
              id: Date.now(),
              type: 'giftcard',
              amount: result.amount,
              method: 'giftcard',
              status: 'completed',
              date: new Date().toISOString(),
              description: `Giftcard resgatado: ${result.code}`
            },
            ...prev.transactions
          ]
        }));

        setRedeemCode('');
        showNotification(result.message, 'success');
        
        // Recarregar giftcards se for admin
        if (user.role === 'admin') {
          loadAdminGiftcards();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao resgatar giftcard');
      }
    } catch (error) {
      showNotification('❌ ' + error.message, 'error');
    }
  };

  // Função para buscar dados de referência
  const fetchReferralData = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_BASE}/api/referrals/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de referência:', error);
    }
  };

  // Função para deletar bot pendente
  const deleteBot = async (botId, botName) => {
    if (!confirm(`Tem certeza que deseja deletar o bot "${botName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/bots/${botId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remover bot da lista local
        setUserBots(prev => prev.filter(bot => bot.id !== botId));
        showNotification('✅ Bot deletado com sucesso!', 'success');
      } else {
        throw new Error('Erro ao deletar bot');
      }
    } catch (error) {
      console.error('Erro ao deletar bot:', error);
      showNotification('❌ Erro ao deletar bot. Tente novamente.', 'error');
    }
  };

  // Função para banir usuário (admin/mod)
  const banUser = async (userId) => {
    if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
      showNotification('❌ Sem permissão para banir usuários', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/ban?admin_user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action: 'ban' })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('✅ ' + result.message, 'success');
        // Recarregar dados do admin
        if (user.role === 'admin') {
          loadAdminData();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao banir usuário');
      }
    } catch (error) {
      showNotification('❌ ' + error.message, 'error');
    }
  };

  // Função para desbanir usuário (admin/mod)
  const unbanUser = async (userId) => {
    if (!user || (user.role !== 'admin' && user.role !== 'mod')) {
      showNotification('❌ Sem permissão para desbanir usuários', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/ban?admin_user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, action: 'unban' })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('✅ ' + result.message, 'success');
        if (user.role === 'admin') {
          loadAdminData();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao desbanir usuário');
      }
    } catch (error) {
      showNotification('❌ ' + error.message, 'error');
    }
  };

  // Função para atualizar saldo do usuário (apenas admin)
  const updateUserBalance = async (userId, newBalance) => {
    if (!user || user.role !== 'admin') {
      showNotification('❌ Apenas administradores podem editar saldos', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/balance?admin_user_id=${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balance: parseFloat(newBalance) })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('✅ Saldo atualizado com sucesso', 'success');
        loadAdminData();
        
        // Se o admin editou o próprio saldo, atualizar o saldo local
        if (userId === user.id) {
          loadUserProfile();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao atualizar saldo');
      }
    } catch (error) {
      showNotification('❌ ' + error.message, 'error');
    }
  };

  // Função para deletar usuário (apenas admin)
  const deleteUser = async (userId) => {
    if (!user || user.role !== 'admin') {
      showNotification('❌ Apenas administradores podem deletar usuários', 'error');
      return;
    }

    if (!confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}?admin_user_id=${user.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('✅ Usuário deletado com sucesso', 'success');
        loadAdminData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao deletar usuário');
      }
    } catch (error) {
      showNotification('❌ ' + error.message, 'error');
    }
  };

  // Função para resetar saldos de todos os usuários (apenas admin)
  const resetAllBalances = async () => {
    if (!user || user.role !== 'admin') {
      showNotification('❌ Apenas administradores podem resetar saldos', 'error');
      return;
    }

    if (!confirm('Tem certeza que deseja zerar o saldo de TODOS os usuários? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/admin/reset-balances?admin_user_id=${user.id}`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        showNotification('✅ ' + result.message, 'success');
        loadAdminData();
        // Atualizar saldo do usuário logado se necessário
        if (user) {
          loadUserProfile();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao resetar saldos');
      }
    } catch (error) {
      showNotification('❌ ' + error.message, 'error');
    }
  };

  // Função para carregar o perfil do usuário incluindo saldo real
  const loadUserProfile = async () => {
    if (!user || !user.id) return;

    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/profile`);
      if (response.ok) {
        const userData = await response.json();
        console.log('🔄 Atualizando perfil:', userData);
        
        // Atualizar walletData com saldo real do backend
        setWalletData(prev => ({
          ...prev,
          balance: userData.balance
        }));
        
        // Atualizar dados do usuário se necessário
        setUser(prevUser => ({
          ...prevUser,
          balance: userData.balance,
          referral_earnings: userData.referral_earnings || 0,
          referral_code: userData.referral_code || prevUser.referral_code
        }));
        
        console.log('✅ Saldo atualizado para:', userData.balance);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
    }
  };



  // Função para carregar giftcards do admin
  const loadAdminGiftcards = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      const response = await fetch(`${API_BASE}/api/admin/giftcards?admin_user_id=${user.id}`);
      if (response.ok) {
        const giftcards = await response.json();
        setAdminData(prev => ({
          ...prev,
          giftcards: giftcards
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar giftcards:', error);
    }
  };

  // Função para carregar todos os usuários (admin)
  const loadAllUsers = async () => {
    if (!user || user.role !== 'admin') return;

    console.log('👥 Fazendo request para carregar usuários...');
    try {
      const response = await fetch(`${API_BASE}/api/admin/users?admin_user_id=${user.id}`);
      console.log('👥 Response status:', response.status);
      
      if (response.ok) {
        const users = await response.json();
        console.log('👥 Usuários carregados:', users.length, users);
        setAdminData(prev => ({
          ...prev,
          allUsers: users
        }));
      } else {
        console.error('❌ Erro ao carregar usuários:', await response.text());
      }
    } catch (error) {
      console.error('❌ Erro na requisição de usuários:', error);
    }
  };

  // Função para carregar dados admin
  const loadAdminData = async () => {
    if (!user || user.role !== 'admin') return;

    console.log('🔍 Carregando dados admin para usuário:', user.id);

    try {
      // Carregar estatísticas do admin
      console.log('📊 Carregando estatísticas...');
      const statsResponse = await fetch(`${API_BASE}/api/admin/stats?admin_user_id=${user.id}`);
      console.log('📊 Response status:', statsResponse.status);
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        console.log('📊 Stats carregadas:', stats);
        setAdminData(prev => ({
          ...prev,
          totalUsers: stats.totalUsers,
          totalDeposits: stats.totalDeposits,
          recentUsers: stats.recentUsers
        }));
      } else {
        console.error('❌ Erro ao carregar stats:', await statsResponse.text());
      }

      // Carregar giftcards
      console.log('🎁 Carregando giftcards...');
      await loadAdminGiftcards();
      
      // Carregar todos os usuários
      console.log('👥 Carregando usuários...');
      await loadAllUsers();
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados admin:', error);
    }
  };
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
      // Modo demo - apenas simular salvamento SEM mensagem de pagamento
      showNotification('✅ Bot salvo em modo demo!', 'info');
      return true;
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
        showNotification('✅ Bot salvo com sucesso!', 'success');
        loadUserBots(user.id);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao salvar bot');
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
      let botResponse;
      
      if (!user) {
        // Modo demo - respostas simuladas
        botResponse = await generateDemoResponse(currentMessage, chatSession.messages.length);
      } else {
        // Modo com usuário logado - API real
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
        
        botResponse = data.bot_response;
      }
      
      const botMessage = {
        id: Date.now() + 1,
        message: botResponse,
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
        message: "⚠️ Erro ao processar mensagem. Tente novamente.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setChatSession(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage]
      }));
    }
  };

  // Função para gerar respostas demo
  const generateDemoResponse = async (userMessage, messageCount) => {
    // Simular delay da IA
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Primeira mensagem - boas vindas
    if (messageCount <= 1) {
      const response = botConfig.welcome_message;
      const buttons = botConfig.buttons;
      if (buttons.length > 0) {
        let buttonText = "\n\nEscolha uma opção:";
        buttons.forEach((button, index) => {
          buttonText += `\n${index + 1}. ${button.text}`;
        });
        return response + buttonText;
      }
      return response;
    }
    
    // Verificar se é um número (opção do botão)
    const buttonIndex = parseInt(userMessage.trim()) - 1;
    if (!isNaN(buttonIndex) && buttonIndex >= 0 && buttonIndex < botConfig.buttons.length) {
      const button = botConfig.buttons[buttonIndex];
      if (button.action === 'show_catalog') {
        return generateCatalogResponse();
      } else if (button.action === 'custom_message') {
        return button.response_message || 'Obrigado pelo contato!';
      } else if (button.action === 'redirect') {
        return `Acesse: ${button.redirect_url || '#'}`;
      }
    }
    
    // Respostas inteligentes simuladas
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde')) {
      return `Olá! Seja bem-vindo à ${botConfig.business_info.name}! Como posso ajudar você hoje?`;
    }
    
    if (lowerMessage.includes('produto') || lowerMessage.includes('catálogo') || lowerMessage.includes('comprar')) {
      return generateCatalogResponse();
    }
    
    if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('custa')) {
      return 'Nossos preços são muito competitivos! Posso mostrar nosso catálogo completo para você escolher o que mais se adequa às suas necessidades.';
    }
    
    if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada') || lowerMessage.includes('valeu')) {
      return 'Por nada! Fico feliz em ajudar. Se precisar de mais alguma coisa, é só falar! 😊';
    }
    
    if (lowerMessage.includes('tchau') || lowerMessage.includes('até') || lowerMessage.includes('adeus')) {
      return 'Até logo! Foi um prazer atendê-lo. Volte sempre que precisar! 👋';
    }
    
    // Resposta padrão inteligente
    const responses = [
      `Entendo sua pergunta sobre "${userMessage}". Nossa equipe da ${botConfig.business_info.name} pode ajudar você com isso!`,
      'Interessante! Vou verificar essa informação para você. Enquanto isso, posso mostrar nossos produtos?',
      'Ótima pergunta! Nossa experiência na área nos permite oferecer as melhores soluções. Gostaria de saber mais?',
      'Perfeito! Temos várias opções que podem atender exatamente o que você precisa. Posso apresentar algumas?'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateCatalogResponse = () => {
    if (botConfig.products.length === 0) {
      return "Ainda não temos produtos cadastrados neste bot demo. Adicione alguns produtos no construtor para ver como funciona!";
    }
    
    let response = "🛍️ **Nosso Catálogo:**\n\n";
    botConfig.products.slice(0, 5).forEach(product => {
      response += `📦 **${product.name}**\n`;
      response += `💰 R$ ${product.price.toFixed(2)}\n`;
      response += `📝 ${product.description}\n\n`;
    });
    
    if (botConfig.products.length > 5) {
      response += `... e mais ${botConfig.products.length - 5} produtos!`;
    }
    
    return response;
  };

  const ensureBotExists = async () => {
    if (!user) {
      // Modo demo - bot já existe localmente
      return;
    }
    
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

  // Componente para criar usuário (admin)
  const CreateUserModal = () => {
    const [localUserData, setLocalUserData] = useState({
      name: '',
      email: '',
      password: '',
      referralCode: '',
      role: 'user'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validações
      if (!localUserData.name || !localUserData.email || !localUserData.password) {
        showNotification('❌ Preencha todos os campos obrigatórios', 'error');
        return;
      }

      if (localUserData.password.length < 6) {
        showNotification('❌ Senha deve ter pelo menos 6 caracteres', 'error');
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localUserData.email)) {
        showNotification('❌ Email inválido', 'error');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/users/create?admin_user_id=${user.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localUserData)
        });

        if (response.ok) {
          showNotification('✅ Usuário criado com sucesso!', 'success');
          setShowCreateUser(false);
          setLocalUserData({ name: '', email: '', password: '', referralCode: '', role: 'user' });
          loadAdminData(); // Recarregar lista de usuários
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao criar usuário');
        }
      } catch (error) {
        showNotification('❌ ' + error.message, 'error');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-blue-500/20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Criar Novo Usuário</h3>
            <p className="text-gray-400">Preencha os dados do novo usuário</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Nome Completo</label>
              <input
                type="text"
                value={localUserData.name}
                onChange={(e) => setLocalUserData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={localUserData.email}
                onChange={(e) => setLocalUserData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o email"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={localUserData.password}
                onChange={(e) => setLocalUserData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite a senha (mín. 6 caracteres)"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Nível de Acesso</label>
              <select
                value={localUserData.role}
                onChange={(e) => setLocalUserData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="user">👤 Usuário Normal</option>
                <option value="mod">🛡️ Moderador</option>
                <option value="admin">👑 Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Código de Referência (Opcional)</label>
              <input
                type="text"
                value={localUserData.referralCode}
                onChange={(e) => setLocalUserData(prev => ({ ...prev, referralCode: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Código de referência (opcional)"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateUser(false);
                  setLocalUserData({ name: '', email: '', password: '', referralCode: '', role: 'user' });
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center space-x-2"
              >
                {Icons.plus}
                <span>Criar Usuário</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente de Login - Corrigido para manter foco
  const LoginModal = () => {
    const [localLoginData, setLocalLoginData] = useState({ email: '', password: '' });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validação básica
      if (!localLoginData.email || !localLoginData.password) {
        showNotification('❌ Preencha email e senha', 'error');
        return;
      }

      setIsLoading(true);
      
      try {
        console.log('🔐 Login modal - tentativa iniciada');
        console.log('📧 Email:', localLoginData.email);
        console.log('🌐 URL:', `${API_BASE}/api/auth/login`);
        
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localLoginData)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Login bem-sucedido:', userData.name);
          setUser(userData);
          localStorage.setItem('whatsapp_bot_user', JSON.stringify(userData));
          setBotConfig(prev => ({ ...prev, user_id: userData.id }));
          setShowLogin(false);
          showNotification('✅ Login realizado com sucesso!', 'success');
          navigateTo('dashboard');
          loadUserBots(userData.id);
          loadDashboardData(userData.id);
          
          // Carregar dados de admin se for admin
          if (userData.role === 'admin') {
            loadAdminData();
          }
        } else if (response.status === 401) {
          console.log('❌ Login inválido - 401');
          showNotification('❌ Email ou senha incorretos', 'error');
        } else {
          console.log('❌ Erro no servidor:', response.status);
          const errorData = await response.json().catch(() => ({ detail: 'Erro no servidor' }));
          showNotification('❌ Erro no login: ' + (errorData.detail || 'Erro desconhecido'), 'error');
        }
      } catch (error) {
        console.error('💥 Erro capturado no login modal:', error);
        
        if (error.name === 'AbortError') {
          showNotification('❌ Timeout na conexão. Tente novamente.', 'error');
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          showNotification('❌ Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        } else {
          showNotification('❌ Erro no login: ' + error.message, 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={localLoginData.email}
                onChange={(e) => setLocalLoginData(prev => ({ ...prev, email: e.target.value }))}
                className="futuristic-input"
                required
                autoComplete="email"
                autoFocus={false}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Senha"
                value={localLoginData.password}
                onChange={(e) => setLocalLoginData(prev => ({ ...prev, password: e.target.value }))}
                className="futuristic-input"
                required
                autoComplete="current-password"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`futuristic-btn-main w-full flex items-center justify-center space-x-2 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <button 
              onClick={() => { 
                setShowLogin(false); 
                setShowRegister(true); 
                setLocalLoginData({ email: '', password: '' });
              }}
              className="text-purple-400 hover:text-purple-300"
            >
              Não tem conta? Cadastre-se
            </button>
          </div>
          <button 
            onClick={() => {
              setShowLogin(false);
              setLocalLoginData({ email: '', password: '' });
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Componente de Registro - Corrigido para manter foco  
  const RegisterModal = () => {
    const [localRegisterData, setLocalRegisterData] = useState({
      name: '',
      email: '',
      password: '',
      referralCode: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validações
      if (!localRegisterData.name || !localRegisterData.email || !localRegisterData.password) {
        showNotification('❌ Preencha todos os campos', 'error');
        return;
      }
      
      if (localRegisterData.password.length < 6) {
        showNotification('❌ Senha deve ter pelo menos 6 caracteres', 'error');
        return;
      }

      // Validação básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localRegisterData.email)) {
        showNotification('❌ Email inválido', 'error');
        return;
      }
      
      setIsLoading(true);
      
      try {
        console.log('📝 Registro modal - tentativa iniciada');
        console.log('📧 Email:', localRegisterData.email);
        console.log('🌐 URL:', `${API_BASE}/api/auth/register`);
        
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localRegisterData)
        });
        
        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
          const userData = await response.json();
          console.log('✅ Registro bem-sucedido:', userData.name);
          setUser(userData);
          localStorage.setItem('whatsapp_bot_user', JSON.stringify(userData));
          setBotConfig(prev => ({ ...prev, user_id: userData.id }));
          setShowRegister(false);
          
          // Mensagem diferente se usou código de referência
          if (localRegisterData.referralCode) {
            showNotification('✅ Conta criada! Seu indicador ganhou R$ 0,50 de bônus!', 'success');
          } else {
            showNotification('✅ Conta criada e login automático realizado!', 'success');
          }
          
          navigateTo('dashboard');
          loadDashboardData(userData.id);
          
          // Carregar saldo real do usuário
          loadUserProfile();
          
          // Limpar dados do formulário
          setLocalRegisterData({ name: '', email: '', password: '', referralCode: '' });
        } else if (response.status === 400) {
          console.log('❌ Erro de validação - 400');
          const errorData = await response.json().catch(() => ({ detail: 'Email já cadastrado' }));
          showNotification('❌ ' + (errorData.detail || 'Email já cadastrado'), 'error');
        } else {
          console.log('❌ Erro no servidor:', response.status);
          const errorData = await response.json().catch(() => ({ detail: 'Erro no servidor' }));
          showNotification('❌ Erro no registro: ' + (errorData.detail || 'Erro desconhecido'), 'error');
        }
      } catch (error) {
        console.error('💥 Erro capturado no registro modal:', error);
        
        if (error.name === 'AbortError') {
          showNotification('❌ Timeout na conexão. Tente novamente.', 'error');
        } else if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
          showNotification('❌ Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        } else {
          showNotification('❌ Erro no registro: ' + error.message, 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-purple-500/30 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Criar Conta</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Como quer ser chamado?"
                value={localRegisterData.name}
                onChange={(e) => setLocalRegisterData(prev => ({ ...prev, name: e.target.value }))}
                className="futuristic-input"
                required
                autoComplete="name"
                autoFocus={false}
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={localRegisterData.email}
                onChange={(e) => setLocalRegisterData(prev => ({ ...prev, email: e.target.value }))}
                className="futuristic-input"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Senha (mínimo 6 caracteres)"
                value={localRegisterData.password}
                onChange={(e) => setLocalRegisterData(prev => ({ ...prev, password: e.target.value }))}
                className="futuristic-input"
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Código de indicação (opcional)"
                value={localRegisterData.referralCode}
                onChange={(e) => setLocalRegisterData(prev => ({ ...prev, referralCode: e.target.value }))}
                className="futuristic-input"
                autoComplete="off"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className={`futuristic-btn-main w-full flex items-center justify-center space-x-2 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Criando...</span>
                </>
              ) : (
                <span>Criar Conta</span>
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <button 
              onClick={() => { 
                setShowRegister(false); 
                setShowLogin(true); 
                setLocalRegisterData({ name: '', email: '', password: '', referralCode: '' });
              }}
              className="text-purple-400 hover:text-purple-300"
            >
              Já tem conta? Faça login
            </button>
          </div>
          <button 
            onClick={() => {
              setShowRegister(false);
              setLocalRegisterData({ name: '', email: '', password: '', referralCode: '' });
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Componente de Pagamento PIX
  const PixPaymentModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/60 backdrop-blur-xl p-8 rounded-3xl border border-green-500/30 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            {Icons.pix}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Pagamento PIX</h2>
          <p className="text-gray-400">R$ {pixPaymentData?.amount.toFixed(2)}</p>
        </div>

        <div className="space-y-6">
          {/* QR Code simulado */}
          <div className="bg-white p-4 rounded-lg">
            <div className="w-48 h-48 mx-auto bg-black flex items-center justify-center">
              <div className="text-white text-xs text-center">
                QR CODE PIX<br/>
                {pixPaymentData?.amount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Chave PIX */}
          <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/20">
            <p className="text-green-400 text-sm mb-2">Chave PIX:</p>
            <div className="flex items-center justify-between">
              <p className="text-white font-mono text-sm">{pixPaymentData?.pixKey}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(pixPaymentData?.pixKey);
                  showNotification('📋 Chave PIX copiada!', 'success');
                }}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                Copiar
              </button>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">Expira em: 30 minutos</p>
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <button
              onClick={confirmPixPayment}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
            >
              {Icons.pix}
              <span>Confirmar Pagamento</span>
            </button>
            <button
              onClick={cancelPixPayment}
              className="w-full p-3 border border-red-500/50 text-red-300 rounded-xl hover:bg-red-800/30 transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const InteractiveChart = ({ data }) => {
    const [hoveredBar, setHoveredBar] = useState(null);
    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <div className="relative h-64 p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {data.map((stat, index) => (
            <div 
              key={index}
              className="flex-1 flex flex-col items-center relative"
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="relative w-full">
                <div 
                  className={`w-full bg-gradient-to-t from-purple-500 to-cyan-500 rounded-t transition-all duration-500 hover:from-purple-400 hover:to-cyan-400 cursor-pointer ${
                    hoveredBar === index ? 'scale-105' : ''
                  }`}
                  style={{ 
                    height: `${(stat.value / maxValue) * 200}px`,
                    animation: `slideUp 1s ease-out ${index * 0.1}s both`
                  }}
                ></div>
                {hoveredBar === index && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                    {stat.value}% - {stat.sales} vendas
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">{stat.month}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-dark-theme relative overflow-hidden">
      {/* Indicador de rota ativa - apenas para demonstração */}
      <div className="fixed top-2 right-2 bg-black/70 px-3 py-1 rounded-lg text-xs z-50 border border-purple-500/30">
        📍 {window.location.pathname}
      </div>
      
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

      {/* Ícones flutuantes animados (menores) */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="floating-icon" style={{top: '10%', left: '10%'}}>
          <div className="w-6 h-6 text-purple-400 opacity-60">{Icons.robot}</div>
        </div>
        <div className="floating-icon" style={{top: '20%', right: '15%'}}>
          <div className="w-4 h-4 text-cyan-400 opacity-50">{Icons.chat}</div>
        </div>
        <div className="floating-icon" style={{top: '60%', left: '5%'}}>
          <div className="w-7 h-7 text-purple-300 opacity-40">{Icons.lightning}</div>
        </div>
        <div className="floating-icon" style={{bottom: '20%', right: '10%'}}>
          <div className="w-5 h-5 text-cyan-300 opacity-60">{Icons.chart}</div>
        </div>
        <div className="floating-icon" style={{bottom: '40%', left: '20%'}}>
          <div className="w-6 h-6 text-purple-500 opacity-50">{Icons.package}</div>
        </div>
        <div className="floating-icon" style={{top: '45%', right: '25%'}}>
          <div className="w-4 h-4 text-cyan-500 opacity-45">{Icons.credit_card}</div>
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
                      { id: 'wallet', label: 'Carteira', icon: Icons.wallet },
                      { id: 'orders', label: 'Meus Pedidos', icon: Icons.orders },
                      { id: 'builder', label: 'Construtor', icon: Icons.build },
                      { id: 'simulator', label: 'Simulador', icon: Icons.phone },
                      ...(user.role === 'admin' ? [{ id: 'admin', label: 'Admin', icon: Icons.admin }] : [])
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
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
                    onClick={() => navigateTo('home')}
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
                    onClick={() => navigateTo('builder')}
                    className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 flex items-center justify-center space-x-3"
                  >
                    {Icons.build}
                    <span>Começar Agora</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                  <button 
                    onClick={() => navigateTo('simulator')}
                    className="group px-10 py-5 bg-black/50 text-white rounded-2xl text-xl font-bold border-2 border-purple-500/50 hover:bg-purple-900/30 hover:border-purple-400 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-3"
                  >
                    {Icons.phone}
                    <span>Ver Demo</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
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
                      <div className="text-3xl mb-6">{Icons.robot}</div>
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
                      <div className="text-3xl mb-6">{Icons.package}</div>
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
                      <div className="text-3xl mb-6">{Icons.credit_card}</div>
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
                  onClick={() => navigateTo('builder')}
                  className="px-12 py-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 flex items-center justify-center space-x-3 mx-auto"
                >
                  <span>Criar Meu Bot Agora</span>
                  {Icons.build}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Section */}
        {currentView === 'admin' && user && user.role === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                {Icons.admin}
                <span>Painel Administrativo</span>
              </h1>
              <p className="text-gray-400">Gerencie usuários, depósitos e sistema geral</p>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex space-x-2 mb-8">
              {[
                { id: 'overview', label: 'Visão Geral', icon: Icons.dashboard },
                { id: 'users', label: 'Usuários', icon: Icons.user },
                { id: 'giftcards', label: 'Giftcards', icon: Icons.gift }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                    adminActiveTab === tab.id 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg shadow-red-500/50' 
                      : 'text-red-300 hover:text-white hover:bg-red-800/30 border border-red-500/20'
                  }`}
                >
                  <div className="w-4 h-4">{tab.icon}</div>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {adminActiveTab === 'overview' && (
              <>
                {/* Estatísticas de Admin */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20 hover:border-red-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Usuários</p>
                        <p className="text-3xl font-bold text-white">{adminData.totalUsers}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                        {Icons.user}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Últimos 7 dias</p>
                        <p className="text-3xl font-bold text-green-400">R$ {adminData.totalDeposits.last7days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        {Icons.trending_up}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Últimos 14 dias</p>
                        <p className="text-3xl font-bold text-blue-400">R$ {adminData.totalDeposits.last14days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        {Icons.chart}
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Últimos 28 dias</p>
                        <p className="text-3xl font-bold text-purple-400">R$ {adminData.totalDeposits.last28days.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        {Icons.wallet}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usuários Recentes */}
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    {Icons.shield}
                    <span>Usuários Recentes</span>
                  </h3>

                  <div className="space-y-4">
                    {adminData.recentUsers.map((user_item) => (
                      <div key={user_item.id} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-red-500/10">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            {Icons.user}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user_item.name}</p>
                            <p className="text-gray-400 text-sm">{user_item.email}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user_item.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                              user_item.role === 'mod' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user_item.role.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => banUser(user_item.id)}
                            disabled={user_item.role === 'admin'}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Banir
                          </button>
                          <button
                            onClick={() => unbanUser(user_item.id)}
                            disabled={user_item.role === 'admin'}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Desbanir
                          </button>
                          <button
                            onClick={() => {
                              const newBalance = prompt('Novo saldo:', user_item.balance || '0');
                              if (newBalance !== null) {
                                updateUserBalance(user_item.id, newBalance);
                              }
                            }}
                            disabled={user_item.role === 'admin'}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Editar Saldo
                          </button>
                          <button
                            onClick={() => deleteUser(user_item.id)}
                            disabled={user_item.role === 'admin'}
                            className="px-3 py-1 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

                {/* Users Tab */}
            {adminActiveTab === 'users' && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    {Icons.user}
                    <span>Todos os Usuários</span>
                  </h3>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCreateUser(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center space-x-2"
                    >
                      {Icons.plus}
                      <span>Criar Usuário</span>
                    </button>
                    <button
                      onClick={() => {
                        console.log('🔄 Carregando usuários manualmente...');
                        loadAllUsers();
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Recarregar
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-gray-300">Nome</th>
                        <th className="text-left py-3 px-4 text-gray-300">Email</th>
                        <th className="text-left py-3 px-4 text-gray-300">Senha</th>
                        <th className="text-left py-3 px-4 text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 text-gray-300">Saldo</th>
                        <th className="text-left py-3 px-4 text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 text-gray-300">Data</th>
                        <th className="text-left py-3 px-4 text-gray-300">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminData.allUsers.map((user_item) => (
                        <tr key={user_item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-3 px-4 text-white">{user_item.name}</td>
                          <td className="py-3 px-4 text-gray-300">{user_item.email}</td>
                          <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                            <span className="bg-gray-800 p-1 rounded">***oculta***</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user_item.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                              user_item.role === 'mod' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user_item.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-green-400">R$ {user_item.balance.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user_item.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user_item.status === 'active' ? 'Ativo' : 'Banido'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{user_item.created_at}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <button
                                onClick={() => banUser(user_item.id)}
                                disabled={user_item.role === 'admin' || user_item.status === 'banned'}
                                className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Banir
                              </button>
                              <button
                                onClick={() => unbanUser(user_item.id)}
                                disabled={user_item.role === 'admin' || user_item.status === 'active'}
                                className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Desbanir
                              </button>
                              <button
                                onClick={() => {
                                  const newBalance = prompt('Novo saldo:', user_item.balance || '0');
                                  if (newBalance !== null) {
                                    updateUserBalance(user_item.id, newBalance);
                                  }
                                }}
                                disabled={user_item.role === 'admin'}
                                className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deleteUser(user_item.id)}
                                disabled={user_item.role === 'admin'}
                                className="px-2 py-1 bg-red-600/20 text-red-300 rounded text-xs hover:bg-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Del
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {adminData.allUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      Carregando usuários... Clique em "Recarregar" se não aparecer nada.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Giftcards Tab */}
            {adminActiveTab === 'giftcards' && (
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  {Icons.gift}
                  <span>Gerenciar Giftcards</span>
                </h3>

                {/* Ações Administrativas */}
                <div className="mb-6 p-4 bg-red-900/20 rounded-xl border border-red-500/20">
                  <h4 className="text-red-300 font-bold mb-4">⚠️ Ações Perigosas</h4>
                  <div className="flex space-x-3">
                    <button
                      onClick={resetAllBalances}
                      className="px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-all font-medium"
                    >
                      💰 Resetar Todos os Saldos
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Esta ação irá zerar o saldo de todos os usuários permanentemente.
                  </p>
                </div>

                {/* Criar Giftcard */}
                <div className="mb-6 p-4 bg-yellow-900/20 rounded-xl border border-yellow-500/20">
                  <h4 className="text-yellow-300 font-bold mb-4">Criar Novo Giftcard</h4>
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Valor (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="0,00"
                        value={giftcardData.amount}
                        onChange={(e) => setGiftcardData(prev => ({ ...prev, amount: e.target.value }))}
                        className="futuristic-input-sm"
                      />
                    </div>
                    <button
                      onClick={generateGiftcard}
                      disabled={!giftcardData.amount || parseFloat(giftcardData.amount) < 1}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
                    >
                      {Icons.gift}
                      <span>Criar</span>
                    </button>
                  </div>
                </div>

                {/* Lista de Giftcards */}
                <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                  {adminData.giftcards.length === 0 && (
                    <p className="text-gray-400 text-center py-4">Nenhum giftcard criado ainda</p>
                  )}
                  
                  {adminData.giftcards.map((giftcard) => (
                    <div key={giftcard.id} className="p-4 bg-black/30 rounded-xl border border-yellow-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono text-sm text-white">{giftcard.code}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          giftcard.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {giftcard.status === 'active' ? 'Ativo' : 'Usado'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-400">R$ {giftcard.amount.toFixed(2)}</span>
                        <span className="text-gray-400">Por: {giftcard.created_by}</span>
                      </div>
                      {giftcard.redeemed_by && (
                        <div className="text-xs text-gray-500 mt-1">
                          Usado por: {giftcard.redeemed_by}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Wallet Section */}
        {currentView === 'wallet' && user && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                {Icons.wallet}
                <span>Carteira</span>
              </h1>
              <p className="text-gray-400">Gerencie seu saldo e histórico de transações</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Card de Saldo */}
              <div className="lg:col-span-1 bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    {Icons.wallet}
                  </div>
                  <h3 className="text-xl font-bold text-green-300 mb-2">Saldo Disponível</h3>
                  <p className="text-4xl font-bold text-white mb-4">R$ {walletData.balance.toFixed(2)}</p>
                  <button
                    onClick={() => navigateTo('add-balance')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 mb-3"
                  >
                    {Icons.add}
                    <span>Adicionar Saldo</span>
                  </button>
                  
                  {/* Botão para resgatar giftcard */}
                  <div className="bg-black/30 p-4 rounded-xl border border-green-500/20">
                    <p className="text-green-400 text-sm mb-3 flex items-center space-x-2">
                      {Icons.gift}
                      <span>Resgatar Giftcard</span>
                    </p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 bg-black/50 border border-green-500/30 rounded-lg text-white text-sm font-mono"
                        maxLength="19"
                      />
                      <button
                        onClick={redeemGiftcard}
                        disabled={!redeemCode.trim()}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all text-sm"
                      >
                        Resgatar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Recarregado</p>
                      <p className="text-2xl font-bold text-blue-400">R$ 0,00</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      {Icons.trending_up}
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Bônus Referência</p>
                      <p className="text-2xl font-bold text-purple-400">R$ {user?.referral_earnings?.toFixed(2) || '0,00'}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      {Icons.user}
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Gasto</p>
                      <p className="text-2xl font-bold text-yellow-400">R$ 0,00</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      {Icons.credit_card}
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Economia</p>
                      <p className="text-2xl font-bold text-cyan-400">0%</p>
                    </div>
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      {Icons.chart}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico de Transações */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                {Icons.history}
                <span>Histórico de Transações</span>
              </h3>

              <div className="space-y-4">
                {walletData.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-purple-500/10 hover:border-purple-500/30 transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                        transaction.type === 'referral' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.type === 'deposit' ? Icons.add :
                         transaction.type === 'referral' ? Icons.user :
                         Icons.credit_card}
                      </div>
                      <div>
                        <p className="text-white font-medium">{transaction.description}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.date).toLocaleDateString('pt-BR')} • {transaction.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        transaction.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {transaction.status === 'completed' ? 'Concluído' :
                         transaction.status === 'pending' ? 'Pendente' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sistema de Referência */}
            <div className="mt-8 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                {Icons.user}
                <span>Sistema de Referência</span>
                <span className="ml-2 text-sm bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                  R$ 0,50 por referência
                </span>
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Meu Código de Referência */}
                <div className="bg-black/30 rounded-xl p-4 border border-purple-500/10">
                  <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                    {Icons.share}
                    <span>Meu Código de Referência</span>
                  </h4>
                  <div className="bg-black/50 rounded-lg p-3 border border-purple-500/20">
                    <p className="text-purple-400 font-mono text-lg text-center">
                      {referralData.referral_code || user?.referral_code || 'Carregando...'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const code = referralData.referral_code || user?.referral_code;
                      if (code) {
                        navigator.clipboard.writeText(code);
                        showNotification('✅ Código copiado!', 'success');
                      }
                    }}
                    className="w-full mt-3 bg-purple-500/20 text-purple-400 py-2 rounded-lg hover:bg-purple-500/30 transition-all flex items-center justify-center space-x-2"
                  >
                    {Icons.copy}
                    <span>Copiar Código</span>
                  </button>
                </div>

                {/* Estatísticas de Referência */}
                <div className="space-y-4">
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 text-sm">Pessoas Registradas</p>
                        <p className="text-2xl font-bold text-white">{referralData.total_referrals}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        {Icons.user_add}
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-400 text-sm">Ganhos por Referência</p>
                        <p className="text-2xl font-bold text-white">R$ {referralData.user_referral_earnings?.toFixed(2) || '0,00'}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        {Icons.reward}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Referenciados */}
              {referralData.referrals && referralData.referrals.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
                    {Icons.users}
                    <span>Pessoas que você indicou ({referralData.total_referrals})</span>
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {referralData.referrals.map((referral, index) => (
                      <div
                        key={referral.id || index}
                        className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-purple-500/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 text-sm">
                            {referral.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{referral.name}</p>
                            <p className="text-gray-400 text-xs">Registrou em {referral.created_at}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-sm">+R$ 0,50</p>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                            Ativo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Balance Section */}
        {currentView === 'add-balance' && user && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {Icons.add}
                </div>
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Adicionar Saldo
                </h2>
                <p className="text-gray-400">Recarregue sua carteira para usar todos os recursos</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Formulário */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Valor da Recarga
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="0,00"
                        value={addBalanceData.amount}
                        onChange={(e) => setAddBalanceData(prev => ({ ...prev, amount: e.target.value }))}
                        className="futuristic-input pl-12"
                      />
                    </div>
                  </div>

                  {/* Valores sugeridos */}
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-3">Valores Sugeridos</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 200].map(value => (
                        <button
                          key={value}
                          onClick={() => setAddBalanceData(prev => ({ ...prev, amount: value.toString() }))}
                          className="p-3 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-800/20 transition-all text-sm font-medium"
                        >
                          R$ {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Método de pagamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Método de Pagamento
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-4 border border-green-500/30 rounded-lg hover:bg-green-800/10 transition-all cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          value="pix"
                          checked={addBalanceData.method === 'pix'}
                          onChange={(e) => setAddBalanceData(prev => ({ ...prev, method: e.target.value }))}
                          className="mr-3"
                        />
                        <div className="flex items-center space-x-3">
                          {Icons.pix}
                          <div>
                            <p className="text-white font-medium">PIX</p>
                            <p className="text-gray-400 text-sm">Aprovação instantânea</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={processAddBalance}
                    disabled={!addBalanceData.amount || parseFloat(addBalanceData.amount) < 1}
                    className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                  >
                    {Icons.pix}
                    <span>Prosseguir com PIX</span>
                  </button>
                </div>

                {/* Informações */}
                <div className="space-y-6">
                  <div className="bg-green-900/20 p-6 rounded-2xl border border-green-500/20">
                    <h3 className="text-lg font-bold text-green-300 mb-4 flex items-center space-x-2">
                      {Icons.wallet}
                      <span>Saldo Atual</span>
                    </h3>
                    <p className="text-3xl font-bold text-white mb-2">R$ {walletData.balance.toFixed(2)}</p>
                    {addBalanceData.amount && parseFloat(addBalanceData.amount) > 0 && (
                      <p className="text-green-400">
                        Novo saldo: R$ {(walletData.balance + parseFloat(addBalanceData.amount)).toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/20">
                    <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center space-x-2">
                      {Icons.user}
                      <span>Sistema de Referência</span>
                    </h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Recargas de R$ 50,00 ou mais geram 10% de bônus para quem te indicou!
                    </p>
                    {addBalanceData.amount && parseFloat(addBalanceData.amount) >= 50 && (
                      <div className="bg-purple-800/30 p-3 rounded-lg">
                        <p className="text-purple-300 text-sm">
                          🎉 Seu indicador ganhará: R$ {(parseFloat(addBalanceData.amount) * 0.10).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20">
                    <h3 className="text-lg font-bold text-blue-300 mb-4">Vantagens</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>PIX instantâneo e seguro</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>Sem taxas adicionais</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>Disponível 24/7</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="text-green-400">✓</span>
                        <span>Bônus para indicadores</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => navigateTo('wallet')}
                    className="w-full p-3 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-800/30 transition-all"
                  >
                    Voltar para Carteira
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        {currentView === 'dashboard' && user && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                {Icons.dashboard}
                <span>Dashboard</span>
              </h1>
              <p className="text-gray-400">Gerencie seus bots e acompanhe suas estatísticas em tempo real</p>
            </div>

            {/* Cards de estatísticas animados */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400 transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total de Bots</p>
                    <p className="text-3xl font-bold text-white counter" data-target={dashboardData.totalBots}>0</p>
                    <p className="text-xs text-green-400 flex items-center mt-1">
                      {Icons.trending_up} +12% este mês
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    {Icons.robot}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-400 transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Bots Ativos</p>
                    <p className="text-3xl font-bold text-green-400 counter" data-target={dashboardData.activeBots}>0</p>
                    <p className="text-xs text-green-400 flex items-center mt-1">
                      {Icons.trending_up} +8% este mês
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    {Icons.lightning}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-400 transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ganhos Totais</p>
                    <p className="text-3xl font-bold text-cyan-400">R$ {dashboardData.totalEarnings.toFixed(2)}</p>
                    <p className="text-xs text-green-400 flex items-center mt-1">
                      {Icons.trending_up} +25% este mês
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    {Icons.wallet}
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-400 transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Ref. Ganhas</p>
                    <p className="text-3xl font-bold text-yellow-400">R$ {dashboardData.referralEarnings.toFixed(2)}</p>
                    <p className="text-xs text-green-400 flex items-center mt-1">
                      {Icons.trending_up} +18% este mês
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    {Icons.user}
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico interativo e ações rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    {Icons.chart}
                    <span>Estatísticas Mensais</span>
                  </h3>
                  <div className="flex space-x-2">
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="w-3 h-3 bg-purple-500 rounded"></div>
                      <span className="text-gray-400">Vendas</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                      <span className="text-gray-400">Receita</span>
                    </div>
                  </div>
                </div>
                <InteractiveChart data={dashboardData.monthlyStats} />
              </div>

              <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  {Icons.lightning}
                  <span>Ações Rápidas</span>
                </h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => navigateTo('builder')}
                    className="w-full flex items-center space-x-3 p-4 bg-purple-500/20 rounded-xl hover:bg-purple-500/30 transition-all duration-300 hover:transform hover:scale-105 group"
                  >
                    {Icons.build}
                    <span className="text-white group-hover:text-purple-300">Criar Novo Bot</span>
                  </button>
                  <button 
                    onClick={() => navigateTo('orders')}
                    className="w-full flex items-center space-x-3 p-4 bg-cyan-500/20 rounded-xl hover:bg-cyan-500/30 transition-all duration-300 hover:transform hover:scale-105 group"
                  >
                    {Icons.orders}
                    <span className="text-white group-hover:text-cyan-300">Ver Pedidos</span>
                  </button>
                  <div className="p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                    <p className="text-green-400 text-sm mb-2 flex items-center space-x-2">
                      {Icons.user}
                      <span>Seu código de referência:</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-mono text-sm bg-black/30 px-3 py-1 rounded">{user.referral_code}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(user.referral_code);
                          showNotification('✅ Código copiado!', 'success');
                        }}
                        className="text-green-400 hover:text-green-300 text-sm"
                      >
                        Copiar
                      </button>
                    </div>
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
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                {Icons.orders}
                <span>Meus Pedidos</span>
              </h1>
              <p className="text-gray-400">Gerencie seus bots e pendências de pagamento</p>
            </div>

            {/* Tabs for Orders */}
            <div className="mb-8">
              <div className="flex space-x-1 bg-black/40 p-1 rounded-lg backdrop-blur-xl border border-purple-500/20">
                {[
                  { id: 'pending', label: 'Pendentes', icon: Icons.orders },
                  { id: 'completed', label: 'Completos', icon: Icons.package }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrdersActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-md transition-all ${
                      ordersActiveTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pending Orders Tab */}
            {ordersActiveTab === 'pending' && (
              <div className="grid gap-6">
                {userBots.filter(bot => bot.status === 'pending_payment' || bot.status === 'draft').map((bot) => (
                  <div key={bot.id} className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-400 transition-all duration-300">
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
                          bot.status === 'pending_payment' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {bot.status === 'pending_payment' ? 'Pendente Pagamento' : 'Rascunho'}
                        </span>
                        {bot.status === 'pending_payment' && (
                          <button 
                            onClick={() => {
                              setBotConfig(bot);
                              navigateTo('payment');
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all flex items-center space-x-2"
                          >
                            {Icons.credit_card}
                            <span>Pagar Agora</span>
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setBotConfig(bot);
                            navigateTo('builder');
                          }}
                          className="px-4 py-2 border border-purple-500/50 text-purple-300 rounded-lg hover:bg-purple-800/30 transition-all flex items-center space-x-2"
                        >
                          {Icons.build}
                          <span>Editar</span>
                        </button>
                        <button 
                          onClick={() => deleteBot(bot.id, bot.bot_name)}
                          className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-800/30 transition-all flex items-center space-x-2"
                          title="Deletar bot permanentemente"
                        >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                            <path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6Z"/>
                          </svg>
                          <span>Deletar</span>
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
                        <p className="text-gray-400 text-sm">Produtos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{bot.ai_enabled ? 'Sim' : 'Não'}</p>
                        <p className="text-gray-400 text-sm">IA Ativa</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userBots.filter(bot => bot.status === 'pending_payment' || bot.status === 'draft').length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      {Icons.orders}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Nenhum pedido pendente</h3>
                    <p className="text-gray-400 mb-8">Todos os seus bots estão ativos ou você ainda não criou nenhum</p>
                    <button 
                      onClick={() => navigateTo('builder')}
                      className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transition-all flex items-center space-x-3 mx-auto"
                    >
                      {Icons.build}
                      <span>Criar Novo Bot</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Completed Orders Tab */}
            {ordersActiveTab === 'completed' && (
              <div className="grid gap-6">
                {userBots.filter(bot => bot.status === 'active').map((bot) => (
                  <div key={bot.id} className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20 hover:border-green-400 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          {Icons.robot}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{bot.bot_name}</h3>
                          <p className="text-gray-400">{bot.business_info.name}</p>
                          <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium mt-2">
                            ✅ Bot Ativo
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => downloadBot(bot)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center space-x-2"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          <span>Download Bot</span>
                        </button>
                        <button 
                          onClick={() => {
                            setBotConfig(bot);
                            navigateTo('builder');
                          }}
                          className="px-4 py-2 border border-green-500/50 text-green-300 rounded-lg hover:bg-green-800/30 transition-all flex items-center space-x-2"
                        >
                          {Icons.build}
                          <span>Editar</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-400">{bot.buttons.length}</p>
                        <p className="text-gray-400 text-sm">Botões</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-cyan-400">{bot.products.length}</p>
                        <p className="text-gray-400 text-sm">Produtos</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">{bot.ai_enabled ? 'Sim' : 'Não'}</p>
                        <p className="text-gray-400 text-sm">IA Ativa</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-400">Python</p>
                        <p className="text-gray-400 text-sm">Linguagem</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/20">
                      <h4 className="text-sm font-medium text-green-400 mb-2">📦 Conteúdo do Download:</h4>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div>• <strong>bot.py</strong> - Código principal do bot em Python</div>
                        <div>• <strong>config.json</strong> - Configurações personalizadas</div>
                        <div>• <strong>README.md</strong> - Instruções completas de instalação</div>
                        <div>• <strong>requirements.txt</strong> - Dependências do Python</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userBots.filter(bot => bot.status === 'active').length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      {Icons.package}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Nenhum bot ativo ainda</h3>
                    <p className="text-gray-400 mb-8">Complete o pagamento de seus bots para poder baixá-los</p>
                    <button 
                      onClick={() => setOrdersActiveTab('pending')}
                      className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center space-x-3 mx-auto"
                    >
                      {Icons.orders}
                      <span>Ver Pedidos Pendentes</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Builder Section - Funciona em modo demo também */}
        {currentView === 'builder' && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 p-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
                  {Icons.build}
                  <span>Construtor de Bot Avançado</span>
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="bg-purple-900/20 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-purple-300 flex items-center space-x-3">
                      {Icons.settings}
                      <span>Configurações Básicas</span>
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
                        <label htmlFor="ai_enabled" className="text-gray-300 flex items-center space-x-2">
                          {Icons.robot}
                          <span>Ativar respostas inteligentes com IA Gemini 2.0</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/20 backdrop-blur-sm p-8 rounded-2xl border border-green-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-green-300 flex items-center space-x-3">
                      {Icons.chat}
                      <span>Botões Personalizados</span>
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
                        className="futuristic-btn-green w-full flex items-center justify-center space-x-2"
                      >
                        {Icons.chat}
                        <span>Adicionar Botão</span>
                      </button>
                    </div>
                    
                    <div className="mt-6 space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                      {botConfig.buttons.map((button, index) => (
                        <div key={button.id} className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-green-500/20">
                          <div className="flex items-center space-x-3">
                            {Icons.chat}
                            <div>
                              <span className="font-medium text-white">{index + 1}. {button.text}</span>
                              <span className="text-sm text-gray-400 ml-3">({button.action})</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeButton(button.id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-blue-900/20 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30">
                    <h3 className="text-2xl font-bold mb-6 text-blue-300 flex items-center space-x-3">
                      {Icons.package}
                      <span>Gerenciar Produtos</span>
                    </h3>
                    
                    <div className="mb-8 p-6 bg-black/30 rounded-xl border border-blue-500/20">
                      <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center space-x-2">
                        {Icons.package}
                        <span>Importar produtos via CSV</span>
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
                        className="futuristic-btn-blue w-full flex items-center justify-center space-x-2"
                      >
                        {Icons.package}
                        <span>Adicionar Produto</span>
                      </button>
                    </div>
                    
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
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={saveBotAndGoToPayment}
                    className="save-btn futuristic-btn-main w-full py-6 text-xl flex items-center justify-center space-x-3"
                  >
                    {Icons.package}
                    <span>Salvar e Prosseguir para Pagamento</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Simulator Section - Funciona em modo demo também */}
        {currentView === 'simulator' && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white relative">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      {Icons.phone}
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
                <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}>
                    {chatSession.messages.length === 0 && (
                      <div className="text-center text-gray-500 mt-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                          {Icons.chat}
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
                
                <div className="w-80 bg-black/60 backdrop-blur-sm p-6 border-l border-purple-500/20">
                  <h3 className="font-bold text-white mb-6 flex items-center text-lg space-x-2">
                    {Icons.robot}
                    <span>Informações do Bot</span>
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
                      <h4 className="font-medium text-purple-300 mb-4 flex items-center space-x-2">
                        {Icons.chat}
                        <span>Botões Disponíveis:</span>
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                        {botConfig.buttons.map((button, index) => (
                          <div key={button.id} className="text-xs bg-black/40 p-3 rounded-lg border border-purple-500/20 flex items-center space-x-2">
                            {Icons.chat}
                            <div>
                              <strong className="text-white">{index + 1}.</strong>
                              <span className="text-gray-300 ml-2">{button.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setChatSession({ session_id: '', messages: [] })}
                    className="w-full mt-8 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium flex items-center justify-center space-x-2"
                  >
                    {Icons.settings}
                    <span>Limpar Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Section */}
        {currentView === 'payment' && user && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center space-x-3">
                  {Icons.credit_card}
                  <span>Finalizar Pagamento</span>
                </h2>
                <p className="text-gray-400">Complete seu pedido para ativar seu bot</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-purple-900/20 p-6 rounded-2xl border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    {Icons.package}
                    <span>Resumo do Pedido</span>
                  </h3>
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
                      <span className="text-cyan-400">R$ 39,90</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/20 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Seu saldo disponível:</span>
                      <span className="text-cyan-400 font-bold text-lg">R$ {walletData.balance.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={payWithBalance}
                    className={`w-full p-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${
                      walletData.balance >= 39.90 
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-600 hover:to-cyan-700' 
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={walletData.balance < 39.90}
                  >
                    {Icons.wallet}
                    <span>{walletData.balance >= 39.90 ? 'Pagar com Saldo' : 'Saldo Insuficiente'}</span>
                  </button>
                  
                  <div className="flex items-center space-x-3 my-4">
                    <div className="flex-1 h-px bg-purple-500/20"></div>
                    <span className="text-gray-400 text-sm">ou pague com</span>
                    <div className="flex-1 h-px bg-purple-500/20"></div>
                  </div>
                  
                  <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2">
                    {Icons.credit_card}
                    <span>Pagar com PIX</span>
                  </button>
                  <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2">
                    {Icons.credit_card}
                    <span>Cartão de Crédito</span>
                  </button>
                  <button 
                    onClick={() => navigateTo('orders')}
                    className="w-full p-4 border border-purple-500/50 text-purple-300 rounded-xl font-bold hover:bg-purple-800/30 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modais */}
      {showLogin && <LoginModal />}
      {showRegister && <RegisterModal />}
      {showPixPayment && <PixPaymentModal />}
      {showCreateUser && <CreateUserModal />}
    </div>
  );
}

export default App;