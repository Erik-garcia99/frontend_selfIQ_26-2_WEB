import { apiRequest } from './http';

// Desbloqueo de caja: el backend verifica la contraseña y devuelve un token
// de corta duración que debe acompañar cada venta (X-POS-Unlock).
// La administración de vendedores NO vive aquí: se hace desde la app móvil.
export const unlockPos = (branchId, password, accessToken) =>
  apiRequest(`/api/v1/branches/${encodeURIComponent(branchId)}/pos/unlock`, {
    method: 'POST', body: { password }, accessToken,
  });
