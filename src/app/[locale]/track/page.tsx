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
    items: Array<{
        name: string;
        quantity: number;
        price: number;
    }>;
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

            if (data.success) {
                setOrder(data.data);
            } else {
                setError(t('notFound'));
            }
        } catch (err) {
            console.error('Track error:', err);
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

    const getStatusIndex = (status: string) => {
        if (status === 'CANCELLED') return -1;
        return statusSteps.findIndex(s => s.key === status);
    };

    return (
        <div style={{ minHeight: '80vh', background: '#f9fafb' }}>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                color: 'white',
                padding: '80px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Track Form */}
            <section style={{ padding: '60px 0' }}>
                <div className="container" style={{ maxWidth: 600 }}>
                    <form onSubmit={handleSubmit} style={{
                        background: 'white',
                        padding: '32px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '8px',
                            color: '#1f2937',
                        }}>
                            {t('orderNumber')}
                        </label>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                className="input input-lg"
                                placeholder={t('placeholder')}
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '0 32px',
                                    background: '#1f2937',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {loading ? t('tracking') : t('trackButton')}
                            </button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && (
                        <div style={{
                            marginTop: '24px',
                            padding: '24px',
                            background: '#fef2f2',
                            borderRadius: '12px',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                            <h3 style={{ color: '#991b1b', marginBottom: '8px' }}>{t('notFound')}</h3>
                            <p style={{ color: '#6b7280' }}>{t('notFoundDesc')}</p>
                        </div>
                    )}

                    {/* Order Result */}
                    {order && (
                        <div style={{
                            marginTop: '32px',
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                        }}>
                            <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: '#1f2937' }}>
                                {t('orderDetails')}
                            </h2>

                            {/* Order Info */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '16px',
                                marginBottom: '32px',
                                padding: '16px',
                                background: '#f9fafb',
                                borderRadius: '12px',
                            }}>
                                <div>
                                    <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{t('orderNumber')}</p>
                                    <p style={{ fontWeight: 600, color: '#1f2937' }}>{order.orderNumber}</p>
                                </div>
                                <div>
                                    <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{t('orderDate')}</p>
                                    <p style={{ fontWeight: 600, color: '#1f2937' }}>
                                        {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: '#6b7280', fontSize: '0.75rem' }}>{t('status')}</p>
                                    <p style={{
                                        fontWeight: 600,
                                        color: order.status === 'DELIVERED' ? '#10b981' :
                                            order.status === 'CANCELLED' ? '#ef4444' : '#b8860b'
                                    }}>
                                        {statusSteps.find(s => s.key === order.status)?.label || order.status}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline */}
                            {order.status !== 'CANCELLED' && (
                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        position: 'relative',
                                    }}>
                                        {/* Progress line */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '24px',
                                            left: '40px',
                                            right: '40px',
                                            height: '4px',
                                            background: '#e5e7eb',
                                            zIndex: 0,
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%`,
                                                background: '#10b981',
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>

                                        {statusSteps.map((step, i) => {
                                            const isComplete = i <= getStatusIndex(order.status);
                                            const isCurrent = i === getStatusIndex(order.status);
                                            return (
                                                <div key={step.key} style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    zIndex: 1,
                                                }}>
                                                    <div style={{
                                                        width: 48,
                                                        height: 48,
                                                        borderRadius: '50%',
                                                        background: isComplete ? '#10b981' : 'white',
                                                        border: `3px solid ${isComplete ? '#10b981' : '#e5e7eb'}`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '1.25rem',
                                                        boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none',
                                                    }}>
                                                        {step.icon}
                                                    </div>
                                                    <p style={{
                                                        marginTop: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: isCurrent ? 600 : 400,
                                                        color: isComplete ? '#10b981' : '#6b7280',
                                                    }}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: '#1f2937' }}>
                                    {tCommon('items')}
                                </h3>
                                {order.items.map((item, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '12px 0',
                                        borderBottom: i < order.items.length - 1 ? '1px solid #e5e7eb' : 'none',
                                    }}>
                                        <span style={{ color: '#1f2937' }}>
                                            {item.name} × {item.quantity}
                                        </span>
                                        <span style={{ fontWeight: 600, color: '#1f2937' }}>
                                            {Number(item.price * item.quantity).toLocaleString()} {tCommon('egp')}
                                        </span>
                                    </div>
                                ))}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginTop: '16px',
                                    paddingTop: '16px',
                                    borderTop: '2px solid #e5e7eb',
                                }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                                        {locale === 'ar' ? 'الإجمالي' : 'Total'}
                                    </span>
                                    <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#b8860b' }}>
                                        {Number(order.total).toLocaleString()} {tCommon('egp')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Back link */}
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                        <Link href={`/${locale}`} style={{ color: '#6b7280', textDecoration: 'none' }}>
                            {tCommon('backToHome')}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
