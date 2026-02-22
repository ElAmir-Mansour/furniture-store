'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function ShippingPage() {
    const t = useTranslations('shipping');
    const locale = useLocale();

    const shippingOptions = [
        { type: t('standard'), time: t('standardTime'), price: locale === 'ar' ? '50 جنيه' : '50 EGP', icon: '📦' },
        { type: t('express'), time: t('expressTime'), price: locale === 'ar' ? '100 جنيه' : '100 EGP', icon: '🚀' },
        { type: t('regional'), time: t('regionalTime'), price: locale === 'ar' ? '75 جنيه' : '75 EGP', icon: '🗺️' },
    ];

    const deliverySteps = [
        { title: t('orderConfirmed'), desc: t('orderConfirmedDesc'), icon: '✓' },
        { title: t('processing'), desc: t('processingDesc'), icon: '⚙️' },
        { title: t('shipped'), desc: t('shippedDesc'), icon: '🚚' },
        { title: t('delivered'), desc: t('deliveredDesc'), icon: '🏠' },
    ];

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

            {/* Shipping Options */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '48px', color: '#1f2937' }}>
                        {t('options')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {shippingOptions.map((option, i) => (
                            <div key={i} style={{
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '16px',
                                padding: '32px',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{option.icon}</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
                                    {option.type}
                                </h3>
                                <p style={{ color: '#6b7280', marginBottom: '16px' }}>{option.time}</p>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '8px 24px',
                                    background: '#f9fafb',
                                    borderRadius: '20px',
                                    fontWeight: 600,
                                    color: '#b8860b',
                                }}>
                                    {option.price}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '24px', color: '#10b981', fontWeight: 500 }}>
                        {locale === 'ar' ? '🎉 شحن مجاني للطلبات فوق 5,000 جنيه' : '🎉 Free shipping on orders over 5,000 EGP'}
                    </p>
                </div>
            </section>

            {/* Delivery Process */}
            <section style={{ padding: '80px 0', background: '#f9fafb' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '48px', color: '#1f2937' }}>
                        {t('deliveryProcess')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: 700, margin: '0 auto' }}>
                        {deliverySteps.map((step, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                gap: '20px',
                                alignItems: 'flex-start',
                            }}>
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%',
                                    background: '#1f2937',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    flexShrink: 0,
                                }}>
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ color: '#6b7280', lineHeight: 1.7 }}>{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assembly Service */}
            <section style={{ padding: '80px 0' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🛠️</div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '16px', color: '#1f2937' }}>{t('assembly')}</h2>
                    <p style={{ color: '#6b7280', lineHeight: 1.8 }}>{t('assemblyDesc')}</p>
                </div>
            </section>

            {/* CTA */}
            <section style={{
                background: 'linear-gradient(135deg, #b8860b 0%, #d4a853 100%)',
                padding: '60px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'white' }}>{t('questionsShipping')}</h2>
                    <Link href={`/${locale}/contact`} style={{
                        display: 'inline-block',
                        marginTop: '16px',
                        padding: '14px 32px',
                        background: '#1f2937',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>
                        {t('contactSupport')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
