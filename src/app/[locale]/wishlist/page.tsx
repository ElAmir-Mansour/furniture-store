'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { getWishlist, removeFromWishlist, WishlistItem } from '@/lib/wishlist';

export default function WishlistPage() {
    const t = useTranslations('wishlist');
    const tCommon = useTranslations('common');
    const tProduct = useTranslations('product');
    const locale = useLocale();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setItems(getWishlist());

        const handleUpdate = () => setItems(getWishlist());
        window.addEventListener('wishlistUpdated', handleUpdate);
        return () => window.removeEventListener('wishlistUpdated', handleUpdate);
    }, []);

    const handleRemove = (productId: string) => {
        removeFromWishlist(productId);
    };

    if (!mounted) {
        return (
            <div className="section min-h-[80vh] bg-bg-alt">
                <div className="container">
                    <div className="skeleton h-12 w-48 rounded-xl mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="skeleton h-72 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: '#f7f5f2', minHeight: '60vh', padding: '60px 0' }}>
            <div className="container">
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <Link href={`/${locale}`} style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: '12px' }}>
                        ← {tCommon('backToHome')}
                    </Link>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '6px' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: '#6b7280', fontWeight: 500 }}>
                        {items.length} {items.length === 1 ? tCommon('item') : tCommon('items')}
                    </p>
                </div>

                {items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '24px', border: '2px dashed #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '5rem', marginBottom: '24px' }}>💝</div>
                        <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>{t('empty')}</h2>
                        <p style={{ color: '#6b7280', marginBottom: '36px', maxWidth: '360px', margin: '0 auto 36px' }}>{t('emptyDescription')}</p>
                        <Link href={`/${locale}/products`} style={{ display: 'inline-block', background: '#1a1a2e', color: 'white', padding: '13px 36px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                            {t('browseProducts')}
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                            >
                                <Link href={`/${locale}/products/${item.slug}`} style={{ display: 'block' }}>
                                    <div style={{ aspectRatio: '1', background: '#f7f5f2', position: 'relative', overflow: 'hidden' }}>
                                        <Image
                                            src={item.image || 'https://via.placeholder.com/400'}
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 300px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </Link>

                                <div style={{ padding: '20px' }}>
                                    <Link href={`/${locale}/products/${item.slug}`} style={{ textDecoration: 'none' }}>
                                        <h3 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c9a959', marginBottom: '20px' }}>
                                        {Number(item.price).toLocaleString()} {tCommon('egp')}
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Link
                                            href={`/${locale}/products/${item.slug}`}
                                            style={{ flex: 1, textAlign: 'center', background: '#1a1a2e', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}
                                        >
                                            {tProduct('viewProduct')}
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(item.id)}
                                            style={{ width: '40px', height: '40px', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                            title={tCommon('remove')}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
