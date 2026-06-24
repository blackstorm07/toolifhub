/**
 * Client-side blog service
 */

const BASE = '/api';

export const blogService = {
  async getAll({ page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${BASE}/blogs?${params}`);
    if (!res.ok) throw new Error('Failed to fetch blogs');
    return res.json();
  },

  async getBySlug(slug) {
    const res = await fetch(`${BASE}/blogs/${slug}`);
    if (!res.ok) throw new Error(`Blog post not found: ${slug}`);
    return res.json();
  },
};
