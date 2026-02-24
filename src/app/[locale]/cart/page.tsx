'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';

interface CartItem {
    id: string;
    variantId: string;
    quantity: number;
    itemTotal: number;
    variant: {
        id: string;
        name: string;
        sku: string;
        color?: string;
        stock: number;
        priceAdj: number;
        product: {
            id: string;
            name: string;
            slug: string;
            price: number;
            images: { thumbnailUrl: string }[];
        };
    };
}

interface Cart {
    items: CartItem[];
    subtotal: number;
    itemCount: number;
}

interface PromoResult {
    discount: number;
    message: string;
    code: { code: string; discountType: string; discountValue: number };
}

export default function CartPage() {
    const t = useTranslations('cart');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const localePath = (path: string) => `/${locale}${path}`;

    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
    const [promoError, setPromoError] = useState('');
    const [applyingPromo, setApplyingPromo] = useState(false);

    useEffect(() => {
        fetchCart();
    }, []);

    async function fetchCart() {
        try {
            const res = await fetch('/api/v1/cart');
            const data = await res.json();
            if (data.success) setCart(data.data);
        } catch {
            toast.error('Failed to load cart');
        } finally {
            setLoading(false);
        }
    }

    async function updateQuantity(variantId: string, quantity: number) {
        setUpdating(variantId);
        try {
            const res = await fetch(`/api/v1/cart/${variantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            });
            const data = await res.json();
            if (data.success) {
                setCart(data.data);
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                toast.error(data.error || 'Failed to update cart');
            }
        } catch {
            toast.error('Failed to update cart');
        } finally {
            setUpdating(null);
        }
    }

    async function removeItem(variantId: string) {
        setUpdating(variantId);
        try {
            const res = await fetch(`/api/v1/cart/${variantId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setCart(data.data);
                toast.success('Item removed');
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                toast.error(data.error || 'Failed to remove item');
            }
        } catch {
            toast.error('Failed to remove item');
        } finally {
            setUpdating(null);
        }
    }

    async function applyPromoCode() {
        if (!promoCode.trim()) return;
        setPromoError('');
        setApplyingPromo(true);
        try {
            const res = await fetch('/api/v1/cart/apply-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode }),
            });
            const data = await res.json();
            if (data.success) {
                setPromoResult(data.data);
                toast.success(data.data.message || 'Promo applied!');
            } else {
                setPromoError(data.error || 'Invalid promo code');
                setPromoResult(null);
            }
        } catch {
            setPromoError('Failed to apply promo code');
        } finally {
            setApplyingPromo(false);
        }
    }

    const shipping = cart && cart.subtotal > 5000 ? 0 : 50;
    const discount = promoResult?.discount || 0;
    const total = cart ? cart.subtotal - discount + shipping : 0;

    /* ── Loading ── */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px' }}>
                <div className="container">
                    <div style={{ height: '200px', background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '16px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }} />
                    <div style={{ height: '200px', background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                </div>
            </div>
        );
    }

    /* ── Empty ── */
    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '24px' }}>🛒</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>
                        {t('empty')}
                    </h1>
                    <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '1.05rem' }}>
                        {locale === 'ar' ? 'يبدو أنك لم تضف أي منتجات بعد.' : "Looks like you haven't added anything yet."}
                    </p>
                    <Link href={localePath('/products')} style={{ display: 'inline-block', background: '#1a1a2e', color: 'white', padding: '14px 36px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
                        {locale === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
                    </Link>
                </div>
            </div>
        );
    }

    /* ── Main Cart ── */
    return (
        <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="container">
                {/* Title */}
                <div style={{ marginBottom: '36px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                        {t('title')}
                        <span style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280' }}>
                            ({cart.itemCount} {cart.itemCount === 1 ? tCommon('item') : tCommon('items')})
                        </span>
                    </h1>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '32px', alignItems: 'start' }}>
                    {/* Cart Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    padding: '20px',
                                    display: 'flex',
                                    gap: '20px',
                                    alignItems: 'flex-start',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                    opacity: updating === item.variantId ? 0.5 : 1,
                                    pointerEvents: updating === item.variantId ? 'none' : 'auto',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {/* Image */}
                                <Link href={localePath(`/products/${item.variant.product.slug}`)} style={{ flexShrink: 0 }}>
                                    <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', background: '#f7f5f2', position: 'relative' }}>
                                        <Image
                                            src={item.variant.product.images?.[0]?.thumbnailUrl || 'https://via.placeholder.com/100'}
                                            alt={item.variant.product.name}
                                            fill
                                            sizes="100px"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </Link>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Link href={localePath(`/products/${item.variant.product.slug}`)} style={{ textDecoration: 'none' }}>
                                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.variant.product.name}
                                        </h3>
                                    </Link>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
                                        {item.variant.name}{item.variant.color && ` • ${item.variant.color}`}
                                    </p>

                                    {/* Qty + Remove */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                        {/* Stepper */}
                                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#1a1a2e', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f7f5f2'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                −
                                            </button>
                                            <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#1a1a2e' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, Math.min(item.variant.stock, item.quantity + 1))}
                                                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#1a1a2e', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f7f5f2'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.variantId)}
                                            style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 0', transition: 'color 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                                        >
                                            {tCommon('remove')}
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                                        {Number(item.itemTotal).toLocaleString()} {tCommon('egp')}
                                    </p>
                                    <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                        {(Number(item.variant.product.price) + Number(item.variant.priceAdj)).toLocaleString()} {tCommon('egp')} {locale === 'ar' ? 'للوحدة' : 'each'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '24px' }}>
                            {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                        </h2>

                        {/* Promo Code */}
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                                    placeholder={locale === 'ar' ? 'كود الخصم' : 'Promo code'}
                                    style={{ flex: 1, padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', color: '#1a1a2e', background: 'white', transition: 'border-color 0.2s' }}
                                    onFocus={e => e.target.style.borderColor = '#c9a959'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button
                                    onClick={applyPromoCode}
                                    disabled={applyingPromo}
                                    style={{ padding: '11px 20px', background: '#c9a959', color: '#1a1a2e', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#b8960a'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#c9a959'}
                                >
                                    {applyingPromo ? '...' : (locale === 'ar' ? 'تطبيق' : 'Apply')}
                                </button>
                            </div>
                            {promoError && (
                                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>{promoError}</p>
                            )}
                            {promoResult && (
                                <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>✓ {promoResult.message}</p>
                            )}
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Subtotal */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('subtotal')}</span>
                                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{cart.subtotal.toLocaleString()} {tCommon('egp')}</span>
                            </div>

                            {/* Discount */}
                            {promoResult && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                                    <span style={{ color: '#10b981', fontWeight: 700 }}>−{discount.toLocaleString()} {tCommon('egp')}</span>
                                </div>
                            )}

                            {/* Shipping */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{t('shipping')}</span>
                                <span style={{ fontWeight: 600, color: '#1a1a2e' }}>
                                    {shipping === 0
                                        ? <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('freeShipping')}</span>
                                        : `${shipping} ${tCommon('egp')}`}
                                </span>
                            </div>

                            {/* Free shipping hint */}
                            {cart.subtotal < 5000 && (
                                <div style={{ background: '#fef9f0', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
                                    {locale === 'ar'
                                        ? `أضف ${(5000 - cart.subtotal).toLocaleString()} جنيه للشحن المجاني!`
                                        : `Add ${(5000 - cart.subtotal).toLocaleString()} EGP more for free shipping!`}
                                </div>
                            )}

                            {/* Total */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f3f4f6', paddingTop: '20px', marginTop: '8px' }}>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', color: '#1a1a2e' }}>{t('total')}</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: '#c9a959' }}>{total.toLocaleString()} {tCommon('egp')}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Link
                            href={localePath('/checkout')}
                            style={{ display: 'block', textAlign: 'center', background: '#1a1a2e', color: 'white', padding: '16px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', marginTop: '24px', letterSpacing: '0.02em', boxShadow: '0 4px 12px rgba(26,26,46,0.3)', transition: 'background 0.2s, transform 0.1s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#16213e'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.transform = 'none'; }}
                        >
                            {t('checkout')} →
                        </Link>

                        <Link
                            href={localePath('/products')}
                            style={{ display: 'block', textAlign: 'center', marginTop: '16px', fontSize: '0.8rem', fontWeight: 700, color: '#9ca3af', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#c9a959'}
                            onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                        >
                            {t('continueShopping')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
