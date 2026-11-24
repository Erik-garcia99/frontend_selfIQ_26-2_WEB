// F-02 (ME-9): administración de personas en la web. Reutiliza apiRequest.
import { apiRequest } from './http';

const root = (branchId) => `/branches/${encodeURIComponent(branchId)}`;
const id = (value) => encodeURIComponent(value);
const inactive = (include) => include ? '?include_inactive=true' : '';

export const listEmployees = (branchId, token, include = false) =>
  apiRequest(`${root(branchId)}/employees${inactive(include)}`, { accessToken: token });
export const createEmployee = (branchId, token, data) =>
  apiRequest(`${root(branchId)}/employees`, { method: 'POST', accessToken: token, body: data });
export const updateEmployee = (branchId, userId, token, data) =>
  apiRequest(`${root(branchId)}/employees/${id(userId)}`, { method: 'PATCH', accessToken: token, body: data });
export const deactivateEmployee = (branchId, userId, token) =>
  apiRequest(`${root(branchId)}/employees/${id(userId)}`, { method: 'DELETE', accessToken: token });

export const listCustomers = (branchId, token, include = false) =>
  apiRequest(`${root(branchId)}/customers${inactive(include)}`, { accessToken: token });
export const createCustomer = (branchId, token, data) =>
  apiRequest(`${root(branchId)}/customers`, { method: 'POST', accessToken: token, body: data });
export const updateCustomer = (branchId, userId, token, data) =>
  apiRequest(`${root(branchId)}/customers/${id(userId)}`, { method: 'PATCH', accessToken: token, body: data });
export const deactivateCustomer = (branchId, userId, token) =>
  apiRequest(`${root(branchId)}/customers/${id(userId)}`, { method: 'DELETE', accessToken: token });
export const customerPurchases = (branchId, userId, token) =>
  apiRequest(`${root(branchId)}/customers/${id(userId)}/purchases`, { accessToken: token });

export const listSuppliers = (branchId, token, include = false) =>
  apiRequest(`${root(branchId)}/suppliers${inactive(include)}`, { accessToken: token });
export const createSupplier = (branchId, token, data) =>
  apiRequest(`${root(branchId)}/suppliers`, { method: 'POST', accessToken: token, body: data });
export const updateSupplier = (branchId, supplierId, token, data) =>
  apiRequest(`${root(branchId)}/suppliers/${id(supplierId)}`, { method: 'PATCH', accessToken: token, body: data });
export const deactivateSupplier = (branchId, supplierId, token) =>
  apiRequest(`${root(branchId)}/suppliers/${id(supplierId)}`, { method: 'DELETE', accessToken: token });
export const supplierProducts = (branchId, supplierId, token) =>
  apiRequest(`${root(branchId)}/suppliers/${id(supplierId)}/products`, { accessToken: token });
export const replaceSupplierProducts = (branchId, supplierId, token, products) =>
  apiRequest(`${root(branchId)}/suppliers/${id(supplierId)}/products`, {
    method: 'PUT', accessToken: token, body: { products },
  });
