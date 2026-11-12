import { apiRequest } from './http';

const base = (branchId) => `/api/v1/branches/${encodeURIComponent(branchId)}`;

export const listInventory = (branchId, accessToken, search = '') =>
  apiRequest(`${base(branchId)}/inventory?search=${encodeURIComponent(search)}`, { accessToken });

export const getInventoryItem = (branchId, productId, accessToken) =>
  apiRequest(`${base(branchId)}/inventory/${encodeURIComponent(productId)}`, { accessToken });

export const listMovements = (branchId, accessToken, filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
  const query = params.toString();
  return apiRequest(`${base(branchId)}/inventory/movements${query ? `?${query}` : ''}`, { accessToken });
};

export const adjustInventory = (branchId, payload, idempotencyKey, accessToken) =>
  apiRequest(`${base(branchId)}/inventory/adjustments`, {
    method: 'POST', body: payload, accessToken,
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const listReceipts = (branchId, accessToken) =>
  apiRequest(`${base(branchId)}/goods-receipts`, { accessToken });

export const confirmReceipt = (branchId, receiptId, accessToken) =>
  apiRequest(`${base(branchId)}/goods-receipts/${encodeURIComponent(receiptId)}/confirm`, {
    method: 'POST', accessToken,
  });