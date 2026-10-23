import { request } from './api';

export const authService = {
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) localStorage.setItem('campusevents_token', res.token);
    return res;
  },

  async register(userData) {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.token) localStorage.setItem('campusevents_token', res.token);
    return res;
  },

  async getCurrentUser() {
    const res = await request('/auth/me');
    return res.user;
  },

  async updateProfile(data) {
    const res = await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.user;
  },

  async changePassword(currentPassword, newPassword) {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  logout() {
    localStorage.removeItem('campusevents_token');
  },
};
