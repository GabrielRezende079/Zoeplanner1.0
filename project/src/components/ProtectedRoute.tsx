import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../stores/authStore';
import { useFinance } from '../stores/financeStore';
import { useBanks } from '../stores/banksStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const { loadUserData, isDataLoaded } = useFinance();
  const { loadBanksData, isDataLoaded: isBanksDataLoaded } = useBanks();
  
  useEffect(() => {
    if (isAuthenticated && (!isDataLoaded || !isBanksDataLoaded)) {
      loadUserData();
      loadBanksData();
    }
  }, [isAuthenticated, isDataLoaded, isBanksDataLoaded, loadUserData, loadBanksData]);
  
  // Aguarda a inicialização da autenticação
  if (!isInitialized) {
    return null; // Ou um componente de loading muito simples
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;