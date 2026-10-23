import { request } from './api';

export const userService = {
  async getStats() {
    const res = await request('/users/stats');
    return res.data;
  },

  async getUsers({ search, role } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/users${query}`);
    return res.data || [];
  },

  async updateUserRole(id, role) {
    const res = await request(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
    return res;
  },

  async deleteUser(id) {
    return request(`/users/${id}`, { method: 'DELETE' });
  },
};
