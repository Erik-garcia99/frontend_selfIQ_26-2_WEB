import { apiRequest } from './http';

const base = (branchId) => `/api/v1/branches/${encodeURIComponent(branchId)}`;

export const listInventory = (branchId, accessToken, search = '') =>
  apiRequest(`${base(branchId)}/inventory?search=${encodeURIComponent(search)}`, { accessToken });

export const getInventoryItem = (branchId, productId, accessToken) =>
  apiRequest(`${base(branchId)}/inventory/${encodeURIComponent(productId)}`, { accessToken });