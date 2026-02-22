'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderStatus {
    status: string;
    timestamp: string;
    note?: string;
}

interface Order {
    orderNumber: string;
    status: string;
    items: {
        productName: string;
        variantName: string;
        quantity: number;
        price: number;
    }[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    statusHistory: OrderStatus[];
    estimatedDelivery?: string;
    shippingAddress: {
        governorate: string;
        city: string;
        street: string;
    };
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div style={{ paddingTop: '120px', minHeight: '100vh' }}>
                <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
                    <div className="skeleton" style={{ height: 400 }} />
                </div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchOrder();
        }
    }, [token]);

    async function fetchOrder() {
        try {
            const res = await fetch(`/api/v1/track/${token}`);
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div style={{ paddingTop: '120px', minHeight: '100vh' }}>
                <div className="container" style={{ maxWidth: 700, textAlign: 'center' }}>
                    <div className="skeleton" style={{ height: 400 }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            <div className="container" style={{ maxWidth: 700 }}>
                {/* Success Icon */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                    <div style={{
                        width: 100,
                        height: 100,
                        margin: '0 auto var(--spacing-xl)',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: 'white',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                    }}>
                        ✓
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                        marginBottom: 'var(--spacing-md)',
                    }}>
                        Order Placed Successfully!
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: 400, margin: '0 auto' }}>
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>
                </div>

                {order && (
                    <>
                        {/* Order Number */}
                        <div style={{
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-xl)',
                            textAlign: 'center',
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            <p style={{ color: 'var(--color-text-muted)', marginBottom: 8 }}>Order Number</p>
                            <p style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                letterSpacing: '0.05em',
                            }}>
                                #{order.orderNumber}
                            </p>
                            <p style={{
                                display: 'inline-block',
                                marginTop: 'var(--spacing-md)',
                                padding: '8px 16px',
                                background: getStatusColor(order.status),
                                color: 'white',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}>
                                {formatStatus(order.status)}
                            </p>
                        </div>

                        {/* Order Details */}
                        <div style={{
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-xl)',
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Order Details</h3>

                            {order.items.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: 'var(--spacing-md) 0',
                                    borderBottom: i < order.items.length - 1 ? '1px solid var(--color-border)' : 'none',
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{item.productName}</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            {item.variantName} × {item.quantity}
                                        </p>
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{item.price.toLocaleString()} EGP</span>
                                </div>
                            ))}

                            <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                                    <span>{order.subtotal.toLocaleString()} EGP</span>
                                </div>
                                {order.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--color-success)' }}>
                                        <span>Discount</span>
                                        <span>-{order.discount.toLocaleString()} EGP</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                                    <span>{order.shippingFee === 0 ? 'Free' : `${order.shippingFee} EGP`}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--color-border)',
                                    fontWeight: 600,
                                    fontSize: '1.25rem',
                                }}>
                                    <span>Total</span>
                                    <span>{order.total.toLocaleString()} EGP</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div style={{
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-xl)',
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Delivery Address</h3>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.governorate}
                            </p>
                        </div>

                        {/* Order Status Timeline */}
                        {order.statusHistory && order.statusHistory.length > 0 && (
                            <div style={{
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-xl)',
                                marginBottom: 'var(--spacing-xl)',
                            }}>
                                <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Order Timeline</h3>

                                {order.statusHistory.map((history, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        gap: 'var(--spacing-lg)',
                                        marginBottom: i < order.statusHistory.length - 1 ? 'var(--spacing-lg)' : 0,
                                    }}>
                                        <div style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            background: i === 0 ? 'var(--color-secondary)' : 'var(--color-border)',
                                            marginTop: 4,
                                        }} />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 500 }}>{formatStatus(history.status)}</p>
                                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                {new Date(history.timestamp).toLocaleString('en-EG')}
                                            </p>
                                            {history.note && (
                                                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                    {history.note}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tracking Link */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-xl)',
                            textAlign: 'center',
                            color: 'white',
                        }}>
                            <p style={{ margin: '0 0 var(--spacing-sm)', opacity: 0.9 }}>Track your order anytime</p>
                            <p style={{
                                fontSize: '0.875rem',
                                fontFamily: 'var(--font-mono)',
                                background: 'rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-sm)',
                                display: 'inline-block',
                            }}>
                                {typeof window !== 'undefined' ? window.location.origin : ''}/track/{token}
                            </p>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    justifyContent: 'center',
                    marginTop: 'var(--spacing-2xl)',
                }}>
                    <Link href="/products" className="btn btn-outline btn-lg">
                        Continue Shopping
                    </Link>
                    <Link href="/account/orders" className="btn btn-primary btn-lg">
                        View All Orders
                    </Link>
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'PENDING': return '#f59e0b';
        case 'CONFIRMED': return '#3b82f6';
        case 'PROCESSING': return '#8b5cf6';
        case 'SHIPPED': return '#06b6d4';
        case 'OUT_FOR_DELIVERY': return '#10b981';
        case 'DELIVERED': return '#059669';
        case 'CANCELLED': return '#ef4444';
        default: return '#6b7280';
    }
}

function formatStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
