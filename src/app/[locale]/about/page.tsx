'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('about');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const localePath = (path: string) => `/${locale}${path}`;

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
                    <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto' }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Story */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: '#b8860b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.1em' }}>
                                {t('ourStory')}
                            </span>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginTop: '12px', marginBottom: '24px', color: '#1f2937' }}>
                                {t('storyTitle')}
                            </h2>
                            <p style={{ color: '#6b7280', lineHeight: 1.8, marginBottom: '16px' }}>
                                {t('storyP1')}
                            </p>
                            <p style={{ color: '#6b7280', lineHeight: 1.8 }}>
                                {t('storyP2')}
                            </p>
                        </div>
                        <div style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <img
                                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
                                alt="Furniture showroom"
                                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: '80px 0', background: '#f9fafb' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#1f2937' }}>{t('ourValues')}</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                        {[
                            { icon: '✨', title: t('designExcellence'), desc: t('designExcellenceDesc') },
                            { icon: '🛠️', title: t('qualityCraftsmanship'), desc: t('qualityCraftsmanshipDesc') },
                            { icon: '🌿', title: t('sustainability'), desc: t('sustainabilityDesc') },
                            { icon: '❤️', title: t('customerFirst'), desc: t('customerFirstDesc') },
                        ].map((value, i) => (
                            <div key={i} style={{
                                background: 'white',
                                padding: '32px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                border: '1px solid #e5e7eb',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{value.icon}</div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#1f2937' }}>{value.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.7 }}>{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{
                background: 'linear-gradient(135deg, #b8860b 0%, #d4a853 100%)',
                padding: '80px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'white', marginBottom: '16px' }}>
                        {t('ctaTitle')}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>
                        {t('ctaDescription')}
                    </p>
                    <Link href={localePath('/products')} style={{
                        display: 'inline-block',
                        padding: '16px 40px',
                        background: '#1f2937',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>
                        {tCommon('shop')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
