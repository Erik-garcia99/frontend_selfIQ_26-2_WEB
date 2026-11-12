import { apiRequest } from './http';

const base = (branchId) => `/api/v1/branches/${encodeURIComponent(branchId)}`;

export const lookupProduct = (branchId, barcode, accessToken) =>
  apiRequest(`${base(branchId)}/products/lookup?barcode=${encodeURIComponent(barcode)}`, { accessToken });

export const searchProducts = (branchId, q, accessToken) =>
  apiRequest(`${base(branchId)}/products?search=${encodeURIComponent(q)}`, { accessToken });