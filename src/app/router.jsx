import { createBrowserRouter, Navigate } from 'react-router-dom';
import { canCreateBranch, canManage } from '../utils/validation';
import { PublicOnly, RequireAuth, RequireRole } from './guards';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Recovery from '../pages/auth/Recovery';
import Placeholder from '../pages/shared/Placeholder';

const page = (title, phase, description) => <Placeholder title={title} phase={phase} description={description} />;

export const router = createBrowserRouter([
  { element: <PublicOnly />, children: [{ element: <AuthLayout />, children: [
    { path: '/login', element: <Login /> },
    { path: '/registro', element: <Register /> },
    { path: '/recuperar', element: <Recovery /> },
  ] }] },

  { element: <RequireAuth />, children: [{ element: <DashboardLayout />, children: [
    { path: '/inicio', element: page('Inicio', 3, 'Resumen de aforo, temperatura y accesos rápidos.') },
    { path: '/alertas', element: page('Alertas', 3, 'Alertas de tu sucursal.') },
    { path: '/ajustes', element: page('Ajustes', 4, 'Perfil, notificaciones y seguridad.') },

    { element: <RequireRole allow={canManage} />, children: [
      { path: '/dispositivos', element: page('Dispositivos', 6, 'Gateways y nodos de la sucursal.') },
      { path: '/dispositivos/agregar', element: page('Agregar dispositivo', 8, 'Asistente para registrar equipos.') },
      { path: '/dispositivos/:deviceId', element: page('Detalle de dispositivo', 7, 'Lecturas, edición y eliminación.') },
      { path: '/personal', element: page('Personal', 5, 'Administración de accesos.') },
      { path: '/personal/aprobar', element: page('Aprobar usuarios', 5, 'Cuentas pendientes de aprobación.') },
      { path: '/personal/tokens', element: page('Tokens de acceso', 5, 'Generar o reemplazar tokens.') },
    ] },
    { element: <RequireRole allow={canCreateBranch} />, children: [
      { path: '/sucursales/nueva', element: page('Crear sucursal', 5, 'Alta de una nueva sucursal.') },
    ] },
  ] }] },

  { path: '*', element: <Navigate to="/inicio" replace /> },
]);
