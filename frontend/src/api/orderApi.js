import { apiClient } from './client.js';

export const orderApi = {
  createOrder: async ({ shippingAddress, paymentMethod = 'COD' }) => {
    return apiClient('/orders', {
      method: 'POST',
      body: { shippingAddress, paymentMethod },
    });
  },

  getMyOrders: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiClient(`/orders/my-orders${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getOrderById: async (id) => {
    return apiClient(`/orders/${id}`, {
      method: 'GET',
    });
  },

  // Admin order methods
  getAdminOrders: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return apiClient(`/orders/admin${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  getAdminOrderById: async (id) => {
    return apiClient(`/orders/admin/${id}`, {
      method: 'GET',
    });
  },

  updateOrderStatus: async (id, status) => {
    return apiClient(`/orders/admin/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  getDashboardStats: async () => {
    return apiClient('/orders/admin/dashboard', {
      method: 'GET',
    });
  },
};

