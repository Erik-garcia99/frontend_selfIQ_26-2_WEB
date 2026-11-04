import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { router } from './app/router';
import { configureDeviceAdapter } from './services/deviceService';
import { deviceAdapter } from './services/deviceAdapter';
import './styles/tokens.css';
import './styles/base.css';

configureDeviceAdapter(deviceAdapter);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
