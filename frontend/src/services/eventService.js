import { request } from './api';

export const eventService = {
  async getEvents({ search = '', category = 'all', sort = 'date-asc', date = '', status = '' } = {}) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'all') params.append('category', category);
    if (sort) params.append('sort', sort);
    if (date) params.append('date', date);
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/events${query}`);
    return res.data || [];
  },

  async getEventById(id) {
    const res = await request(`/events/${id}`);
    return res.data;
  },

  async createEvent(eventData) {
    const res = await request('/events', { method: 'POST', body: JSON.stringify(eventData) });
    return res.data;
  },

  async updateEvent(id, updateData) {
    const res = await request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(updateData) });
    return res.data;
  },

  async deleteEvent(id) {
    return request(`/events/${id}`, { method: 'DELETE' });
  },
};
