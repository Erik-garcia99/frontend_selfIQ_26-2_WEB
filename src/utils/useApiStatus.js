import { useEffect, useState } from 'react';
import { apiRequest } from '../services/http';

// null = comprobando · true = backend responde · false = sin conexión / CORS
export function useApiStatus() {
  const [online, setOnline] = useState(null);
  useEffect(() => {
    let active = true;
    apiRequest('/health', { timeout: 8000 })
      .then(() => active && setOnline(true))
      .catch(() => active && setOnline(false));
    return () => { active = false; };
  }, []);
  return online;
}
