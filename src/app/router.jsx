import { createBrowserRouter, Navigate } from 'react-router-dom';
import { canApprove, canCreateBranch, canManage, canUsePos } from '../utils/validation';
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
import Settings from '../pages/settings/Settings';
import ProfileTab from '../pages/settings/ProfileTab';
import NotificationsTab from '../pages/settings/NotificationsTab';
import SecurityTab from '../pages/settings/SecurityTab';
import CreateBranch from '../pages/admin/CreateBranch';
import Staff from '../pages/admin/Staff';
import ApproveUsers from '../pages/admin/ApproveUsers';
import Tokens from '../pages/admin/Tokens';
import People from '../pages/admin/People';
import PosLayout from '../pages/pos/PosLayout';
import Caja from '../pages/pos/Caja';
import Inventario from '../pages/pos/Inventario';
import Movimientos from '../pages/pos/Movimientos';
import Historial from '../pages/pos/Historial';
import Products from '../pages/products/Products';
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
    { path: '/ajustes', element: <Settings />, children: [
      { index: true, element: <Navigate to="perfil" replace /> },
      { path: 'perfil', element: <ProfileTab /> },
      { path: 'notificaciones', element: <NotificationsTab /> },
      { path: 'seguridad', element: <SecurityTab /> },
    ] },

    { element: <RequireRole allow={canManage} />, children: [
      { path: '/dispositivos', element: <Devices /> },
      { path: '/dispositivos/agregar', element: <AddDevice /> },
      { path: '/dispositivos/:deviceId', element: <DeviceDetail /> },
      { path: '/personal', element: <Staff /> },
      { path: '/personal/personas', element: <People /> },
      { path: '/personal/tokens', element: <Tokens /> },
    ] },
    { element: <RequireRole allow={canApprove} />, children: [
      { path: '/personal/aprobar', element: <ApproveUsers /> },
    ] },
    { element: <RequireRole allow={canUsePos} />, children: [
      { path: '/productos', element: <Products /> },
      { path: '/pos', element: <PosLayout />, children: [
        { index: true, element: <Caja /> },
        { path: 'inventario', element: <Inventario /> },
        { path: 'movimientos', element: <Movimientos /> },
        { path: 'historial', element: <Historial /> },
      ] },
    ] },
    { element: <RequireRole allow={canCreateBranch} />, children: [
      { path: '/sucursales/nueva', element: <CreateBranch /> },
    ] },
  ] }] },

  { path: '*', element: <Navigate to="/inicio" replace /> },
]);
