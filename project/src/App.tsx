import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Transactions from './pages/Transactions';
import Expenses from './pages/Expenses';
import Banks from './pages/Banks';
import Tithing from './pages/Tithing';
import Goals from './pages/Goals';
import Reports from './pages/Reports';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './stores/authStore';
import { supabase } from './lib/supabase'; // ajuste se o caminho for diferente

function App() {
  const { initializeAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializa a sessão via getSession()
    initializeAuth();

    // Fallback: escuta eventos de auth (como PASSWORD_RECOVERY)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // Redireciona para a tela de redefinição de senha
          navigate('/reset-password');
        }
      }
    );

    // Cleanup ao desmontar o componente
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initializeAuth, navigate]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Onboarding />} />
      </Route>
      
      {/* Reset password page - standalone layout */}
      <Route path="/reset-password" element={<ResetPassword />} />
      
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/banks" element={<Banks />} />
        <Route path="/tithing" element={<Tithing />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}

export default App;
