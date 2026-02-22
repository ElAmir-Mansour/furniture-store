'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    nameAr?: string;
    slug: string;
    description?: string;
    image?: string;
    productCount: number;
    isActive: boolean;
    sortOrder: number;
    parentId?: string;
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/categories?flat=true');
            const data = await res.json();
            if (data.success) {
                // Add mock product counts
                setCategories(data.data.map((cat: any, i: number) => ({
                    ...cat,
                    productCount: [3, 2, 2, 1][i] || 0,
                    isActive: true,
                })));
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            // Mock data fallback
            setCategories([
                { id: '1', name: 'Living Room', nameAr: 'غرفة المعيشة', slug: 'living-room', productCount: 3, isActive: true, sortOrder: 1 },
                { id: '2', name: 'Bedroom', nameAr: 'غرفة النوم', slug: 'bedroom', productCount: 2, isActive: true, sortOrder: 2 },
                { id: '3', name: 'Dining Room', nameAr: 'غرفة الطعام', slug: 'dining-room', productCount: 2, isActive: true, sortOrder: 3 },
                { id: '4', name: 'Home Office', nameAr: 'المكتب المنزلي', slug: 'home-office', productCount: 1, isActive: true, sortOrder: 4 },
            ]);
        } finally {
            setLoading(false);
        }
    }

    const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold mb-2">Categories</h1>
                    <p className="text-gray-500">
                        {categories.length} categories • {totalProducts} products
                    </p>
                </div>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors whitespace-nowrap">
                    + Add Category
                </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="bg-gray-200 animate-pulse h-[120px] rounded-lg mb-4" />
                            <div className="bg-gray-200 animate-pulse h-5 w-[60%] rounded mb-2" />
                            <div className="bg-gray-200 animate-pulse h-4 w-[40%] rounded" />
                        </div>
                    ))
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow">
                            {/* Category Image */}
                            <div className="h-40 bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] relative flex items-center justify-center overflow-hidden">
                                {category.image ? (
                                    <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                                        {category.slug === 'living-room' && '🛋️'}
                                        {category.slug === 'bedroom' && '🛏️'}
                                        {category.slug === 'dining-room' && '🍽️'}
                                        {category.slug === 'home-office' && '🖥️'}
                                    </span>
                                )}
                                <span className={`absolute top-3 right-3 px-2.5 py-1 text-white rounded-md text-xs font-medium backdrop-blur-sm ${category.isActive ? 'bg-emerald-500/90' : 'bg-gray-500/90'}`}>
                                    {category.isActive ? 'Active' : 'Draft'}
                                </span>
                            </div>

                            {/* Category Info */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="min-w-0 pr-2">
                                        <h3 className="m-0 font-semibold text-gray-900 truncate">{category.name}</h3>
                                        {category.nameAr && (
                                            <p className="m-0 mt-1 text-sm text-gray-500 truncate">
                                                {category.nameAr}
                                            </p>
                                        )}
                                    </div>
                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-xs whitespace-nowrap shrink-0">
                                        {category.productCount} products
                                    </span>
                                </div>

                                <p className="mt-3 mb-4 text-xs text-gray-400 font-mono truncate">
                                    /{category.slug}
                                </p>

                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                        Edit
                                    </button>
                                    <Link href={`/category/${category.slug}`} className="flex-1 py-2 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white rounded-lg text-sm font-medium text-center transition-colors">
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Add New Category Card */}
                <div className="bg-gray-50 hover:bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center min-h-[280px] cursor-pointer transition-colors group">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-xl text-gray-600">+</span>
                    </div>
                    <p className="font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Add New Category</p>
                </div>
            </div>
        </div>
    );
}
