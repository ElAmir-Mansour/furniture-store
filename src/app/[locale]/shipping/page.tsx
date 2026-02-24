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
            <section style={{ background: '#1a1a2e', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🚚</span>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', color: 'white' }}>{t('title')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto' }}>{t('subtitle')}</p>
                </div>
            </section>

            {/* Free Shipping Banner */}
            <section className="bg-secondary/10 border-y border-secondary/20 py-5 text-center">
                <div className="container">
                    <p className="text-secondary font-bold text-lg">
                        🎉 {locale === 'ar' ? 'شحن مجاني للطلبات فوق 5,000 جنيه' : 'Free shipping on orders over 5,000 EGP'}
                    </p>
                </div>
            </section>

            {/* Shipping Options */}
            <section className="section bg-bg-alt">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="font-display text-3xl font-bold text-primary">{t('options')}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {shippingOptions.map((option, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-border-light p-8 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <div className="text-5xl mb-5">{option.icon}</div>
                                <h3 className="font-display text-xl font-bold text-primary mb-2">{option.type}</h3>
                                <p className="text-text-muted mb-5">{option.time}</p>
                                <span className="inline-block px-6 py-2 bg-secondary/10 rounded-full font-bold text-secondary">
                                    {option.price}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Delivery Process */}
            <section className="section bg-bg">
                <div className="container max-w-2xl">
                    <h2 className="font-display text-3xl font-bold text-primary text-center mb-12">{t('deliveryProcess')}</h2>
                    <div className="space-y-8">
                        {deliverySteps.map((step, i) => (
                            <div key={i} className="flex gap-5 items-start">
                                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                                    {step.icon}
                                </div>
                                <div className="pt-1">
                                    <h3 className="font-display text-lg font-bold text-primary mb-1">{step.title}</h3>
                                    <p className="text-text-muted leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Assembly Section */}
            <section className="section bg-bg-alt text-center">
                <div className="container max-w-xl">
                    <div className="text-6xl mb-6">🛠️</div>
                    <h2 className="font-display text-3xl font-bold text-primary mb-4">{t('assembly')}</h2>
                    <p className="text-text-muted leading-relaxed">{t('assemblyDesc')}</p>
                </div>
            </section>

            {/* CTA */}
            <section style={{ background: '#c9a959', padding: '80px 0', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '640px' }}>
                    <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>{t('questionsShipping')}</h2>
                    <Link href={`/${locale}/contact`} style={{ display: 'inline-block', background: '#1a1a2e', color: 'white', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                        {t('contactSupport')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
