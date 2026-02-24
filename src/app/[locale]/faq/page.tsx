'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function FAQPage() {
    const t = useTranslations('faq');
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
            <section style={{ background: '#1a1a2e', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>💬</span>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, marginBottom: '16px', color: 'white' }}>{t('title')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto' }}>{t('subtitle')}</p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="section bg-bg-alt">
                <div className="container max-w-4xl">
                    {faqCategories.map((category, catIndex) => (
                        <div key={catIndex} className="mb-12">
                            <h2 className="font-display text-2xl font-bold text-primary mb-6 pb-4 border-b-2 border-secondary/30">
                                {category.title}
                            </h2>
                            <div className="space-y-3">
                                {category.items.map((item) => {
                                    const idx = globalIndex++;
                                    const isOpen = openIndex === idx;
                                    return (
                                        <div
                                            key={idx}
                                            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-secondary shadow-md' : 'border-border-light bg-white hover:border-border hover:shadow-sm'}`}
                                        >
                                            <button
                                                onClick={() => setOpenIndex(isOpen ? null : idx)}
                                                className={`w-full p-6 flex justify-between items-center text-start cursor-pointer border-none transition-colors ${isOpen ? 'bg-secondary/5' : 'bg-white'}`}
                                            >
                                                <span className="font-bold text-primary pr-6">{item.q}</span>
                                                <span className={`text-secondary text-xl shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-6 text-text-muted leading-relaxed border-t border-border-light bg-white pt-4">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ background: '#1a1a2e', padding: '80px 0', textAlign: 'center' }}>
                <div className="container" style={{ maxWidth: '640px' }}>
                    <h2 className="font-display" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 700, color: 'white', marginBottom: '16px' }}>{t('stillQuestions')}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: '32px' }}>{t('supportHelp')}</p>
                    <Link href={`/${locale}/contact`} style={{ display: 'inline-block', background: '#c9a959', color: '#1a1a2e', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                        {t('contactUs')}
                    </Link>
                </div>
            </section>
        </div>
    );
}
