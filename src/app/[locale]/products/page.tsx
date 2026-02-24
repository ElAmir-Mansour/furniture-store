'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    material?: string;
    category: { id: string; name: string; slug: string };
    images: { thumbnailUrl: string; standardUrl: string }[];
    variants: { id: string; stock: number; name: string }[];
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

const INPUT_STYLE: React.CSSProperties = {
    display: 'block', width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '0.875rem', color: '#1a1a2e', background: 'white',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};

const LABEL_STYLE: React.CSSProperties = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e',
    marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em',
};

export default function ProductsPage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', background: '#f7f5f2', padding: '120px 0 80px' }}>
                <div className="container">
                    <div style={{ height: '400px', background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
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

    const fetchProductsMemo = useCallback(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, currentPage]);

    useEffect(() => { fetchCategories(); }, []);
    useEffect(() => { fetchProductsMemo(); }, [fetchProductsMemo]);

    async function fetchCategories() {
        try {
            const res = await fetch('/api/v1/categories?flat=true');
            const data = await res.json();
            if (data.success) setCategories(data.data);
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
        <div style={{ background: '#f7f5f2', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="container">
                {/* Page Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '10px' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1.05rem', fontWeight: 300 }}>
                        {t('subtitle')}
                    </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
                    {/* Filters Sidebar */}
                    <aside style={{ flex: '1 1 260px', maxWidth: '320px' }}>
                        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', position: 'sticky', top: '100px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                            <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>
                                {t('filters')}
                            </h3>

                            {/* Search */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={LABEL_STYLE}>{t('search')}</label>
                                <input
                                    type="text"
                                    placeholder={t('searchPlaceholder')}
                                    style={INPUT_STYLE}
                                    value={filters.search || ''}
                                    onChange={e => handleFilterChange('search', e.target.value || undefined)}
                                    onFocus={e => e.target.style.borderColor = '#c9a959'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Categories */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={LABEL_STYLE}>{t('category')}</label>
                                <select
                                    style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'auto' }}
                                    value={filters.categoryId || ''}
                                    onChange={e => handleFilterChange('categoryId', e.target.value || undefined)}
                                    onFocus={e => e.target.style.borderColor = '#c9a959'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                >
                                    <option value="">{t('allCategories')}</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={LABEL_STYLE}>{t('priceRange')} ({tCommon('egp')})</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="number"
                                        placeholder={t('min')}
                                        style={{ ...INPUT_STYLE, flex: 1 }}
                                        value={filters.minPrice || ''}
                                        onChange={e => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
                                        onFocus={e => e.target.style.borderColor = '#c9a959'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                    <input
                                        type="number"
                                        placeholder={t('max')}
                                        style={{ ...INPUT_STYLE, flex: 1 }}
                                        value={filters.maxPrice || ''}
                                        onChange={e => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
                                        onFocus={e => e.target.style.borderColor = '#c9a959'}
                                        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </div>

                            {/* Material */}
                            <div style={{ marginBottom: '28px' }}>
                                <label style={LABEL_STYLE}>{t('material')}</label>
                                <select
                                    style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'auto' }}
                                    value={filters.material || ''}
                                    onChange={e => handleFilterChange('material', e.target.value || undefined)}
                                    onFocus={e => e.target.style.borderColor = '#c9a959'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
                                onClick={() => { setFilters({ sortBy: 'newest' }); setCurrentPage(1); }}
                                style={{ width: '100%', padding: '11px', border: '2px solid #1a1a2e', background: 'transparent', color: '#1a1a2e', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; }}
                            >
                                {t('clearFilters')}
                            </button>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div style={{ flex: '3 1 400px', minWidth: 0 }}>
                        {/* Sort Bar */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ color: '#6b7280', fontWeight: 500, fontSize: '0.9rem' }}>
                                {loading ? tCommon('loading') : `${products.length} ${t('productsCount')}`}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280', whiteSpace: 'nowrap' }}>
                                    {locale === 'ar' ? 'ترتيب حسب' : 'Sort by'}
                                </label>
                                <select
                                    style={{ padding: '8px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: 'white', cursor: 'pointer', color: '#1a1a2e', transition: 'border-color 0.2s' }}
                                    value={filters.sortBy || 'newest'}
                                    onChange={e => handleFilterChange('sortBy', e.target.value)}
                                    onFocus={e => e.target.style.borderColor = '#c9a959'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
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
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '20px' }}>
                                {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : products.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', background: 'white', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                                <div style={{ width: '80px', height: '80px', background: '#f7f5f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                    <span style={{ fontSize: '2rem' }}>🔍</span>
                                </div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
                                    {t('noProducts')}
                                </h3>
                                <p style={{ color: '#6b7280', maxWidth: '320px', textAlign: 'center' }}>
                                    {t('tryAdjusting')}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: '20px' }}>
                                    {products.map(product => (
                                        <ProductCard key={product.id} product={product} locale={locale} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px' }}>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, color: '#1a1a2e', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, transition: 'all 0.2s', fontSize: '0.875rem' }}
                                            onMouseEnter={e => { if (currentPage !== 1) e.currentTarget.style.borderColor = '#c9a959'; }}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                        >
                                            {t('previous')}
                                        </button>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    style={{
                                                        width: '40px', height: '40px', borderRadius: '8px', fontWeight: 600, border: '1.5px solid',
                                                        borderColor: page === currentPage ? '#1a1a2e' : '#e5e7eb',
                                                        background: page === currentPage ? '#1a1a2e' : 'white',
                                                        color: page === currentPage ? 'white' : '#1a1a2e',
                                                        cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem',
                                                    }}
                                                    onMouseEnter={e => { if (page !== currentPage) e.currentTarget.style.borderColor = '#c9a959'; }}
                                                    onMouseLeave={e => { if (page !== currentPage) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            style={{ padding: '8px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontWeight: 600, color: '#1a1a2e', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, transition: 'all 0.2s', fontSize: '0.875rem' }}
                                            onMouseEnter={e => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = '#c9a959'; }}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
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
    const [addingToCart, setAddingToCart] = useState(false);
    const [hovered, setHovered] = useState(false);
    const price = Number(product.price);
    const comparePrice = Number(product.comparePrice);
    const hasDiscount = comparePrice > price;
    const discountPercent = hasDiscount ? Math.round((1 - price / comparePrice) * 100) : 0;
    const firstVariant = product.variants?.[0];
    const inStock = product.variants?.some(v => v.stock > 0);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!firstVariant || !inStock) return;
        setAddingToCart(true);
        try {
            const res = await fetch(`/api/v1/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variantId: firstVariant.id, quantity: 1 }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`${product.name} added to cart!`);
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                toast.error(data.error || 'Failed to add to cart');
            }
        } catch {
            toast.error('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <Link
            href={`/${locale}/products/${product.slug}`}
            style={{
                textDecoration: 'none', display: 'block', background: 'white', borderRadius: '16px',
                overflow: 'hidden', border: '1px solid #e5e7eb',
                transform: hovered ? 'translateY(-4px)' : 'none',
                boxShadow: hovered ? '0 12px 32px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f7f5f2' }}>
                <img
                    src={product.images[0]?.standardUrl || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
                />
                {hasDiscount && (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', padding: '3px 8px', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, borderRadius: '6px', zIndex: 1 }}>
                        -{discountPercent}%
                    </span>
                )}
                {!inStock && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                        <span style={{ background: '#1a1a2e', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em' }}>OUT OF STOCK</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '16px 20px 20px' }}>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    {product.category?.name}
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#c9a959' }}>
                        {price.toLocaleString()} {tCommon('egp')}
                    </span>
                    {hasDiscount && (
                        <span style={{ fontSize: '0.875rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                            {comparePrice.toLocaleString()}
                        </span>
                    )}
                </div>

                {inStock ? (
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        style={{
                            width: '100%', padding: '10px', background: addingToCart ? '#9ca3af' : '#1a1a2e',
                            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600,
                            fontSize: '0.8rem', cursor: addingToCart ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s', letterSpacing: '0.04em',
                        }}
                        onMouseEnter={e => { if (!addingToCart) e.currentTarget.style.background = '#c9a959'; }}
                        onMouseLeave={e => { if (!addingToCart) e.currentTarget.style.background = '#1a1a2e'; }}
                    >
                        {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                    </button>
                ) : (
                    <div style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#9ca3af', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem', textAlign: 'center', letterSpacing: '0.04em' }}>
                        Out of Stock
                    </div>
                )}
            </div>
        </Link>
    );
}

function ProductCardSkeleton() {
    return (
        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div style={{ aspectRatio: '1', background: 'linear-gradient(90deg,#f7f5f2 25%,#ede9e3 50%,#f7f5f2 75%)', animation: 'pulse 1.5s infinite' }} />
            <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ height: '10px', width: '33%', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '18px', width: '75%', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '20px', width: '40%', background: '#e5e7eb', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '36px', background: '#e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s infinite', marginTop: '4px' }} />
            </div>
        </div>
    );
}
