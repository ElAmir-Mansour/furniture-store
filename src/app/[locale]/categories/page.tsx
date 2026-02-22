'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

interface Category {
    id: string;
    name: string;
    slug: string;
    image?: string;
    _count?: { products: number };
}

export default function CategoriesPage() {
    const t = useTranslations('categories');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const res = await fetch('/api/v1/categories');
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                color: 'white',
                padding: '80px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>{t('title')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>{t('subtitle')}</p>
                </div>
            </section>

            {/* Categories Grid */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} className="skeleton" style={{ aspectRatio: '1', borderRadius: '16px' }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/${locale}/products?category=${category.slug}`}
                                    style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        textDecoration: 'none',
                                        display: 'block',
                                    }}
                                >
                                    <Image
                                        src={category.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600'}
                                        alt={category.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 300px"
                                        className="object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'flex-end',
                                        padding: '24px',
                                    }}>
                                        <h3 style={{
                                            color: 'white',
                                            fontSize: '1.5rem',
                                            fontWeight: 600,
                                            marginBottom: '8px',
                                        }}>
                                            {category.name}
                                        </h3>
                                        <p style={{
                                            color: 'rgba(255,255,255,0.7)',
                                            fontSize: '0.875rem',
                                        }}>
                                            {category._count?.products || 0} {t('products')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Browse All Button */}
                    <div style={{ textAlign: 'center', marginTop: '48px' }}>
                        <Link href={`/${locale}/products`} style={{
                            display: 'inline-block',
                            padding: '16px 40px',
                            background: '#1f2937',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 600,
                        }}>
                            {t('browseAll')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
