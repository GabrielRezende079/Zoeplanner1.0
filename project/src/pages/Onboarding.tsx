import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { ArrowRight, Check, CheckCircle } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    difficulty: '',
    tithingPractice: null as boolean | null,
    mainGoal: '',
  });
  
  const difficultyOptions = [
    { value: 'Dívidas', label: 'Dívidas' },
    { value: 'Falta de planejamento', label: 'Falta de planejamento' },
    { value: 'Gastos impulsivos', label: 'Gastos impulsivos' },
    { value: 'Pouca renda', label: 'Pouca renda' },
    { value: 'Investimentos', label: 'Investimentos' }
  ];

  const goalOptions = [
    { value: 'Quitar dívidas', label: 'Quitar dívidas' },
    { value: 'Poupar', label: 'Poupar' },
    { value: 'Investir', label: 'Investir' },
    { value: 'Viagem missionária', label: 'Viagem missionária' },
    { value: 'Comprar casa própria', label: 'Comprar casa própria' },
    { value: 'Ajudar outros', label: 'Ajudar outros' },
    { value: 'Educação', label: 'Educação' }
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleRadioChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNext = () => {
    setStep((prev) => prev + 1);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during signup';
      
      // Check if the error is due to an existing user
      if (errorMessage.toLowerCase().includes('user already registered') || 
          errorMessage.toLowerCase().includes('user_already_exists')) {
        setError('Este e-mail já está cadastrado. Por favor, faça login.');
        // Optionally redirect to login page after a short delay
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Ocorreu um erro durante o cadastro. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                s === step
                  ? 'bg-olive-600 text-white'
                  : s < step
                  ? 'bg-olive-100 text-olive-600'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {s < step ? <Check className="h-5 w-5" /> : s}
            </div>
          ))}
        </div>
        <div className="h-1 w-full bg-gray-200 rounded">
          <div
            className="h-1 bg-olive-600 rounded"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {step === 1 && (
        <div className="slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Crie sua conta</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Seu nome"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Crie uma senha forte"
                required
              />
            </div>
            
            <button
              type="button"
              onClick={handleNext}
              disabled={!formData.name || !formData.email || !formData.password}
              className="btn btn-primary w-full mt-4"
            >
              Próximo <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Qual sua maior dificuldade financeira?</h2>
          
          <div className="mb-6">
            <CustomSelect
              value={formData.difficulty}
              onChange={(value) => handleSelectChange('difficulty', value)}
              options={difficultyOptions}
              placeholder="Selecione sua maior dificuldade"
            />
          </div>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={!formData.difficulty}
            className="btn btn-primary w-full mt-6"
          >
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Você já separa dízimos e ofertas?</h2>
          
          <div className="flex space-x-4 mb-8">
            <button
              type="button"
              onClick={() => handleRadioChange('tithingPractice', true)}
              className={`flex-1 py-4 px-6 rounded-lg border transition-all ${
                formData.tithingPractice === true
                  ? 'border-olive-600 bg-olive-50 ring-2 ring-olive-500'
                  : 'border-gray-300 hover:border-olive-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <CheckCircle className={`h-8 w-8 mb-2 ${
                  formData.tithingPractice === true ? 'text-olive-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">Sim</span>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleRadioChange('tithingPractice', false)}
              className={`flex-1 py-4 px-6 rounded-lg border transition-all ${
                formData.tithingPractice === false
                  ? 'border-olive-600 bg-olive-50 ring-2 ring-olive-500'
                  : 'border-gray-300 hover:border-olive-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <CheckCircle className={`h-8 w-8 mb-2 ${
                  formData.tithingPractice === false ? 'text-olive-600' : 'text-gray-400'
                }`} />
                <span className="font-medium">Não, mas quero começar</span>
              </div>
            </button>
          </div>
          
          <div className="bg-gold-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gold-800 italic">
              "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa; 
              e provai-me nisto, diz o Senhor dos Exércitos, se eu não vos abrir as janelas do céu 
              e não derramar sobre vós uma bênção tal, que dela vos advenha a maior abastança." 
              (Malaquias 3:10)
            </p>
          </div>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={formData.tithingPractice === null}
            className="btn btn-primary w-full"
          >
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="slide-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Qual seu maior objetivo atual?</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione seu objetivo principal
            </label>
            <CustomSelect
              value={formData.mainGoal}
              onChange={(value) => handleSelectChange('mainGoal', value)}
              options={goalOptions}
              placeholder="Selecione um objetivo"
            />
          </div>
          
          <div className="mt-8 p-4 bg-olive-50 rounded-lg mb-6">
            <p className="text-sm text-olive-800">
              Com base em suas respostas, criaremos um plano personalizado para ajudá-lo 
              a alcançar seus objetivos financeiros de acordo com princípios bíblicos.
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!formData.mainGoal || isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? 'Processando...' : 'Concluir e começar'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Onboarding;