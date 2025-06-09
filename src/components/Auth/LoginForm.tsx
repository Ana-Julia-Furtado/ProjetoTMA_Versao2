import React, { useState } from 'react';
import { User, Hash, Leaf } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { User as UserType } from '../../types/game';

export const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    ra: ''
  });
  const { setUser, setLoading, isLoading } = useGameStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.ra.trim()) {
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newUser: UserType = {
        id: formData.ra, // Using RA as unique ID
        name: formData.name.trim(),
        email: `${formData.ra}@student.edu`, // Generate email from RA
        level: 1,
        totalScore: 0,
        gamesPlayed: 0,
        correctAnswers: 0
      };
      
      setUser(newUser);
      setLoading(false);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-nature flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="bg-gradient-nature p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">EcoTrivia</h2>
            <p className="text-gray-600 mt-2">
              Entre com seu nome e RA para começar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RA (Registro Acadêmico)
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="ra"
                  value={formData.ra}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Digite seu RA"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.ra.trim()}
              className="w-full bg-gradient-nature text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar no Jogo'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              🌱 Aprenda sobre sustentabilidade enquanto se diverte!
            </p>
          </div>

          {/* Info section */}
          <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Como jogar:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Responda perguntas sobre meio ambiente</li>
              <li>• Compete com seus amigos em tempo real</li>
              <li>• Ganhe pontos e suba de nível</li>
              <li>• Aprenda sobre sustentabilidade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};