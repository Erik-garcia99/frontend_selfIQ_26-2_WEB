import { apiRequest } from './http';

const base = (branchId) => `/api/v1/branches/${encodeURIComponent(branchId)}`;

export const lookupProduct = (branchId, barcode, accessToken) =>
  apiRequest(`${base(branchId)}/products/lookup?barcode=${encodeURIComponent(barcode)}`, { accessToken });

export const searchProducts = (branchId, q, accessToken, limit) =>
  apiRequest(`${base(branchId)}/products?search=${encodeURIComponent(q)}${limit ? `&limit=${encodeURIComponent(limit)}` : ''}`, { accessToken });

// Catálogo existente del backend (app/devices.py), sin /api/v1.
export const listCatalog = (branchId, search, accessToken) =>
  apiRequest(`/branches/${encodeURIComponent(branchId)}/products?search=${encodeURIComponent(search || '')}&limit=100`, { accessToken });
