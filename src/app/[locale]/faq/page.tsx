'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function FAQPage() {
    const t = useTranslations('faq');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqCategories = locale === 'ar' ? [
        {
            title: 'الطلبات والشحن',
            items: [
                { q: 'كم يستغرق توصيل طلبي؟', a: 'الشحن القياسي يستغرق 3-5 أيام عمل داخل القاهرة والجيزة. الشحن الإقليمي لباقي المحافظات يستغرق 5-7 أيام عمل.' },
                { q: 'هل تقدمون شحن مجاني؟', a: 'نعم! الشحن مجاني للطلبات التي تزيد عن 5,000 جنيه داخل مصر.' },
                { q: 'هل يمكنني تتبع طلبي؟', a: 'نعم، ستتلقى رابط تتبع بمجرد شحن طلبك. يمكنك أيضاً تتبع طلبك من صفحة "تتبع الطلب".' },
            ]
        },
        {
            title: 'الإرجاع والاسترداد',
            items: [
                { q: 'ما هي سياسة الإرجاع لديكم؟', a: 'نقدم سياسة إرجاع لمدة 30 يوماً. يجب أن تكون المنتجات في حالتها الأصلية مع جميع الملصقات.' },
                { q: 'كيف أبدأ عملية الإرجاع؟', a: 'تواصل مع خدمة العملاء عبر صفحة اتصل بنا أو اتصل بنا وسنرتب لاستلام المنتج.' },
                { q: 'متى سأستلم المبلغ المسترد؟', a: 'يتم معالجة المبالغ المستردة خلال 5-7 أيام عمل بعد استلام المنتج المرتجع.' },
            ]
        },
        {
            title: 'المنتجات والتركيب',
            items: [
                { q: 'هل تقدمون خدمة التركيب؟', a: 'نعم! يمكنك إضافة خدمة التركيب الاحترافية عند الدفع مقابل رسوم إضافية.' },
                { q: 'هل الأثاث يأتي مركباً؟', a: 'معظم القطع الكبيرة تتطلب تركيب. ستجد تعليمات واضحة، أو يمكنك طلب خدمة التركيب.' },
                { q: 'ماذا لو استلمت منتجاً تالفاً؟', a: 'تواصل معنا فوراً مع صور للضرر وسنرسل بديلاً أو نرتب استرداد كامل المبلغ.' },
            ]
        },
        {
            title: 'الدفع',
            items: [
                { q: 'ما طرق الدفع المتاحة؟', a: 'نقبل بطاقات الائتمان/الخصم، المحافظ الإلكترونية، والدفع عند الاستلام.' },
                { q: 'هل معلومات الدفع آمنة؟', a: 'نعم، جميع المعاملات مشفرة ومعالجة بشكل آمن.' },
                { q: 'هل يمكنني الدفع بالتقسيط؟', a: 'نعم، نقدم خيارات تقسيط من خلال شركائنا البنكيين للطلبات المؤهلة.' },
            ]
        },
    ] : [
        {
            title: 'Orders & Shipping',
            items: [
                { q: 'How long does delivery take?', a: 'Standard shipping takes 3-5 business days within Cairo and Giza. Regional shipping to other governorates takes 5-7 business days.' },
                { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on orders over 5,000 EGP within Egypt.' },
                { q: 'Can I track my order?', a: 'Yes, you will receive a tracking link once your order ships. You can also track your order from the "Track Order" page.' },
            ]
        },
        {
            title: 'Returns & Refunds',
            items: [
                { q: 'What is your return policy?', a: 'We offer a 30-day return policy. Items must be in original condition with all tags attached.' },
                { q: 'How do I initiate a return?', a: 'Contact our customer service via the Contact page or call us, and we will arrange pickup.' },
                { q: 'When will I receive my refund?', a: 'Refunds are processed within 5-7 business days after receiving the returned item.' },
            ]
        },
        {
            title: 'Products & Assembly',
            items: [
                { q: 'Do you offer assembly service?', a: 'Yes! You can add professional assembly service at checkout for an additional fee.' },
                { q: 'Does furniture come assembled?', a: 'Most large pieces require assembly. You will receive clear instructions, or you can request our assembly service.' },
                { q: 'What if I receive a damaged product?', a: 'Contact us immediately with photos of the damage and we will send a replacement or arrange a full refund.' },
            ]
        },
        {
            title: 'Payment',
            items: [
                { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards, mobile wallets, and cash on delivery.' },
                { q: 'Is my payment information secure?', a: 'Yes, all transactions are encrypted and processed securely.' },
                { q: 'Can I pay in installments?', a: 'Yes, we offer installment options through our banking partners for qualifying orders.' },
            ]
        },
    ];

    let globalIndex = 0;

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

            {/* FAQ Content */}
            <section style={{ padding: '80px 0' }}>
                <div className="container" style={{ maxWidth: 900 }}>
                    {faqCategories.map((category, catIndex) => (
                        <div key={catIndex} style={{ marginBottom: '48px' }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: 600,
                                color: '#1f2937',
                                marginBottom: '24px',
                                paddingBottom: '12px',
                                borderBottom: '2px solid #e5e7eb',
                            }}>
                                {category.title}
                            </h2>
                            {category.items.map((item) => {
                                const idx = globalIndex++;
                                const isOpen = openIndex === idx;
                                return (
                                    <div key={idx} style={{
                                        marginBottom: '12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                    }}>
                                        <button
                                            onClick={() => setOpenIndex(isOpen ? null : idx)}
                                            style={{
                                                width: '100%',
                                                padding: '20px 24px',
                                                background: isOpen ? '#f9fafb' : 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                textAlign: locale === 'ar' ? 'right' : 'left',
                                            }}
                                        >
                                            <span style={{ fontWeight: 500, color: '#1f2937', fontSize: '1rem' }}>
                                                {item.q}
                                            </span>
                                            <span style={{
                                                fontSize: '1.25rem',
                                                color: '#6b7280',
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 0.2s',
                                            }}>
                                                ▼
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div style={{
                                                padding: '0 24px 20px',
                                                color: '#6b7280',
                                                lineHeight: 1.7,
                                            }}>
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{
                background: '#f9fafb',
                padding: '60px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1f2937' }}>{t('stillQuestions')}</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>{t('supportHelp')}</p>
                    <Link href={`/${locale}/contact`} style={{
                        display: 'inline-block',
                        padding: '14px 32px',
                        background: '#1f2937',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}>
                        {t('contactUs')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
