/**
 * Client-side category service
 */

const BASE = '/api';

export const categoryService = {
  async getAll() {
    const res = await fetch(`${BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getBySlug(slug, { page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ page, limit });
    const res = await fetch(`${BASE}/categories/${slug}?${params}`);
    if (!res.ok) throw new Error(`Category not found: ${slug}`);
    return res.json();
  },
};
