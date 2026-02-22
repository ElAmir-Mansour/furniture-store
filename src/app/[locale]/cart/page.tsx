'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

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

    useEffect(() => {
        fetchCart();
    }, []);

    async function fetchCart() {
        try {
            const res = await fetch('/api/v1/cart');
            const data = await res.json();
            if (data.success) {
                setCart(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
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
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
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
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setUpdating(null);
        }
    }

    async function applyPromoCode() {
        if (!promoCode.trim()) return;

        setPromoError('');
        try {
            const res = await fetch('/api/v1/cart/apply-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode }),
            });
            const data = await res.json();

            if (data.success) {
                setPromoResult(data.data);
            } else {
                setPromoError(data.error);
                setPromoResult(null);
            }
        } catch (error) {
            setPromoError(locale === 'ar' ? 'فشل تطبيق الكود' : 'Failed to apply promo code');
        }
    }

    const shipping = cart && cart.subtotal > 5000 ? 0 : 50;
    const discount = promoResult?.discount || 0;
    const total = cart ? cart.subtotal - discount + shipping : 0;

    if (loading) {
        return (
            <div style={{ paddingTop: '40px', minHeight: '100vh' }}>
                <div className="container">
                    <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--spacing-2xl)' }}>
                        {t('title')}
                    </h1>
                    <div className="skeleton" style={{ height: 200, marginBottom: 16 }} />
                    <div className="skeleton" style={{ height: 200, marginBottom: 16 }} />
                </div>
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div style={{ paddingTop: '40px', minHeight: '100vh', textAlign: 'center' }}>
                <div className="container">
                    <div style={{
                        maxWidth: 400,
                        margin: '0 auto',
                        padding: 'var(--spacing-3xl) 0',
                    }}>
                        <div style={{
                            width: 100,
                            height: 100,
                            margin: '0 auto var(--spacing-xl)',
                            background: 'var(--color-bg-alt)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                        }}>
                            🛒
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            marginBottom: 'var(--spacing-md)',
                        }}>
                            {t('empty')}
                        </h1>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-xl)',
                        }}>
                            {locale === 'ar'
                                ? 'يبدو أنك لم تضف أي منتجات بعد.'
                                : "Looks like you haven't added anything yet."}
                        </p>
                        <Link href={localePath('/products')} className="btn btn-primary btn-lg">
                            {locale === 'ar' ? 'ابدأ التسوق' : 'Start Shopping'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '40px', minHeight: '100vh' }}>
            <div className="container">
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                    marginBottom: 'var(--spacing-2xl)',
                }}>
                    {t('title')}
                    <span style={{
                        fontSize: '1rem',
                        fontWeight: 400,
                        color: 'var(--color-text-muted)',
                        marginInlineStart: 'var(--spacing-md)',
                    }}>
                        ({cart.itemCount} {cart.itemCount === 1 ? tCommon('item') : tCommon('items')})
                    </span>
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--spacing-2xl)' }}>
                    {/* Cart Items */}
                    <div>
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    display: 'flex',
                                    gap: 'var(--spacing-xl)',
                                    padding: 'var(--spacing-xl)',
                                    background: 'var(--color-bg)',
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: 'var(--spacing-md)',
                                    border: '1px solid var(--color-border)',
                                    opacity: updating === item.variantId ? 0.5 : 1,
                                }}
                            >
                                {/* Image */}
                                <Link href={localePath(`/products/${item.variant.product.slug}`)}>
                                    <div className="relative w-[120px] h-[120px] shrink-0 rounded-md overflow-hidden bg-[#f7f5f2]">
                                        <Image
                                            src={item.variant.product.images?.[0]?.thumbnailUrl || 'https://via.placeholder.com/120'}
                                            alt={item.variant.product.name}
                                            fill
                                            sizes="120px"
                                            className="object-cover"
                                        />
                                    </div>
                                </Link>

                                {/* Details */}
                                <div style={{ flex: 1 }}>
                                    <Link
                                        href={localePath(`/products/${item.variant.product.slug}`)}
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <h3 style={{
                                            fontFamily: 'var(--font-display)',
                                            fontSize: '1.125rem',
                                            marginBottom: 'var(--spacing-xs)',
                                        }}>
                                            {item.variant.product.name}
                                        </h3>
                                    </Link>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--spacing-md)',
                                    }}>
                                        {item.variant.name}
                                        {item.variant.color && ` • ${item.variant.color}`}
                                    </p>

                                    {/* Quantity */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                        }}>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                                                disabled={updating === item.variantId}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                −
                                            </button>
                                            <span style={{ width: 32, textAlign: 'center', fontSize: '0.875rem' }}>
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.variantId, Math.min(item.variant.stock, item.quantity + 1))}
                                                disabled={updating === item.variantId}
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    border: 'none',
                                                    background: 'transparent',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.variantId)}
                                            disabled={updating === item.variantId}
                                            style={{
                                                padding: '8px 12px',
                                                fontSize: '0.75rem',
                                                color: 'var(--color-error)',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {tCommon('remove')}
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div style={{ textAlign: locale === 'ar' ? 'left' : 'right' }}>
                                    <p style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                                        {item.itemTotal.toLocaleString()} {tCommon('egp')}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        {(Number(item.variant.product.price) + Number(item.variant.priceAdj)).toLocaleString()} {tCommon('egp')} {locale === 'ar' ? 'للوحدة' : 'each'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div style={{
                            background: 'var(--color-bg-alt)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-xl)',
                            position: 'sticky',
                            top: 100,
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                marginBottom: 'var(--spacing-xl)',
                            }}>
                                {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                            </h2>

                            {/* Promo Code */}
                            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        placeholder={locale === 'ar' ? 'كود الخصم' : 'Promo code'}
                                        className="input"
                                        style={{ flex: 1 }}
                                    />
                                    <button onClick={applyPromoCode} className="btn btn-outline">
                                        {locale === 'ar' ? 'تطبيق' : 'Apply'}
                                    </button>
                                </div>
                                {promoError && (
                                    <p style={{ color: 'var(--color-error)', fontSize: '0.875rem', marginTop: 8 }}>
                                        {promoError}
                                    </p>
                                )}
                                {promoResult && (
                                    <p style={{ color: 'var(--color-success)', fontSize: '0.875rem', marginTop: 8 }}>
                                        {promoResult.message}
                                    </p>
                                )}
                            </div>

                            {/* Totals */}
                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{t('subtotal')}</span>
                                    <span>{cart.subtotal.toLocaleString()} {tCommon('egp')}</span>
                                </div>

                                {promoResult && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, color: 'var(--color-success)' }}>
                                        <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                                        <span>−{discount.toLocaleString()} {tCommon('egp')}</span>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{t('shipping')}</span>
                                    <span>{shipping === 0 ? t('freeShipping') : `${shipping} ${tCommon('egp')}`}</span>
                                </div>

                                {cart.subtotal < 5000 && (
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--color-secondary)',
                                        marginBottom: 12,
                                    }}>
                                        {locale === 'ar'
                                            ? `أضف ${(5000 - cart.subtotal).toLocaleString()} جنيه للشحن المجاني!`
                                            : `Add ${(5000 - cart.subtotal).toLocaleString()} EGP more for free shipping!`}
                                    </p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--color-border)',
                                    fontWeight: 600,
                                    fontSize: '1.25rem',
                                }}>
                                    <span>{t('total')}</span>
                                    <span>{total.toLocaleString()} {tCommon('egp')}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Link
                                href={localePath('/checkout')}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'var(--spacing-xl)' }}
                            >
                                {t('checkout')}
                            </Link>

                            <Link
                                href={localePath('/products')}
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: 'var(--spacing-md)',
                                    fontSize: '0.875rem',
                                    color: 'var(--color-text-muted)',
                                }}
                            >
                                {t('continueShopping')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
