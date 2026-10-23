import { request } from './api';

export const categoryService = {
  // Read All
  async getCategories() {
    const res = await request('/categories');
    return res.data || [];
  },

  // Read One
  async getCategoryById(id) {
    const res = await request(`/categories/${id}`);
    return res.data;
  },

  // Create (Admin CRUD)
  async createCategory(catData) {
    const res = await request('/categories', {
      method: 'POST',
      body: JSON.stringify(catData),
    });
    return res.data;
  },

  // Update (Admin CRUD)
  async updateCategory(id, updateData) {
    const res = await request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return res.data;
  },

  // Delete (Admin CRUD)
  async deleteCategory(id) {
    const res = await request(`/categories/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};
