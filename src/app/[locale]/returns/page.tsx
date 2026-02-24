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
            <section style={{ background: '#1a1a2e', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>↩️</span>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', color: 'white' }}>{t('title')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto' }}>{t('subtitle')}</p>
                </div>
            </section>

            {/* Guarantee Banner */}
            <section className="section bg-bg">
                <div className="container max-w-2xl">
                    <div className="bg-success/10 border border-success/30 rounded-3xl p-10 text-center">
                        <div className="text-6xl mb-5">✅</div>
                        <h2 className="font-display text-2xl font-bold text-primary mb-3">{t('guaranteeTitle')}</h2>
                        <p className="text-text-muted leading-relaxed">{t('guaranteeDesc')}</p>
                    </div>
                </div>
            </section>

            {/* Conditions */}
            <section className="section bg-bg-alt">
                <div className="container">
                    <h2 className="font-display text-3xl font-bold text-primary text-center mb-12">{t('conditions')}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {conditions.map((condition, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-border-light p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <div className="text-4xl mb-4">{condition.icon}</div>
                                <h3 className="font-bold text-primary mb-2">{condition.title}</h3>
                                <p className="text-text-muted text-sm">{condition.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How to Return */}
            <section className="section bg-bg">
                <div className="container max-w-2xl">
                    <h2 className="font-display text-3xl font-bold text-primary text-center mb-12">{t('howToReturn')}</h2>
                    <div className="space-y-6">
                        {howToReturn.map((item, i) => (
                            <div key={i} className="flex gap-5 items-start">
                                <div className="w-10 h-10 rounded-full bg-secondary text-primary flex items-center justify-center font-display font-bold text-lg shrink-0">
                                    {item.step}
                                </div>
                                <div className="pt-1">
                                    <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                                    <p className="text-text-muted">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Refund Timeline */}
            <section className="section bg-bg-alt">
                <div className="container max-w-lg">
                    <h2 className="font-display text-3xl font-bold text-primary text-center mb-10">{t('refundTimeline')}</h2>
                    <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
                        {refundTimeline.map((item, i) => (
                            <div key={i} className={`flex justify-between items-center px-6 py-5 ${i < refundTimeline.length - 1 ? 'border-b border-border-light' : ''}`}>
                                <span className="font-medium text-primary">{item.method}</span>
                                <span className="font-bold text-success">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Non-Returnable */}
            <section className="section bg-bg">
                <div className="container max-w-lg text-center">
                    <h2 className="font-display text-2xl font-bold text-primary mb-8">{t('nonReturnable')}</h2>
                    <ul className="space-y-3">
                        {nonReturnable.map((item, i) => (
                            <li key={i} className="flex items-center gap-3 p-4 bg-error/5 rounded-xl border border-error/10 text-error font-medium">
                                <span>✕</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* CTA */}
            <section style={{ background: '#1a1a2e', padding: '80px 0', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '640px' }}>
                    <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: 'white', marginBottom: '24px' }}>{t('needHelp')}</h2>
                    <Link href={`/${locale}/contact`} style={{ display: 'inline-block', background: '#c9a959', color: '#1a1a2e', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                        {locale === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                    </Link>
                </div>
            </section>
        </div>
    );
}
