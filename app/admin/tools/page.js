'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminToolsPage() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', category: '', shortDescription: '', icon: '🔧', status: 'active', featured: false, trending: false, keywords: '', seoTitle: '', seoDescription: '' });

  const fetchData = async () => {
    setLoading(true);
    const [toolsRes, catRes] = await Promise.all([
      fetch('/api/admin/tools?limit=100'),
      fetch('/api/admin/categories'),
    ]);
    const toolsData = await toolsRes.json();
    const catData = await catRes.json();
    setTools(toolsData.tools || []);
    setCategories(catData.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredTools = tools.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', slug: '', category: categories[0]?._id || '', shortDescription: '', icon: '🔧', status: 'active', featured: false, trending: false, keywords: '', seoTitle: '', seoDescription: '' });
    setShowModal(true);
  };

  const openEdit = (tool) => {
    setEditing(tool);
    setForm({
      title: tool.title, slug: tool.slug, category: tool.category?._id || tool.category || '',
      shortDescription: tool.shortDescription, icon: tool.icon, status: tool.status,
      featured: tool.featured, trending: tool.trending,
      keywords: Array.isArray(tool.keywords) ? tool.keywords.join(', ') : tool.keywords || '',
      seoTitle: tool.seoTitle || '', seoDescription: tool.seoDescription || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = { ...form, keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean) };
    const url = editing ? `/api/admin/tools/${editing._id}` : '/api/admin/tools';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.tool) {
      toast.success(editing ? 'Tool updated!' : 'Tool created!');
      setShowModal(false);
      fetchData();
    } else {
      toast.error(data.error || 'Something went wrong');
    }
  };

  const handleDelete = async (tool) => {
    if (!confirm(`Delete "${tool.title}"?`)) return;
    const res = await fetch(`/api/admin/tools/${tool._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast.success('Deleted'); fetchData(); }
    else toast.error('Delete failed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tools</h1>
          <p className="text-muted-foreground text-sm mt-1">{tools.length} tools total</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Tool
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search tools..." className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500" />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Tool</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Views</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTools.map((tool) => (
                <tr key={tool._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tool.icon}</span>
                      <div>
                        <p className="font-medium">{tool.title}</p>
                        <p className="text-xs text-muted-foreground">{tool.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{tool.category?.name}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      tool.status === 'active' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      tool.status === 'inactive' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {tool.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{tool.views?.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(tool)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(tool)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No tools found</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-lg">{editing ? 'Edit Tool' : 'Add New Tool'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" placeholder="YouTube Tag Generator" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Slug *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" placeholder="youtube-tag-generator" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm">
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Icon</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" placeholder="🔧" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="coming-soon">Coming Soon</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Short Description *</label>
                <textarea value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Keywords (comma separated)</label>
                <input value={form.keywords} onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" placeholder="youtube, tags, seo, video" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">SEO Title</label>
                  <input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">SEO Description</label>
                  <input value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded" />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.trending} onChange={e => setForm(f => ({ ...f, trending: e.target.checked }))} className="w-4 h-4 rounded" />
                  Trending
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors">
                {editing ? 'Update Tool' : 'Create Tool'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
