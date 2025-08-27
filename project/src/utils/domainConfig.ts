// Domain configuration for the application
export const DOMAIN_CONFIG = {
  production: 'https://zoeplanner.com.br',
  development: 'http://localhost:5173',
  staging: 'https://zoeplanner-christian-ky16.bolt.host'
};

export const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') return DOMAIN_CONFIG.production;
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return DOMAIN_CONFIG.development;
  }
  
  if (hostname.includes('bolt.host')) {
    return DOMAIN_CONFIG.staging;
  }
  
  return DOMAIN_CONFIG.production;
};

export const getResetPasswordUrl = (): string => {
  const domain = getCurrentDomain();
  const url = `${domain}/reset-password`;
  console.log('URL de reset gerada:', url);
  return url;
};