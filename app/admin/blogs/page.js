'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTimeAgo } from '@/lib/utils';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', featuredImage: '', tags: '', status: 'published', featured: false, seoTitle: '', seoDescription: '' });

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/blogs');
    const data = await res.json();
    setBlogs(data.blogs || []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadBlogs() {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (!cancelled) {
        setBlogs(data.blogs || []);
        setLoading(false);
      }
    }

    loadBlogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', slug: '', excerpt: '', content: '', featuredImage: '', tags: '', status: 'published', featured: false, seoTitle: '', seoDescription: '' });
    setShowModal(true);
  };

  const openEdit = async (blog) => {
    setEditing(blog);
    const res = await fetch(`/api/admin/blogs/${blog._id}`);
    const data = await res.json();
    const b = data.blog || blog;
    setForm({ title: b.title, slug: b.slug, excerpt: b.excerpt || '', content: b.content || '', featuredImage: b.featuredImage || '', tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags || '', status: b.status, featured: b.featured, seoTitle: b.seoTitle || '', seoDescription: b.seoDescription || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const url = editing ? `/api/admin/blogs/${editing._id}` : '/api/admin/blogs';
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.blog) { toast.success(editing ? 'Updated!' : 'Created!'); setShowModal(false); fetchData(); }
    else toast.error(data.error || 'Error');
  };

  const handleDelete = async (blog) => {
    if (!confirm(`Delete "${blog.title}"?`)) return;
    const res = await fetch(`/api/admin/blogs/${blog._id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { toast.success('Deleted'); fetchData(); }
    else toast.error('Error');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-colors text-sm">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">Published</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{blog.title}</p>
                    <p className="text-xs text-muted-foreground">{blog.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${blog.status === 'published' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>{blog.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">{getTimeAgo(blog.publishedAt || blog.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(blog)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(blog)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-muted-foreground hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-border"><h2 className="font-bold text-lg">{editing ? 'Edit Post' : 'New Blog Post'}</h2></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Slug *</label><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
              </div>
              <div><label className="block text-sm font-medium mb-1.5">Excerpt</label><textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
              <div><label className="block text-sm font-medium mb-1.5">Content (HTML) *</label><textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm font-mono resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Featured Image URL</label><input value={form.featuredImage} onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Status</label><select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm"><option value="published">Published</option><option value="draft">Draft</option></select></div>
                <div className="flex items-end pb-1"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded" />Featured Post</label></div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-sm font-medium">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium">{editing ? 'Update Post' : 'Publish Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
