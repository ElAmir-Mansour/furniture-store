'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function ReturnsPage() {
    const t = useTranslations('returns');
    const locale = useLocale();

    const conditions = [
        { icon: '📦', title: t('originalPackaging'), desc: t('originalPackagingDesc') },
        { icon: '✨', title: t('unusedCondition'), desc: t('unusedConditionDesc') },
        { icon: '🏷️', title: t('tagsAttached'), desc: t('tagsAttachedDesc') },
        { icon: '🧾', title: t('proofOfPurchase'), desc: t('proofOfPurchaseDesc') },
    ];

    const howToReturn = locale === 'ar' ? [
        { step: '1', title: 'تواصل معنا', desc: 'اتصل بخدمة العملاء أو أرسل بريد إلكتروني لبدء عملية الإرجاع.' },
        { step: '2', title: 'احصل على رقم الإرجاع', desc: 'ستتلقى رقم إرجاع وتعليمات التغليف.' },
        { step: '3', title: 'جهز المنتج', desc: 'أعد تغليف المنتج في عبوته الأصلية.' },
        { step: '4', title: 'الاستلام', desc: 'سنرسل مندوب لاستلام المنتج أو يمكنك توصيله لأقرب فرع.' },
    ] : [
        { step: '1', title: 'Contact Us', desc: 'Call our customer service or send an email to initiate the return.' },
        { step: '2', title: 'Get Return Number', desc: 'You will receive a return authorization number and packing instructions.' },
        { step: '3', title: 'Pack the Item', desc: 'Repack the item in its original packaging.' },
        { step: '4', title: 'Pickup', desc: 'We will send a courier to pick up the item or you can drop it at our nearest branch.' },
    ];

    const refundTimeline = [
        { method: t('creditCard'), time: locale === 'ar' ? '5-7 أيام عمل' : '5-7 business days' },
        { method: t('mobileWallet'), time: locale === 'ar' ? '3-5 أيام عمل' : '3-5 business days' },
        { method: t('bankTransfer'), time: locale === 'ar' ? '7-10 أيام عمل' : '7-10 business days' },
    ];

    const nonReturnable = locale === 'ar'
        ? ['المنتجات المخصصة حسب الطلب', 'المفروشات والوسائد المستخدمة', 'منتجات التخفيضات النهائية', 'المنتجات التي تم تركيبها']
        : ['Custom-made items', 'Used mattresses and pillows', 'Final sale items', 'Items that have been assembled'];

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

            {/* Guarantee Banner */}
            <section style={{ padding: '60px 0' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                        padding: '40px',
                        borderRadius: '16px',
                        border: '1px solid #a7f3d0',
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px', color: '#065f46' }}>
                            {t('guaranteeTitle')}
                        </h2>
                        <p style={{ color: '#047857', lineHeight: 1.7 }}>{t('guaranteeDesc')}</p>
                    </div>
                </div>
            </section>

            {/* Conditions */}
            <section style={{ padding: '60px 0', background: '#f9fafb' }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '48px', color: '#1f2937' }}>
                        {t('conditions')}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                        {conditions.map((condition, i) => (
                            <div key={i} style={{
                                background: 'white',
                                padding: '24px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                border: '1px solid #e5e7eb',
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{condition.icon}</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
                                    {condition.title}
                                </h3>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{condition.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Return */}
            <section style={{ padding: '80px 0' }}>
                <div className="container" style={{ maxWidth: 700 }}>
                    <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '48px', color: '#1f2937' }}>
                        {t('howToReturn')}
                    </h2>
                    {howToReturn.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            gap: '20px',
                            marginBottom: '24px',
                            alignItems: 'flex-start',
                        }}>
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: '#b8860b',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                flexShrink: 0,
                            }}>
                                {item.step}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '4px', color: '#1f2937' }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: '#6b7280' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Refund Timeline */}
            <section style={{ padding: '60px 0', background: '#f9fafb' }}>
                <div className="container" style={{ maxWidth: 600 }}>
                    <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '32px', color: '#1f2937' }}>
                        {t('refundTimeline')}
                    </h2>
                    {refundTimeline.map((item, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '16px 0',
                            borderBottom: i < refundTimeline.length - 1 ? '1px solid #e5e7eb' : 'none',
                        }}>
                            <span style={{ color: '#1f2937' }}>{item.method}</span>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>{item.time}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Non-Returnable */}
            <section style={{ padding: '60px 0' }}>
                <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', color: '#1f2937' }}>{t('nonReturnable')}</h2>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {nonReturnable.map((item, i) => (
                            <li key={i} style={{
                                padding: '12px',
                                background: '#fef2f2',
                                marginBottom: '8px',
                                borderRadius: '8px',
                                color: '#991b1b',
                                fontSize: '0.875rem',
                            }}>
                                ✕ {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                padding: '60px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'white' }}>{t('needHelp')}</h2>
                    <Link href={`/${locale}/contact`} style={{
                        display: 'inline-block',
                        marginTop: '16px',
                        padding: '14px 32px',
                        background: '#b8860b',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>
                        {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                    </Link>
                </div>
            </section>
        </div>
    );
}
