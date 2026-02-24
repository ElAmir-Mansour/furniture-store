'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
    image?: string;
    isActive: boolean;
    sortOrder: number;
    parentId?: string;
}

interface CategoryFormData {
    name: string;
    nameAr: string;
    slug: string;
    isActive: boolean;
    sortOrder: string;
}

const SLUG_EMOJI: Record<string, string> = {
    'living-room': '🛋️', 'bedroom': '🛏️', 'dining-room': '🍽️', 'home-office': '🖥️',
};

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCat, setEditingCat] = useState<Category | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CategoryFormData>({ name: '', nameAr: '', slug: '', isActive: true, sortOrder: '0' });

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/categories?flat=true');
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    function slugify(text: string) {
        return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    function openCreate() {
        setEditingCat(null);
        setForm({ name: '', nameAr: '', slug: '', isActive: true, sortOrder: '0' });
        setShowModal(true);
    }

    function openEdit(cat: Category) {
        setEditingCat(cat);
        setForm({ name: cat.name, nameAr: cat.nameAr || '', slug: cat.slug, isActive: cat.isActive, sortOrder: String(cat.sortOrder) });
        setShowModal(true);
    }

    async function saveCategory() {
        if (!form.name.trim() || !form.slug.trim()) {
            toast.error('Name and slug are required');
            return;
        }
        setSaving(true);
        try {
            const body = {
                name: form.name,
                nameAr: form.nameAr || undefined,
                slug: form.slug,
                isActive: form.isActive,
                sortOrder: Number(form.sortOrder) || 0,
            };

            const url = editingCat ? `/api/v1/admin/categories/${editingCat.id}` : '/api/v1/categories';
            const method = editingCat ? 'PATCH' : 'POST';

            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();

            if (data.success) {
                toast.success(editingCat ? 'Category updated!' : 'Category created!');
                setShowModal(false);
                fetchCategories();
            } else {
                toast.error(data.error || 'Save failed');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    }

    async function toggleCategoryStatus(cat: Category) {
        try {
            const res = await fetch(`/api/v1/admin/categories/${cat.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !cat.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Category ${cat.isActive ? 'deactivated' : 'activated'}`);
                fetchCategories();
            }
        } catch {
            toast.error('Failed to update category');
        }
    }

    const totalProducts = 0; // Would come from product count

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px 0' }}>Categories</h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>{categories.length} categories · {totalProducts} products</p>
                </div>
                <button
                    onClick={openCreate}
                    style={{ padding: '10px 20px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    + Add Category
                </button>
            </div>

            {/* Categories Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                {loading
                    ? Array(4).fill(0).map((_, i) => (
                        <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }}>
                            <div style={{ height: '160px', background: '#f3f4f6' }} />
                            <div style={{ padding: '20px' }}>
                                <div style={{ height: '18px', width: '60%', background: '#f3f4f6', borderRadius: '6px', marginBottom: '8px' }} />
                                <div style={{ height: '14px', width: '40%', background: '#f3f4f6', borderRadius: '6px' }} />
                            </div>
                        </div>
                    ))
                    : categories.map((cat) => (
                        <div key={cat.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)')}
                        >
                            {/* Image */}
                            <div style={{ height: '160px', background: 'linear-gradient(135deg, #1a1a2e, #2a2a4e)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                {cat.image
                                    ? <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <span style={{ fontSize: '3.5rem' }}>{SLUG_EMOJI[cat.slug] || '🪑'}</span>
                                }
                                <span style={{
                                    position: 'absolute', top: '12px', right: '12px',
                                    padding: '4px 10px', background: cat.isActive ? 'rgba(5,150,105,0.9)' : 'rgba(107,114,128,0.9)',
                                    color: 'white', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                                }}>
                                    {cat.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Info */}
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ margin: 0, fontWeight: 700, color: '#111827', fontSize: '1rem' }}>{cat.name}</h3>
                                        {cat.nameAr && <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: '#9ca3af' }}>{cat.nameAr}</p>}
                                    </div>
                                </div>
                                <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>/{cat.slug}</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => openEdit(cat)}
                                        style={{ flex: 1, padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = '#f9fafb')}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <Link
                                        href={`/en/categories/${cat.slug}`}
                                        target="_blank"
                                        style={{ flex: 1, padding: '8px', background: '#1a1a2e', color: 'white', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center' }}
                                    >
                                        👁 View
                                    </Link>
                                </div>
                                <button
                                    onClick={() => toggleCategoryStatus(cat)}
                                    style={{
                                        width: '100%', marginTop: '8px', padding: '7px', borderRadius: '10px',
                                        fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                                        background: cat.isActive ? '#fef2f2' : '#ecfdf5',
                                        color: cat.isActive ? '#dc2626' : '#059669',
                                    }}
                                >
                                    {cat.isActive ? '⏸ Deactivate' : '▶ Activate'}
                                </button>
                            </div>
                        </div>
                    ))
                }

                {/* Add New Card */}
                {!loading && (
                    <div
                        onClick={openCreate}
                        style={{ background: '#f9fafb', borderRadius: '16px', border: '2px dashed #d1d5db', minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c9a959'; e.currentTarget.style.background = '#fefce8'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#f9fafb'; }}
                    >
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '1.5rem', color: '#9ca3af' }}>+</div>
                        <p style={{ color: '#6b7280', fontWeight: 500, margin: 0 }}>Add New Category</p>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 24px 0' }}>
                            {editingCat ? 'Edit Category' : 'Add New Category'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Name (English) *', key: 'name', placeholder: 'e.g. Living Room', onChange: (v: string) => setForm(f => ({ ...f, name: v, slug: f.slug || slugify(v) })) },
                                { label: 'Name (Arabic)', key: 'nameAr', placeholder: 'e.g. غرفة المعيشة' },
                                { label: 'Slug *', key: 'slug', placeholder: 'e.g. living-room' },
                            ].map((field) => (
                                <div key={field.key}>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{field.label}</label>
                                    <input
                                        value={form[field.key as keyof CategoryFormData] as string}
                                        onChange={(e) => {
                                            if (field.onChange) field.onChange(e.target.value);
                                            else setForm(f => ({ ...f, [field.key]: e.target.value }));
                                        }}
                                        placeholder={field.placeholder}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            ))}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input
                                    type="checkbox"
                                    id="catActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />
                                <label htmlFor="catActive" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
                                    Active (visible on storefront)
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveCategory}
                                disabled={saving}
                                style={{ flex: 1, padding: '12px', background: saving ? '#9ca3af' : '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer' }}
                            >
                                {saving ? 'Saving...' : editingCat ? 'Save Changes' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
    );
}
