import { apiClient } from './client.js';

export const cartApi = {
  getCart: async () => {
    return apiClient('/cart', { method: 'GET' });
  },

  addCartItem: async (productId, quantity = 1) => {
    return apiClient('/cart/items', {
      method: 'POST',
      body: { productId, quantity },
    });
  },

  updateCartItem: async (productId, quantity) => {
    return apiClient(`/cart/items/${productId}`, {
      method: 'PUT',
      body: { quantity },
    });
  },

  removeCartItem: async (productId) => {
    return apiClient(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return apiClient('/cart', {
      method: 'DELETE',
    });
  },
};
