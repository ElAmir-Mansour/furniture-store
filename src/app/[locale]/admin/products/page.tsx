'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    stock: number;
    status: 'active' | 'draft' | 'archived';
    imageUrl: string;
    variants: number;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All Categories');
    const [statusFilter, setStatusFilter] = useState('All Status');

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/products?pageSize=50');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data.items.map((p: {
                    id: string; name: string; slug: string; price: string | number;
                    category?: { name?: string }; variants?: Array<{ stock?: number }>;
                    isActive: boolean; images?: Array<{ thumbnailUrl?: string }>;
                }) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: Number(p.price),
                    category: p.category?.name || 'Uncategorized',
                    stock: p.variants?.[0]?.stock || 0,
                    status: p.isActive ? 'active' : 'draft',
                    imageUrl: p.images?.[0]?.thumbnailUrl || '',
                    variants: p.variants?.length || 0,
                })));
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = categoryFilter === 'All Categories' || p.category === categoryFilter;
        const matchStatus = statusFilter === 'All Status' || p.status === statusFilter.toLowerCase();
        return matchSearch && matchCategory && matchStatus;
    });

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const active = products.filter(p => p.status === 'active').length;

    const stats = [
        { label: 'Total Products', value: products.length, icon: '📦' },
        { label: 'Active', value: active, icon: '✅' },
        { label: 'Low Stock', value: lowStock, icon: '⚠️' },
        { label: 'Out of Stock', value: outOfStock, icon: '❌' },
    ];

    function stockColor(stock: number) {
        if (stock === 0) return '#dc2626';
        if (stock < 10) return '#d97706';
        return '#059669';
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px 0' }}>Products</h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>{products.length} products • {totalStock} total in stock</p>
                </div>
                <Link href="/admin/products/new"
                    style={{ padding: '10px 20px', background: '#1a1a2e', color: 'white', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    + Add Product
                </Link>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px 0' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{stat.value}</p>
                        </div>
                        <span style={{ fontSize: '1.75rem', opacity: 0.8 }}>{stat.icon}</span>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: '200px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', background: 'white' }}
                    onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', background: 'white', minWidth: '150px', cursor: 'pointer' }}
                >
                    <option>All Categories</option>
                    <option>Living Room</option>
                    <option>Bedroom</option>
                    <option>Dining Room</option>
                    <option>Home Office</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', background: 'white', minWidth: '130px', cursor: 'pointer' }}
                >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Archived</option>
                </select>
            </div>

            {/* Products Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>No products found.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    {['Product', 'Category', 'Price', 'Stock', 'Variants', 'Status', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e5e7eb' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f3f4f6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {product.imageUrl
                                                        ? <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        : <span style={{ fontSize: '12px', color: '#9ca3af' }}>N/A</span>
                                                    }
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <Link href={`/admin/products/${product.id}`}
                                                        style={{ fontWeight: 600, color: '#111827', textDecoration: 'none', display: 'block', fontSize: '0.875rem' }}>
                                                        {product.name}
                                                    </Link>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{ padding: '4px 10px', background: '#f3f4f6', color: '#374151', borderRadius: '6px', fontSize: '12px', fontWeight: 500 }}>
                                                {product.category}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                                            {product.price.toLocaleString()} EGP
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, color: stockColor(product.stock), fontSize: '0.875rem' }}>
                                            {product.stock}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#374151' }}>
                                            {product.variants}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                                                background: product.status === 'active' ? '#ecfdf5' : '#f3f4f6',
                                                color: product.status === 'active' ? '#059669' : '#6b7280'
                                            }}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <Link href={`/admin/products/${product.id}/edit`}
                                                    style={{ padding: '5px 12px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                                                    Edit
                                                </Link>
                                                <Link href={`/en/products/${product.slug}`} target="_blank"
                                                    style={{ padding: '5px 12px', background: '#1a1a2e', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
