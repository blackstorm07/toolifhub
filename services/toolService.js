/**
 * Client-side tool service for fetching tool data from the API
 */

const BASE = '/api';

export const toolService = {
  async getAll({ page = 1, limit = 20, category, featured, trending, status } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (category) params.set('category', category);
    if (featured !== undefined) params.set('featured', featured);
    if (trending !== undefined) params.set('trending', trending);
    if (status) params.set('status', status);
    const res = await fetch(`${BASE}/tools?${params}`);
    if (!res.ok) throw new Error('Failed to fetch tools');
    return res.json();
  },

  async getBySlug(slug) {
    const res = await fetch(`${BASE}/tools/${slug}`);
    if (!res.ok) throw new Error(`Tool not found: ${slug}`);
    return res.json();
  },

  async search(query) {
    const res = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  async getFeatured(limit = 8) {
    return toolService.getAll({ featured: true, limit, status: 'active' });
  },

  async getTrending(limit = 8) {
    return toolService.getAll({ trending: true, limit, status: 'active' });
  },
};
