import { request } from './api';

export const eventRequestService = {
  async getRequests({ status, search } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/event-requests${query}`);
    return res.data || [];
  },

  async getRequestById(id) {
    const res = await request(`/event-requests/${id}`);
    return res.data;
  },

  async submitRequest(data) {
    const res = await request('/event-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  },

  async updateStatus(id, status, adminNote) {
    const res = await request(`/event-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNote }),
    });
    return res;
  },

  async approveAndCreate(id, { adminNote, capacity, ticketPrice } = {}) {
    const res = await request(`/event-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ adminNote, capacity, ticketPrice }),
    });
    return res;
  },

  async deleteRequest(id) {
    return request(`/event-requests/${id}`, { method: 'DELETE' });
  },
};
