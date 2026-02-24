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

    useEffect(() => { fetchCategories(); }, []);

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
        <div style={{ background: '#f7f5f2', minHeight: '100vh', paddingBottom: '96px' }}>

            {/* Hero */}
            <section style={{ background: '#1a1a2e', color: 'white', textAlign: 'center', paddingTop: '120px', paddingBottom: '80px', marginBottom: '64px' }}>
                <div className="container">
                    <h1 className="font-display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '20px', color: 'white' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.125rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section>
                <div className="container" style={{ maxWidth: '1280px' }}>
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
                            {Array(6).fill(0).map((_, i) => (
                                <div key={i} style={{ aspectRatio: '1', background: 'linear-gradient(90deg, #ede9e3 25%, #e5e0d8 50%, #ede9e3 75%)', borderRadius: '24px', animation: 'pulse 1.5s infinite' }} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                            {categories.map((category) => (
                                <CategoryCard key={category.id} category={category} locale={locale} t={t} />
                            ))}
                        </div>
                    )}

                    {/* Browse All Button */}
                    <div style={{ textAlign: 'center', marginTop: '80px' }}>
                        <Link
                            href={`/${locale}/products`}
                            style={{
                                display: 'inline-block', padding: '16px 48px', background: '#1a1a2e', color: 'white',
                                borderRadius: '12px', fontWeight: 700, fontSize: '1.125rem', textDecoration: 'none',
                                transition: 'background 0.2s', boxShadow: '0 4px 14px rgba(26,26,46,0.25)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#c9a959'}
                            onMouseLeave={e => e.currentTarget.style.background = '#1a1a2e'}
                        >
                            {t('browseAll')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function CategoryCard({ category, locale, t }: { category: Category, locale: string, t: any }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={`/${locale}/products?category=${category.slug}`}
            style={{
                position: 'relative', aspectRatio: '1', borderRadius: '24px', overflow: 'hidden',
                display: 'block', textDecoration: 'none', background: '#e5e7eb',
                boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.15)' : 'none', transition: 'box-shadow 0.4s ease',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Image
                src={category.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800'}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                style={{
                    objectFit: 'cover',
                    transform: hovered ? 'scale(1.08)' : 'scale(1)',
                    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
            />

            {/* Gradient Overlay */}
            <div style={{
                position: 'absolute', inset: 0,
                background: hovered
                    ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                    : 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
                transition: 'background 0.4s ease',
            }} />

            {/* Text Content */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px',
                display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10,
            }}>
                <h3 style={{
                    fontFamily: 'var(--font-display)', color: 'white', margin: 0,
                    fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.02em',
                    transform: hovered ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'transform 0.4s ease',
                }}>
                    {category.name}
                </h3>
                <p style={{
                    color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: '0.875rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    opacity: hovered ? 1 : 0,
                    transform: hovered ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'opacity 0.3s ease, transform 0.4s ease',
                    transitionDelay: hovered ? '0.1s' : '0s',
                }}>
                    {category._count?.products || 0} {t('products')} →
                </p>
            </div>
        </Link>
    );
}
