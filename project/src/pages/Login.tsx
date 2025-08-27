import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Mail } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'recovery'>('login');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);
  
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    try {
      setIsLoading(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Credenciais inválidas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRecoveryMessage('');
    
    if (!recoveryEmail) {
      setError('Por favor, digite seu email');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recoveryEmail)) {
      setError('Por favor, digite um email válido');
      return;
    }
    
    try {
      setIsRecoveryLoading(true);
      
      console.log('Tentando enviar email de recuperação para:', recoveryEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        console.error('Erro detalhado do Supabase:', error);
        throw error;
      }
      
      setRecoveryMessage(
        'Se este email estiver cadastrado, você receberá um link para redefinir sua senha em alguns minutos. ' +
        'Verifique sua caixa de entrada e pasta de spam. O link será válido por 1 hora.'
      );
      setRecoveryEmail('');
    } catch (err) {
      console.error('Erro completo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      const errorCode = (err as any)?.code || 'unknown';
      
      // Handle specific Supabase errors
      if (errorCode === 'too_many_requests' || errorMessage.includes('rate_limit') || errorMessage.includes('too_many_requests')) {
        setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else if (errorCode === 'invalid_email' || errorMessage.includes('invalid_email')) {
        setError('Email inválido. Verifique o endereço digitado.');
      } else if (errorCode === 'email_not_confirmed') {
        setError('Este email não foi confirmado. Verifique sua caixa de entrada para confirmar sua conta primeiro.');
      } else if (errorCode === 'user_not_found') {
        // Don't reveal if user exists for security, but still show generic message
        setRecoveryMessage(
          'Se este email estiver cadastrado, você receberá um link para redefinir sua senha em alguns minutos. ' +
          'Verifique sua caixa de entrada e pasta de spam.'
        );
        setRecoveryEmail('');
      } else if (errorMessage.includes('SMTP') || errorMessage.includes('email')) {
        setError('Problema temporário no envio de emails. Tente novamente em alguns minutos ou entre em contato com o suporte.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('Problema de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(`Erro ao enviar email de recuperação: ${errorMessage}. Tente novamente em alguns minutos.`);
      }
    } finally {
      setIsRecoveryLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const switchToLogin = () => {
    setActiveTab('login');
    setError('');
    setRecoveryMessage('');
  };
  
  const switchToRecovery = () => {
    setActiveTab('recovery');
    setError('');
    setRecoveryMessage('');
  };
  
  return (
    <div className="fade-in">
      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={switchToLogin}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'login'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Entrar
        </button>
        <button
          onClick={switchToRecovery}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recovery'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Recuperar Senha
        </button>
      </div>

      {activeTab === 'login' ? (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bem-vindo de volta</h2>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-olive-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar na Minha Conta'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Ainda não tem uma conta?{' '}
              <Link to="/signup" className="text-olive-600 hover:text-olive-700 font-medium">
                Comece agora
              </Link>
            </p>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recuperar Senha</h2>
          
          <p className="text-gray-600 mb-6">
            Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
          </p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {recoveryMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
              {recoveryMessage}
            </div>
          )}
          
          {/* Debug info - remover em produção */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 text-xs">
              <strong>Debug Info:</strong><br/>
              Domain: {window.location.origin}<br/>
              Reset URL: {window.location.origin}/reset-password
            </div>
          )}
          
          <form onSubmit={handlePasswordRecovery}>
            <div className="mb-6">
              <label htmlFor="recoveryEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="recoveryEmail"
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Digite seu email cadastrado"
                  autoComplete="email"
                  disabled={isRecoveryLoading}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isRecoveryLoading || !recoveryEmail}
            >
              {isRecoveryLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Lembrou da sua senha?{' '}
              <button
                onClick={switchToLogin}
                className="text-olive-600 hover:text-olive-700 font-medium"
              >
                Voltar ao login
              </button>
            </p>
          </div>
          
          {recoveryMessage && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Próximos passos:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verifique sua caixa de entrada</li>
                <li>• Procure também na pasta de spam</li>
                <li>• Clique no link recebido para redefinir sua senha</li>
                <li>• O link expira em 1 hora por segurança</li>
              </ul>
            </div>
          )}
        </>
      )}
      
      <div className="mt-8 p-4 bg-olive-50 rounded-lg">
        <p className="text-olive-800 text-sm italic text-center">
          "Ser fiel no pouco é o primeiro passo para o muito."
        </p>
      </div>
    </div>
  );
};

export default Login;