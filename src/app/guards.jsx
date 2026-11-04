import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DeviceProvider } from '../context/DeviceContext';

// Rutas de login/registro: si ya hay sesión se manda al inicio.
export function PublicOnly() {
  const { session } = useAuth();
  return session ? <Navigate to="/inicio" replace /> : <Outlet />;
}

// Rutas privadas: sin sesión se manda a /login. DeviceProvider se reinicia al
// cambiar de usuario o de sucursal (misma clave que usaba AppNavigator en el móvil).
export function RequireAuth() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  return <DeviceProvider key={`${session.user.id}:${session.user.branch_id || 'none'}`}><Outlet /></DeviceProvider>;
}

// Rutas por permiso: <RequireRole allow={canManage} />
export function RequireRole({ allow }) {
  const { user } = useAuth();
  return allow(user) ? <Outlet /> : <Navigate to="/inicio" replace />;
}
