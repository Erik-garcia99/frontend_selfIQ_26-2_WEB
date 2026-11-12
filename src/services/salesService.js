import { apiRequest } from './http';

const base = (branchId) => `/api/v1/branches/${encodeURIComponent(branchId)}`;

export const createSale = (branchId, payload, idempotencyKey, accessToken) =>
  apiRequest(`${base(branchId)}/sales`, {
    method: 'POST', body: payload, accessToken,
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const listSales = (branchId, accessToken) =>
  apiRequest(`${base(branchId)}/sales`, { accessToken });

export const getSale = (branchId, saleId, accessToken) =>
  apiRequest(`${base(branchId)}/sales/${encodeURIComponent(saleId)}`, { accessToken });