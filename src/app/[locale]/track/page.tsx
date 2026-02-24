'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface OrderStatus {
    id: string;
    orderNumber: string;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    createdAt: string;
    estimatedDelivery?: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
}

export default function TrackPage() {
    const t = useTranslations('track');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const [orderNumber, setOrderNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<OrderStatus | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;
        setLoading(true);
        setError('');
        setOrder(null);
        try {
            const res = await fetch(`/api/v1/track/${encodeURIComponent(orderNumber)}`);
            const data = await res.json();
            if (data.success) setOrder(data.data);
            else setError(t('notFound'));
        } catch {
            setError(t('notFound'));
        } finally {
            setLoading(false);
        }
    };

    const statusSteps = [
        { key: 'PENDING', label: locale === 'ar' ? 'قيد الانتظار' : 'Order Placed', icon: '📦' },
        { key: 'PROCESSING', label: locale === 'ar' ? 'جاري التجهيز' : 'Processing', icon: '⚙️' },
        { key: 'SHIPPED', label: locale === 'ar' ? 'تم الشحن' : 'Shipped', icon: '🚚' },
        { key: 'DELIVERED', label: locale === 'ar' ? 'تم التوصيل' : 'Delivered', icon: '✅' },
    ];

    const getStatusIndex = (status: string) =>
        status === 'CANCELLED' ? -1 : statusSteps.findIndex(s => s.key === status);

    const statusColor = (status: string) => {
        switch (status) {
            case 'DELIVERED': return '#10b981';
            case 'CANCELLED': return '#ef4444';
            case 'SHIPPED': return '#3b82f6';
            case 'PROCESSING': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f7f5f2' }}>

            {/* Hero */}
            <section style={{ background: '#1a1a2e', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🚚</span>
                    <h1 className="font-display" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', maxWidth: '480px', margin: '0 auto' }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '60px 0 80px' }}>
                <div className="container" style={{ maxWidth: '640px' }}>

                    {/* Search Form */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1a1a2e', marginBottom: '12px' }}>
                            {t('orderNumber')}
                        </label>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder={t('placeholder')}
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '0.95rem', color: '#1a1a2e', outline: 'none', transition: 'border-color 0.2s', background: 'white' }}
                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ padding: '12px 28px', background: loading ? '#9ca3af' : '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#c9a959'; }}
                                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1a1a2e'; }}
                            >
                                {loading ? t('tracking') : t('trackButton')}
                            </button>
                        </form>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '8px' }}>
                                {t('notFound')}
                            </h3>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('notFoundDesc')}</p>
                        </div>
                    )}

                    {/* Order Result */}
                    {order && (
                        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ background: '#1a1a2e', color: 'white', padding: '28px', textAlign: 'center' }}>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                                    {t('orderNumber')}
                                </p>
                                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, letterSpacing: '0.06em' }}>
                                    #{order.orderNumber}
                                </p>
                            </div>

                            <div style={{ padding: '32px' }}>
                                {/* Meta Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '16px', background: '#f9f8f5', borderRadius: '14px', padding: '20px', marginBottom: '32px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                            {t('orderDate')}
                                        </p>
                                        <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.875rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                            {t('status')}
                                        </p>
                                        <p style={{ fontWeight: 700, color: statusColor(order.status), fontSize: '0.875rem' }}>
                                            {statusSteps.find(s => s.key === order.status)?.label || order.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                            {locale === 'ar' ? 'الإجمالي' : 'Total'}
                                        </p>
                                        <p style={{ fontWeight: 700, color: '#c9a959', fontSize: '0.875rem' }}>
                                            {Number(order.total).toLocaleString()} {tCommon('egp')}
                                        </p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                {order.status !== 'CANCELLED' && (
                                    <div style={{ marginBottom: '32px', position: 'relative' }}>
                                        {/* Connector line background */}
                                        <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', background: '#e5e7eb', borderRadius: '2px', zIndex: 0 }}>
                                            <div style={{
                                                height: '100%', background: '#10b981', borderRadius: '2px',
                                                width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%`,
                                                transition: 'width 0.7s ease',
                                            }} />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                                            {statusSteps.map((step, i) => {
                                                const isComplete = i <= getStatusIndex(order.status);
                                                const isCurrent = i === getStatusIndex(order.status);
                                                return (
                                                    <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{
                                                            width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                                                            border: `2px solid ${isComplete ? '#10b981' : '#e5e7eb'}`,
                                                            background: isComplete ? '#10b981' : 'white',
                                                            boxShadow: isCurrent ? '0 0 0 4px rgba(16,185,129,0.2)' : '0 1px 4px rgba(0,0,0,0.05)',
                                                            transition: 'all 0.3s',
                                                        }}>
                                                            {step.icon}
                                                        </div>
                                                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: isComplete ? '#10b981' : '#9ca3af', textAlign: 'center', maxWidth: '72px', lineHeight: 1.3 }}>
                                                            {step.label}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Cancelled Banner */}
                                {order.status === 'CANCELLED' && (
                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>❌</span>
                                        <p style={{ fontWeight: 700, color: '#ef4444' }}>
                                            {locale === 'ar' ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}
                                        </p>
                                    </div>
                                )}

                                {/* Items */}
                                <div>
                                    <h3 style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                                        {tCommon('items')}
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                        {order.items.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                <span style={{ fontWeight: 500, color: '#1a1a2e', fontSize: '0.9rem' }}>
                                                    {item.name} <span style={{ color: '#9ca3af' }}>× {item.quantity}</span>
                                                </span>
                                                <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>
                                                    {Number(item.price * item.quantity).toLocaleString()} {tCommon('egp')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f3f4f6', paddingTop: '20px', marginTop: '12px' }}>
                                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: '#1a1a2e' }}>
                                            {locale === 'ar' ? 'الإجمالي' : 'Total'}
                                        </span>
                                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: '#c9a959' }}>
                                            {Number(order.total).toLocaleString()} {tCommon('egp')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Back Link */}
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link
                            href={`/${locale}`}
                            style={{ color: '#9ca3af', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#c9a959'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                        >
                            ← {tCommon('backToHome')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
