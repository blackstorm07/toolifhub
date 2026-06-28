'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Sparkles, X } from 'lucide-react';
import slugify from 'slugify';
import toast from 'react-hot-toast';
import { getTimeAgo } from '@/lib/utils';
import { BLOG_CATEGORIES } from '@/lib/blog/categories';

const EMPTY_FORM = {
  title: '', slug: '', excerpt: '', content: '', featuredImage: '', tags: '',
  category: '', status: 'published', featured: false, seoTitle: '', seoDescription: '',
  publishedAt: '', faqs: [],
};

function wordCount(html) {
  const text = String(html || '').replace(/<[^>]*>/g, ' ');
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const STATUS_BADGE = {
  published: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  draft: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  scheduled: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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
    return () => { cancelled = true; };
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const toDatetimeLocal = (date) => (date ? new Date(date).toISOString().slice(0, 16) : '');

  const openEdit = async (blog) => {
    setEditing(blog);
    const res = await fetch(`/api/admin/blogs/${blog._id}`);
    const data = await res.json();
    const b = data.blog || blog;
    setForm({
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt || '',
      content: b.content || '',
      featuredImage: b.featuredImage || '',
      tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags || '',
      category: b.category || '',
      status: b.status,
      featured: b.featured,
      seoTitle: b.seoTitle || '',
      seoDescription: b.seoDescription || '',
      publishedAt: toDatetimeLocal(b.publishedAt),
      faqs: Array.isArray(b.faqs) ? b.faqs : [],
    });
    setShowModal(true);
  };

  const generateSlug = () => setForm((f) => ({ ...f, slug: slugify(f.title, { lower: true, strict: true }) }));

  const addFaq = () => setForm((f) => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }));
  const updateFaq = (i, key, value) =>
    setForm((f) => ({ ...f, faqs: f.faqs.map((faq, idx) => (idx === i ? { ...faq, [key]: value } : faq)) }));
  const removeFaq = (i) => setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      faqs: form.faqs.filter((f) => f.question.trim() && f.answer.trim()),
      ...(form.publishedAt ? { publishedAt: new Date(form.publishedAt).toISOString() } : {}),
    };
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

  const words = wordCount(form.content);
  const readingMinutes = Math.max(1, Math.ceil(words / 200));

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
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">Category</th>
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
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{blog.category || '—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[blog.status] || STATUS_BADGE.draft}`}>{blog.status}</span>
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
                <div>
                  <label className="block text-sm font-medium mb-1.5">Slug *</label>
                  <div className="flex gap-2">
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" />
                    <button type="button" onClick={generateSlug} title="Auto-generate from title" className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg border border-border hover:bg-muted">
                      <Sparkles className="w-4 h-4 text-brand-500" />
                    </button>
                  </div>
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1.5">Excerpt</label><textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm resize-none" /></div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">Content (HTML) *</label>
                  <span className="text-xs text-muted-foreground">{words} words · ~{readingMinutes} min read</span>
                </div>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm font-mono resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">Featured Image URL</label><input value={form.featuredImage} onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm">
                    <option value="">— None —</option>
                    {BLOG_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              {form.status === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Publish Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">The post goes live automatically once this time passes — no manual step needed.</p>
                </div>
              )}
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded" />Featured Post</label>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1.5">SEO Title</label><input value={form.seoTitle} onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
                <div><label className="block text-sm font-medium mb-1.5">SEO Description</label><input value={form.seoDescription} onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))} className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm" /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium">FAQs</label>
                  <button type="button" onClick={addFaq} className="text-xs font-medium text-brand-500 hover:underline">+ Add FAQ</button>
                </div>
                <div className="space-y-2">
                  {form.faqs.map((faq, i) => (
                    <div key={i} className="flex gap-2 items-start p-3 rounded-lg border border-border">
                      <div className="flex-1 space-y-2">
                        <input
                          value={faq.question}
                          onChange={e => updateFaq(i, 'question', e.target.value)}
                          placeholder="Question"
                          className="w-full h-9 px-3 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm"
                        />
                        <textarea
                          value={faq.answer}
                          onChange={e => updateFaq(i, 'answer', e.target.value)}
                          placeholder="Answer"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:border-brand-500 text-sm resize-none"
                        />
                      </div>
                      <button type="button" onClick={() => removeFaq(i)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-muted-foreground hover:text-red-500 flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
