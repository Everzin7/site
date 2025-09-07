import React, { useState, useEffect } from 'react';
import Icons from './Icons';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState({});
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    balance: '0'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        alert('Usuário criado com sucesso!');
        setNewUser({ username: '', password: '', balance: '0' });
        setIsCreatingUser(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    }
  };

  const updateBalance = async (userId, newBalance) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/update-balance/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ balance: parseFloat(newBalance) })
      });

      if (response.ok) {
        alert('Saldo atualizado com sucesso!');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      alert('Erro ao atualizar saldo');
    }
  };

  const resetAllBalances = async () => {
    if (window.confirm('Tem certeza que deseja zerar o saldo de TODOS os usuários?')) {
      try {
        const response = await fetch('http://localhost:8000/admin/reset-all-balances', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          alert(`${result.updated_count} saldos foram zerados!`);
          fetchUsers();
        }
      } catch (error) {
        console.error('Erro ao resetar saldos:', error);
        alert('Erro ao resetar saldos');
      }
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleBalanceEdit = (userId) => {
    const newBalance = prompt('Digite o novo saldo:');
    if (newBalance !== null && !isNaN(newBalance)) {
      updateBalance(userId, newBalance);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-purple-400">
            {Icons.settings}
          </div>
          <h2 className="text-3xl font-bold text-white">Painel de Administração</h2>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCreatingUser(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>{Icons.plus}</span>
            <span>Criar Usuário</span>
          </button>
          
          <button
            onClick={resetAllBalances}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Zerar Todos os Saldos
          </button>
        </div>
      </div>

      {/* Formulário de Criação de Usuário */}
      {isCreatingUser && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Criar Novo Usuário</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Nome de Usuário</label>
              <input
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Digite o nome de usuário"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Senha</label>
              <input
                type="text"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Digite a senha"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Saldo Inicial</label>
              <input
                type="number"
                value={newUser.balance}
                onChange={(e) => setNewUser({...newUser, balance: e.target.value})}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setIsCreatingUser(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={createUser}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Criar Usuário
            </button>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="text-gray-400">
            {Icons.user}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            placeholder="Buscar usuários por nome ou ID..."
          />
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left p-4 text-gray-300">ID</th>
                <th className="text-left p-4 text-gray-300">Usuário</th>
                <th className="text-left p-4 text-gray-300">Senha</th>
                <th className="text-left p-4 text-gray-300">Saldo</th>
                <th className="text-left p-4 text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-750">
                  <td className="p-4 text-gray-400 text-sm">{user._id}</td>
                  <td className="p-4 text-white font-medium">{user.username}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-300">
                        {showPasswords[user._id] ? user.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user._id)}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {showPasswords[user._id] ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </td>
                  <td className="p-4 text-green-400 font-medium">
                    R$ {user.balance?.toFixed(2) || '0.00'}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleBalanceEdit(user._id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Editar Saldo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center p-8 text-gray-400">
            {searchTerm ? 'Nenhum usuário encontrado com esse termo de busca.' : 'Nenhum usuário encontrado.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
