'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('about');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const localePath = (path: string) => `/${locale}${path}`;

    const values = [
        { icon: '✨', title: t('designExcellence'), desc: t('designExcellenceDesc') },
        { icon: '🛠️', title: t('qualityCraftsmanship'), desc: t('qualityCraftsmanshipDesc') },
        { icon: '🌿', title: t('sustainability'), desc: t('sustainabilityDesc') },
        { icon: '❤️', title: t('customerFirst'), desc: t('customerFirstDesc') },
    ];

    return (
        <div style={{ background: '#f7f5f2', minHeight: '100vh' }}>
            {/* Hero */}
            <section style={{ background: '#1a1a2e', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <h1 className="font-display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto' }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Story */}
            <section style={{ padding: '80px 0', background: 'white' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
                        <div>
                            <span style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c9a959', marginBottom: '16px' }}>
                                {t('ourStory')}
                            </span>
                            <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px', lineHeight: 1.2 }}>
                                {t('storyTitle')}
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '20px' }}>
                                {t('storyP1')}
                            </p>
                            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.8 }}>
                                {t('storyP2')}
                            </p>
                        </div>
                        <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
                            <img
                                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"
                                alt="Furniture showroom"
                                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block', transition: 'transform 0.7s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section style={{ padding: '80px 0', background: '#f7f5f2' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                        <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#1a1a2e' }}>
                            {t('ourValues')}
                        </h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                        {values.map((value, i) => (
                            <div
                                key={i}
                                style={{ background: 'white', padding: '40px 28px', borderRadius: '20px', textAlign: 'center', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '24px' }}>{value.icon}</div>
                                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
                                    {value.title}
                                </h3>
                                <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '0.9rem' }}>
                                    {value.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '80px 0', background: '#c9a959', textAlign: 'center' }}>
                <div className="container">
                    <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                        {t('ctaTitle')}
                    </h2>
                    <p style={{ color: 'rgba(26,26,46,0.75)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                        {t('ctaDescription')}
                    </p>
                    <Link
                        href={localePath('/products')}
                        style={{ display: 'inline-block', background: '#1a1a2e', color: 'white', padding: '16px 48px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'transform 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                    >
                        {tCommon('shop')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
