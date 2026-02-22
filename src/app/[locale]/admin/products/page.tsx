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
    createdAt: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/products?pageSize=50');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data.items.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: Number(p.price),
                    category: p.category?.name || 'Uncategorized',
                    stock: p.variants?.[0]?.stock || 0,
                    status: p.isActive ? 'active' : 'draft',
                    imageUrl: p.images?.[0]?.thumbnailUrl || '',
                    variants: p.variants?.length || 0,
                    createdAt: p.createdAt,
                })));
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold mb-2">Products</h1>
                    <p className="text-gray-500">
                        {products.length} products • {totalStock} total in stock
                    </p>
                </div>
                <Link href="/admin/products/new" className="inline-flex items-center justify-center px-4 py-2 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors whitespace-nowrap">
                    + Add Product
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Products', value: products.length, icon: '📦' },
                    { label: 'Active', value: products.filter(p => p.status === 'active').length, icon: '✅' },
                    { label: 'Low Stock', value: products.filter(p => p.stock < 10).length, icon: '⚠️' },
                    { label: 'Out of Stock', value: products.filter(p => p.stock === 0).length, icon: '❌' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 m-0">{stat.value}</p>
                        </div>
                        <span className="text-2xl opacity-80">{stat.icon}</span>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#c9a959] focus:ring-1 focus:ring-[#c9a959] transition-all"
                />
                <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#c9a959] min-w-[150px]">
                    <option>All Categories</option>
                    <option>Living Room</option>
                    <option>Bedroom</option>
                    <option>Dining Room</option>
                    <option>Home Office</option>
                </select>
                <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#c9a959] min-w-[120px]">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Archived</option>
                </select>
            </div>

            {/* Products Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No products found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Variants</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">No img</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <Link href={`/admin/products/${product.id}`} className="font-semibold text-gray-900 hover:text-[#c9a959] transition-colors truncate block">
                                                        {product.name}
                                                    </Link>
                                                    <p className="m-0 text-xs text-gray-500 truncate mt-0.5">
                                                        {product.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold text-gray-900">{product.price.toLocaleString()} EGP</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`font-medium ${product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700">{product.variants}</td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${product.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {product.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Link href={`/admin/products/${product.id}/edit`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors">
                                                    Edit
                                                </Link>
                                                <Link href={`/products/${product.slug}`} target="_blank" className="px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white rounded-md text-xs font-medium transition-colors">
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
