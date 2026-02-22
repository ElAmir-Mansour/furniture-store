'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    material?: string;
    category: { id: string; name: string; slug: string };
    images: { thumbnailUrl: string; standardUrl: string }[];
    variants: { stock: number }[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Filters {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    search?: string;
    sortBy?: string;
}

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div className="pt-28 min-h-screen">
                <div className="container max-w-[1400px] mx-auto px-6">
                    <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-2xl" />
                </div>
            </div>
        }>
            <ProductsContent />
        </Suspense>
    );
}

function ProductsContent() {
    const t = useTranslations('products');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const [filters, setFilters] = useState<Filters>({
        categoryId: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined,
        sortBy: 'newest',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filters, currentPage]);

    async function fetchCategories() {
        try {
            const res = await fetch('/api/v1/categories?flat=true');
            const data = await res.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    }

    async function fetchProducts() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', currentPage.toString());
            if (filters.categoryId) params.set('categoryId', filters.categoryId);
            if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
            if (filters.material) params.set('material', filters.material);
            if (filters.search) params.set('search', filters.search);
            if (filters.sortBy) params.set('sortBy', filters.sortBy);

            const res = await fetch(`/api/v1/products?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setProducts(data.data.items);
                setTotalPages(data.data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleFilterChange(key: keyof Filters, value: string | number | undefined) {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    }

    return (
        <div className="pt-28 pb-24 min-h-screen bg-gray-50/30">
            <div className="container max-w-[1400px] mx-auto px-6">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
                    {/* Filters Sidebar */}
                    <aside>
                        <div className="bg-[#f7f5f2] rounded-2xl p-6 sticky top-28 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('filters')}</h3>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('search')}</label>
                                <input
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a959]/50 focus:border-[#c9a959] transition-all"
                                    value={filters.search || ''}
                                    onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
                                />
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('category')}</label>
                                <select
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a959]/50 focus:border-[#c9a959] transition-all appearance-none cursor-pointer"
                                    value={filters.categoryId || ''}
                                    onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
                                >
                                    <option value="">{t('allCategories')}</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('priceRange')} ({tCommon('egp')})</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder={t('min')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a959]/50 focus:border-[#c9a959] transition-all"
                                        value={filters.minPrice || ''}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t('max')}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a959]/50 focus:border-[#c9a959] transition-all"
                                        value={filters.maxPrice || ''}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>
                            </div>

                            {/* Material */}
                            <div className="mb-8">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('material')}</label>
                                <select
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a959]/50 focus:border-[#c9a959] transition-all appearance-none cursor-pointer"
                                    value={filters.material || ''}
                                    onChange={(e) => handleFilterChange('material', e.target.value || undefined)}
                                >
                                    <option value="">{t('allMaterials')}</option>
                                    <option value="Velvet">{locale === 'ar' ? 'مخمل' : 'Velvet'}</option>
                                    <option value="Wood">{locale === 'ar' ? 'خشب' : 'Wood'}</option>
                                    <option value="Leather">{locale === 'ar' ? 'جلد' : 'Leather'}</option>
                                    <option value="Fabric">{locale === 'ar' ? 'قماش' : 'Fabric'}</option>
                                    <option value="Metal">{locale === 'ar' ? 'معدن' : 'Metal'}</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => {
                                    setFilters({ sortBy: 'newest' });
                                    setCurrentPage(1);
                                }}
                                className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                                {t('clearFilters')}
                            </button>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div>
                        {/* Sort Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-gray-200">
                            <span className="text-gray-500 font-medium">
                                {loading ? tCommon('loading') : `${products.length} ${t('productsCount')}`}
                            </span>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <label className="text-sm font-medium text-gray-600 shrink-0">{t('sort_by')}</label>
                                <select
                                    className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c9a959]/50 focus:border-[#c9a959] transition-all appearance-none cursor-pointer font-medium text-gray-800"
                                    value={filters.sortBy || 'newest'}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="newest">{t('sortNewest')}</option>
                                    <option value="price_asc">{t('sortPriceLow')}</option>
                                    <option value="price_desc">{t('sortPriceHigh')}</option>
                                    <option value="popular">{t('sortPopular')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Products */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array(6).fill(0).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-[#f7f5f2] rounded-2xl border border-gray-100">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-3xl">🔍</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {t('noProducts')}
                                </h3>
                                <p className="text-gray-500 max-w-sm text-center">
                                    {t('tryAdjusting')}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} locale={locale} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-16">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#c9a959] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('previous')}
                                        </button>
                                        <div className="flex gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 rounded-lg font-medium flex items-center justify-center transition-colors ${page === currentPage
                                                        ? 'bg-[#1a1a2e] text-white'
                                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:text-[#c9a959] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {t('next')}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product, locale }: { product: Product; locale: string }) {
    const tCommon = useTranslations('common');
    const price = Number(product.price);
    const comparePrice = Number(product.comparePrice);
    const hasDiscount = comparePrice > price;
    const discountPercent = hasDiscount ? Math.round((1 - price / comparePrice) * 100) : 0;

    return (
        <Link
            href={`/${locale}/products/${product.slug}`}
            className="group bg-white rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg border border-gray-100 transition-all duration-300 block"
            style={{ textDecoration: 'none' }}
        >
            <div className="relative aspect-square overflow-hidden bg-[#f7f5f2]">
                <img
                    src={product.images[0]?.standardUrl || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {hasDiscount && (
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-[#ef4444] text-[10px] sm:text-xs font-bold text-white tracking-wide rounded shadow-sm z-10">
                        -{discountPercent}%
                    </span>
                )}
            </div>
            <div className="p-5">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    {product.category?.name}
                </span>
                <h3 className="font-display text-lg font-bold text-gray-900 mb-3 truncate group-hover:text-[#c9a959] transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#1a1a2e]">
                        {price.toLocaleString()} {tCommon('egp')}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm font-medium text-gray-400 line-through">
                            {comparePrice.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="aspect-square bg-gray-100 animate-pulse" />
            <div className="p-5">
                <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    );
}
