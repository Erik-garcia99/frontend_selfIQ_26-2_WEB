import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getCurrentUser, login } from '../services/authService';
import { setUnauthorizedHandler } from '../services/http';

const AuthContext = createContext(null);
const STORAGE_KEY = 'selfiq.session';

// La sesión se guarda en sessionStorage: sobrevive a recargar la página y se
// borra al cerrar la pestaña. Todo va en try/catch por si el navegador lo bloquea.
function readSession() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    return stored?.access_token && stored?.user ? stored : null;
  } catch { return null; }
}
function writeSession(value) {
  try {
    if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* sin almacenamiento: la sesión vive solo en memoria */ }
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(readSession);
  const generation = useRef(0);
  const setSession = useCallback((next) => {
    setSessionState((old) => {
      const value = typeof next === 'function' ? next(old) : next;
      writeSession(value);
      return value;
    });
  }, []);
  const signOut = useCallback(() => { generation.current += 1; setSession(null); }, [setSession]);

  // Si el backend responde 401 en cualquier petición con token, se cierra la sesión.
  useEffect(() => { setUnauthorizedHandler(signOut); return () => setUnauthorizedHandler(null); }, [signOut]);

  // Al recargar con una sesión guardada, se confirma que el token siga vigente
  // y se refrescan los datos del usuario (un 401 dispara signOut solo).
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !session) return;
    restored.current = true;
    const current = generation.current;
    getCurrentUser(session.access_token)
      .then((user) => { if (current === generation.current) setSession((old) => old ? { ...old, user } : old); })
      .catch(() => {});
  }, [session, setSession]);

  const signIn = async (email, password) => {
    const ownGeneration = ++generation.current;
    const result = await login(email, password);
    if (ownGeneration === generation.current) setSession(result);
    return result;
  };
  const refreshUser = async () => {
    if (!session) return;
    const current = generation.current;
    const user = await getCurrentUser(session.access_token);
    if (current === generation.current) setSession((old) => old ? { ...old, user } : old);
    return user;
  };

  return <AuthContext.Provider value={{ session, user: session?.user, accessToken: session?.access_token, signIn, signOut, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
