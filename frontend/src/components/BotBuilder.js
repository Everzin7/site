import React, { useState } from 'react';
import Icons from './Icons';

const BotBuilder = () => {
  const [botName, setBotName] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [autoReply, setAutoReply] = useState(false);
  const [commands, setCommands] = useState([]);
  const [newCommand, setNewCommand] = useState({ trigger: '', response: '' });

  const addCommand = () => {
    if (newCommand.trigger && newCommand.response) {
      setCommands([...commands, { ...newCommand, id: Date.now() }]);
      setNewCommand({ trigger: '', response: '' });
    }
  };

  const removeCommand = (id) => {
    setCommands(commands.filter(cmd => cmd.id !== id));
  };

  const saveBot = () => {
    const botConfig = {
      name: botName,
      welcomeMessage,
      autoReply,
      commands,
      createdAt: new Date().toISOString()
    };
    
    console.log('Salvando configuração do bot:', botConfig);
    alert('Bot salvo com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="text-blue-400">
          {Icons.build}
        </div>
        <h2 className="text-3xl font-bold text-white">Construtor de Bot</h2>
      </div>

      {/* Configurações Básicas */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Configurações Básicas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-2">Nome do Bot</label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Digite o nome do seu bot"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Resposta Automática</label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={autoReply}
                onChange={(e) => setAutoReply(e.target.checked)}
                className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-gray-300">Ativar respostas automáticas</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-300 mb-2">Mensagem de Boas-vindas</label>
          <textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none h-24"
            placeholder="Digite a mensagem de boas-vindas do seu bot"
          />
        </div>
      </div>

      {/* Comandos */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4">Comandos Personalizados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-300 mb-2">Palavra-chave</label>
            <input
              type="text"
              value={newCommand.trigger}
              onChange={(e) => setNewCommand({...newCommand, trigger: e.target.value})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Ex: menu, preços, contato"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Resposta</label>
            <input
              type="text"
              value={newCommand.response}
              onChange={(e) => setNewCommand({...newCommand, response: e.target.value})}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              placeholder="Digite a resposta para esta palavra-chave"
            />
          </div>
        </div>
        
        <button
          onClick={addCommand}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>{Icons.plus}</span>
          <span>Adicionar Comando</span>
        </button>

        {/* Lista de Comandos */}
        {commands.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-3">Comandos Criados</h4>
            <div className="space-y-3">
              {commands.map((command) => (
                <div key={command.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-blue-400 font-semibold">/{command.trigger}</span>
                    <p className="text-gray-300">{command.response}</p>
                  </div>
                  <button
                    onClick={() => removeCommand(command.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="flex justify-end space-x-4">
        <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
          Cancelar
        </button>
        <button
          onClick={saveBot}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Salvar Bot
        </button>
      </div>
    </div>
  );
};

export default BotBuilder;
