import { createBrowserRouter, Navigate } from 'react-router-dom';
import { canCreateBranch, canManage } from '../utils/validation';
import { PublicOnly, RequireAuth, RequireRole } from './guards';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Recovery from '../pages/auth/Recovery';
import Home from '../pages/home/Home';
import Alerts from '../pages/alerts/Alerts';
import Devices from '../pages/devices/Devices';
import DeviceDetail from '../pages/devices/DeviceDetail';
import AddDevice from '../pages/devices/AddDevice';
import Placeholder from '../pages/shared/Placeholder';

const page = (title, phase, description) => <Placeholder title={title} phase={phase} description={description} />;

export const router = createBrowserRouter([
  { element: <PublicOnly />, children: [{ element: <AuthLayout />, children: [
    { path: '/login', element: <Login /> },
    { path: '/registro', element: <Register /> },
    { path: '/recuperar', element: <Recovery /> },
  ] }] },

  { element: <RequireAuth />, children: [{ element: <DashboardLayout />, children: [
    { path: '/inicio', element: <Home /> },
    { path: '/alertas', element: <Alerts /> },
    { path: '/ajustes', element: page('Ajustes', 4, 'Perfil, notificaciones y seguridad.') },

    { element: <RequireRole allow={canManage} />, children: [
      { path: '/dispositivos', element: <Devices /> },
      { path: '/dispositivos/agregar', element: <AddDevice /> },
      { path: '/dispositivos/:deviceId', element: <DeviceDetail /> },
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
