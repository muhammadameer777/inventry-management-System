import { request } from './api';

export const bookingService = {
  async getBookings({ userId, eventId, status } = {}) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (eventId) params.append('eventId', eventId);
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await request(`/bookings${query}`);
    return res.data || [];
  },

  async getBookingById(id) {
    const res = await request(`/bookings/${id}`);
    return res.data;
  },

  async createBooking({ eventId, ticketType, quantity = 1, notes }) {
    const res = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ eventId, ticketType, quantity, notes }),
    });
    return res.data;
  },

  async cancelBooking(id, reason) {
    return request(`/bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async checkInBooking(id) {
    return request(`/bookings/${id}/checkin`, { method: 'POST' });
  },

  async updateBooking(id, data) {
    const res = await request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async deleteBooking(id) {
    return request(`/bookings/${id}`, { method: 'DELETE' });
  },
};
