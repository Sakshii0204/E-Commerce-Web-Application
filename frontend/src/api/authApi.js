import { apiClient } from './client.js';

export const authApi = {
  async register({ name, email, password }) {
    return apiClient('/auth/register', {
      body: { name, email, password }
    });
  },

  async login({ email, password }) {
    return apiClient('/auth/login', {
      body: { email, password }
    });
  },

  async logout() {
    return apiClient('/auth/logout', {
      method: 'POST'
    });
  },

  async getMe() {
    return apiClient('/auth/me', {
      method: 'GET'
    });
  }
};
