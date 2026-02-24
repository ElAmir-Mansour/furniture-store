'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
    const t = useTranslations('footer');
    const tNav = useTranslations('nav');
    const tCommon = useTranslations('common');
    const locale = useLocale();

    return (
        <footer style={{ background: '#0a0a14', padding: '96px 0 48px', color: 'white' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px', paddingBottom: '80px' }}>

                    {/* Brand & Description */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 500, margin: '0 0 32px 0', letterSpacing: '-0.025em' }}>
                            {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}<span style={{ color: '#c9a959' }}>.</span>
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem', lineHeight: 1.625, margin: '0 0 32px 0', maxWidth: '384px', fontWeight: 300 }}>
                            {t('description')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ color: 'white', fontWeight: 500, margin: '0 0 32px 0', letterSpacing: '0.025em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            {tNav('quickLinks')}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: tCommon('shop'), href: '/products' },
                                { label: tCommon('categories'), href: '/categories' },
                                { label: tCommon('about'), href: '/about' },
                                { label: tCommon('contact'), href: '/contact' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={`/${locale}${link.href}`}
                                        style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a959')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 style={{ color: 'white', fontWeight: 500, margin: '0 0 32px 0', letterSpacing: '0.025em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            {tNav('customerService')}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: tNav('faq'), href: '/faq' },
                                { label: tNav('shipping'), href: '/shipping' },
                                { label: tNav('returns'), href: '/returns' },
                                { label: tNav('trackOrder'), href: '/track' },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={`/${locale}${link.href}`}
                                        style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none', fontSize: '0.875rem', transition: 'color 0.2s' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#c9a959')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)')}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 style={{ color: 'white', fontWeight: 500, margin: '0 0 32px 0', letterSpacing: '0.025em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            {tNav('contactInfo')}
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', gap: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.25rem' }}>📍</span>
                                <span>{t('address')}</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.25rem' }}>📞</span>
                                <span>{t('phone')}</span>
                            </li>
                            <li style={{ display: 'flex', gap: '12px', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.25rem' }}>✉️</span>
                                <span>{t('email')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div style={{ paddingTop: '32px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
                    <p style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.75rem', fontWeight: 300, margin: 0 }}>
                        {t('copyright')}
                    </p>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '0.625rem', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            Secure Checkout by Paymob
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
