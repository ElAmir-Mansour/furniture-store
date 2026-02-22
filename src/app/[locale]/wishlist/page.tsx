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
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '40px 24px 60px',
                minHeight: '80vh',
            }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>{tCommon('loading')}</div>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '40px 24px 60px',
            minHeight: '80vh',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '32px',
            }}>
                <div>
                    <Link href={`/${locale}`} style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.875rem' }}>
                        {tCommon('backToHome')}
                    </Link>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, marginTop: '8px' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>
                        {items.length} {items.length === 1 ? tCommon('item') : tCommon('items')}
                    </p>
                </div>
            </div>

            {items.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 24px',
                    background: '#f9fafb',
                    borderRadius: '16px',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💝</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '8px' }}>
                        {t('empty')}
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                        {t('emptyDescription')}
                    </p>
                    <Link
                        href={`/${locale}/products`}
                        style={{
                            display: 'inline-block',
                            padding: '14px 32px',
                            background: '#1f2937',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 600,
                            textDecoration: 'none',
                        }}
                    >
                        {t('browseProducts')}
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                }}>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <Link href={`/${locale}/products/${item.slug}`} style={{ textDecoration: 'none' }}>
                                <div style={{
                                    aspectRatio: '1',
                                    background: '#f9fafb',
                                    position: 'relative',
                                }}>
                                    <Image
                                        src={item.image || 'https://via.placeholder.com/400'}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 300px"
                                        className="object-cover"
                                    />
                                </div>
                            </Link>
                            <div style={{ padding: '16px' }}>
                                <Link
                                    href={`/${locale}/products/${item.slug}`}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                    }}
                                >
                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        marginBottom: '8px',
                                        color: '#1f2937',
                                    }}>
                                        {item.name}
                                    </h3>
                                </Link>
                                <p style={{
                                    fontSize: '1.125rem',
                                    fontWeight: 700,
                                    color: '#b8860b',
                                    marginBottom: '16px',
                                }}>
                                    {Number(item.price).toLocaleString()} {tCommon('egp')}
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link
                                        href={`/${locale}/products/${item.slug}`}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: '#1f2937',
                                            color: 'white',
                                            borderRadius: '8px',
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                            textAlign: 'center',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        {tProduct('viewProduct')}
                                    </Link>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            background: '#fef2f2',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ef4444',
                                        }}
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
    );
}
