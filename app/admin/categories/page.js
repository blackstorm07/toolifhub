'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '📁', description: '', featured: false, order: 0, visible: true });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', slug: '', icon: '📁', description: '', featured: false, order: 0, visible: true });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description || '', featured: cat.featured, order: cat.order || 0, visible: cat.visible !== false });
    setShowModal(true);
  };

  const handleSave = async () => {
    const url = editing ? `/api/admin/categories/${editing._id}` : '/api/admin/categories';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.category) { toast.success(editing ? 'Updated!' : 'Created!'); setShowModal(false); fetchData(); }
    else toast.error(data.error || 'Error');
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${cat._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast.success('Deleted'); fetchData(); }
    else toast.error('Error');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-colors text-sm">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Featured</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Visible</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3"><span className="text-xl">{cat.icon}</span><span className="font-medium">{cat.name}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{cat.featured ? <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Yes</span> : '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {cat.visible !== false ? (
                      <span className="text-xs bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">Visible</span>
                    ) : (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Hidden</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl">
            <div className="p-6 border-b border-border"><h2 className="font-bold text-lg">{editing ? 'Edit Category' : 'Add Category'}</h2></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Slug *</label>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Icon (emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Order</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded" />
                Featured on homepage
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.visible} onChange={e => setForm(f => ({ ...f, visible: e.target.checked }))} className="w-4 h-4 rounded" />
                Visible on the site (uncheck to hide this category everywhere for users)
              </label>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
