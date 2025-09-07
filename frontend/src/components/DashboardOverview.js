import Icons from './Icons';

// Dashboard Cards
const DashboardCard = ({ title, description, icon, onClick, color = "blue" }) => (
  <div 
    className={`bg-gray-800 p-6 rounded-lg border-l-4 border-${color}-500 hover:bg-gray-700 transition-colors cursor-pointer transform hover:scale-105`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className={`text-${color}-400 mr-4`}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

// Dashboard Overview Component
const DashboardOverview = ({ onNavigate }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-white mb-8">Painel de Controle</h2>
    
    {/* Status Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg">
        <div className="flex items-center">
          <div className="text-white mr-4">
            {Icons.robot}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">5</h3>
            <p className="text-blue-100">Bots Ativos</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg">
        <div className="flex items-center">
          <div className="text-white mr-4">
            {Icons.chat}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">1,234</h3>
            <p className="text-green-100">Mensagens Hoje</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg">
        <div className="flex items-center">
          <div className="text-white mr-4">
            {Icons.user}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">89</h3>
            <p className="text-purple-100">Usuários Online</p>
          </div>
        </div>
      </div>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DashboardCard
        title="Construtor de Bot"
        description="Crie e personalize seu bot do WhatsApp"
        icon={Icons.build}
        onClick={() => onNavigate('construtor')}
        color="blue"
      />
      
      <DashboardCard
        title="Administração"
        description="Gerencie usuários e configurações do sistema"
        icon={Icons.settings}
        onClick={() => onNavigate('admin')}
        color="purple"
      />
      
      <DashboardCard
        title="Relatórios"
        description="Visualize estatísticas e relatórios detalhados"
        icon={Icons.package}
        onClick={() => onNavigate('relatorios')}
        color="green"
      />
      
      <DashboardCard
        title="Suporte"
        description="Central de ajuda e documentação"
        icon={Icons.phone}
        onClick={() => onNavigate('suporte')}
        color="orange"
      />
    </div>
  </div>
);

export default DashboardOverview;
