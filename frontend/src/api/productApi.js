import { apiClient } from './client.js';

export const productApi = {
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return apiClient(endpoint, { method: 'GET' });
  },

  getProductById: async (id) => {
    return apiClient(`/products/${id}`, { method: 'GET' });
  },

  getProductFilters: async () => {
    return apiClient('/products/filters', { method: 'GET' });
  },

  createProduct: async (productData) => {
    return apiClient('/products', {
      method: 'POST',
      body: productData,
    });
  },

  updateProduct: async (id, productData) => {
    return apiClient(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  },

  deleteProduct: async (id) => {
    return apiClient(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};
