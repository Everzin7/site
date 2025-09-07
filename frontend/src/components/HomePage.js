import React, { useState } from 'react';
import Icons from './Icons';

const HomePage = ({ onShowLogin, onShowRegister, onNavigate }) => {
  const [isAnimated, setIsAnimated] = useState(false);

  React.useEffect(() => {
    setIsAnimated(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background com efeitos */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-black/90" />
      </div>

      {/* Ícones flutuantes animados */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="floating-icon" style={{top: '10%', left: '10%', animation: 'float 6s ease-in-out infinite'}}>
          <div className="w-6 h-6 text-purple-400 opacity-60">{Icons.robot}</div>
        </div>
        <div className="floating-icon" style={{top: '20%', right: '15%', animation: 'float 8s ease-in-out infinite 1s'}}>
          <div className="w-4 h-4 text-cyan-400 opacity-50">{Icons.chat}</div>
        </div>
        <div className="floating-icon" style={{top: '60%', left: '5%', animation: 'float 7s ease-in-out infinite 2s'}}>
          <div className="w-7 h-7 text-purple-300 opacity-40">{Icons.lightning}</div>
        </div>
        <div className="floating-icon" style={{bottom: '20%', right: '10%', animation: 'float 9s ease-in-out infinite 0.5s'}}>
          <div className="w-5 h-5 text-cyan-300 opacity-60">{Icons.build}</div>
        </div>
        <div className="floating-icon" style={{bottom: '40%', left: '20%', animation: 'float 8s ease-in-out infinite 1.5s'}}>
          <div className="w-6 h-6 text-purple-500 opacity-50">{Icons.package}</div>
        </div>
        <div className="floating-icon" style={{top: '45%', right: '25%', animation: 'float 6s ease-in-out infinite 3s'}}>
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
              <button
                onClick={() => onNavigate('construtor')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-purple-300 hover:text-white hover:bg-purple-800/30 border border-purple-500/20"
              >
                <div className="w-4 h-4">{Icons.build}</div>
                <span>Construtor</span>
              </button>
              
              <button
                onClick={onShowLogin}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all"
              >
                Login
              </button>
              
              <button
                onClick={onShowRegister}
                className="px-4 py-2 border border-purple-500/50 text-purple-300 rounded-xl hover:bg-purple-800/30 transition-all"
              >
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-20">
        <div className="min-h-screen flex items-center justify-center relative">
          <div className={`text-center max-w-6xl mx-auto px-4 transition-all duration-1000 ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
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
                onClick={() => onNavigate('construtor')}
                className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 flex items-center justify-center space-x-3"
              >
                {Icons.build}
                <span>Começar Agora</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
              <button 
                onClick={() => onNavigate('simulador')}
                className="group px-10 py-5 bg-black/50 text-white rounded-2xl text-xl font-bold border-2 border-purple-500/50 hover:bg-purple-900/30 hover:border-purple-400 transform hover:scale-105 transition-all duration-300 backdrop-blur-sm flex items-center justify-center space-x-3"
              >
                {Icons.phone}
                <span>Ver Demo</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-gray-400">Bots Criados</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400 mb-2">99%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-gray-400">Suporte IA</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Recursos Avançados
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="group bg-black/20 backdrop-blur-xl p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-2xl text-white">{Icons.robot}</div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-purple-400 transition-colors">
                  IA Gemini 2.0
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Respostas inteligentes e contextuais com a mais avançada tecnologia de IA do Google
                </p>
              </div>
              
              <div className="group bg-black/20 backdrop-blur-xl p-8 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-2xl text-white">{Icons.package}</div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-cyan-400 transition-colors">
                  Catálogo Inteligente
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Upload de imagens, importação CSV e gerenciamento completo do seu inventário
                </p>
              </div>
              
              <div className="group bg-black/20 backdrop-blur-xl p-8 rounded-2xl border border-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-2xl text-white">{Icons.credit_card}</div>
                </div>
                <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-green-400 transition-colors">
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
        <div className="py-24 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-8 text-white">
              Pronto para revolucionar seu atendimento?
            </h2>
            <button 
              onClick={() => onNavigate('construtor')}
              className="px-12 py-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-2xl text-2xl font-bold hover:from-purple-600 hover:to-cyan-600 transform hover:scale-105 transition-all duration-300 shadow-2xl shadow-purple-500/50 flex items-center justify-center space-x-3 mx-auto"
            >
              <span>Criar Meu Bot Agora</span>
              {Icons.build}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
