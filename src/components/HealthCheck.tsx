import { useEffect } from 'react';

const HealthCheck = () => {
  useEffect(() => {
    // Si alguien accede a /health via navegador, mostrar la respuesta
    if (window.location.pathname === '/health') {
      document.body.innerHTML = 'OK';
      document.title = 'Health Check';
    }
  }, []);

  return null;
};

export default HealthCheck;
