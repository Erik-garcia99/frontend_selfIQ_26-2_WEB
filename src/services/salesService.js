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

export const voidSale = (branchId, saleId, reason, accessToken) =>
  apiRequest(`${base(branchId)}/sales/${encodeURIComponent(saleId)}/void`, {
    method: 'POST', body: { reason }, accessToken,
  });

export const returnSale = (branchId, saleId, items, reason, accessToken) =>
  apiRequest(`${base(branchId)}/sales/${encodeURIComponent(saleId)}/returns`, {
    method: 'POST', body: { items, reason }, accessToken,
  });