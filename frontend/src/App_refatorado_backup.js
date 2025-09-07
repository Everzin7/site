import React, { useState, useEffect } from 'react';
import './App.css';
import Icons from './components/Icons';
import DashboardOverview from './components/DashboardOverview';
import BotBuilder from './components/BotBuilder';
import AdminPanel from './components/AdminPanel';
import HomePage from './components/HomePage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Verifica se o usuário está autenticado na inicialização
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setUser({ username: 'admin' });
      setCurrentPage('dashboard');
    }
  }, []);

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.access_token);
        setUser({ username: formData.username });
        setCurrentPage('dashboard');
      } else {
        const errorData = await response.json();
        setLoginError(errorData.detail || 'Erro no login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro de conexão');
    }
  };

  // Função de logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    setCurrentPage('home');
    setFormData({ username: '', password: '' });
  };

  // Navegação entre páginas
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Modal de Login
  const LoginModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            {Icons.robot}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Bot</h1>
          <p className="text-gray-400">Acesso Administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Usuário</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Digite sua senha"
              required
            />
          </div>

          {loginError && (
            <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            Entrar
          </button>
        </form>

        <button 
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );

  // Modal de Registro (placeholder)
  const RegisterModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            {Icons.user}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-gray-400">Cadastre-se para começar</p>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
            placeholder="Nome completo"
          />
          <input
            type="email"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
            placeholder="Email"
          />
          <input
            type="password"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
            placeholder="Senha"
          />

          <button
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold"
          >
            Criar Conta
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

  // Home Page para usuários não logados
  if (!user) {
    return (
      <>
        <HomePage 
          onShowLogin={() => setShowLogin(true)}
          onShowRegister={() => setShowRegister(true)}
          onNavigate={handleNavigation}
        />
        {showLogin && <LoginModal />}
        {showRegister && <RegisterModal />}
      </>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="text-blue-400">
                {Icons.robot}
              </div>
              <h1 className="text-2xl font-bold text-white">WhatsApp Bot Platform</h1>
            </div>

            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => handleNavigation('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'home' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{Icons.home}</span>
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNavigation('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{Icons.dashboard}</span>
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleNavigation('construtor')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'construtor' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{Icons.build}</span>
                <span>Construtor</span>
              </button>

              <button
                onClick={() => handleNavigation('admin')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'admin' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{Icons.settings}</span>
                <span>Admin</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Olá, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <HomePage 
            onShowLogin={() => setShowLogin(true)}
            onShowRegister={() => setShowRegister(true)}
            onNavigate={handleNavigation}
          />
        )}
        
        {currentPage === 'dashboard' && (
          <DashboardOverview onNavigate={handleNavigation} />
        )}
        
        {currentPage === 'construtor' && (
          <BotBuilder />
        )}
        
        {currentPage === 'admin' && (
          <AdminPanel />
        )}
      </main>
    </div>
  );
}

export default App;
