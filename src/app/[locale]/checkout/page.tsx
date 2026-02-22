'use client';

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface CartItem {
    id: string;
    variantId: string;
    quantity: number;
    itemTotal: number;
    variant: {
        name: string;
        product: {
            name: string;
            slug: string;
            price: number;
            images: { thumbnailUrl: string }[];
        };
    };
}

interface Address {
    id?: string;
    fullName?: string;
    label: string;
    governorate: string;
    city: string;
    district: string;
    street: string;
    building: string;
    floor?: string;
    apartment?: string;
    phone: string;
    isDefault?: boolean;
}

export default function CheckoutPage() {
    const t = useTranslations('checkout');
    const tCommon = useTranslations('common');
    const tCart = useTranslations('cart');
    const locale = useLocale();
    const router = useRouter();
    const localePath = (path: string) => `/${locale}${path}`;

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [cart, setCart] = useState<{ items: CartItem[]; subtotal: number; itemCount: number } | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cod'>('cod');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoCode, setPromoCode] = useState('');

    const [newAddress, setNewAddress] = useState<Address>({
        fullName: '',
        label: locale === 'ar' ? 'المنزل' : 'Home',
        governorate: locale === 'ar' ? 'القاهرة' : 'Cairo',
        city: locale === 'ar' ? 'القاهرة' : 'Cairo',
        district: '',
        street: '',
        building: '',
        floor: '',
        apartment: '',
        phone: '',
    });

    useEffect(() => {
        fetchCart();
        fetchAddresses();
    }, []);

    async function fetchCart() {
        try {
            const res = await fetch('/api/v1/cart');
            const data = await res.json();
            if (data.success) {
                setCart(data.data);
                if (data.data.items.length === 0) {
                    router.push(localePath('/cart'));
                }
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchAddresses() {
        setSavedAddresses([]);
        setShowNewAddress(true);
    }

    async function handleSubmitOrder() {
        if (!selectedAddress && !newAddress.street) {
            alert(locale === 'ar' ? 'يرجى إدخال عنوان التوصيل' : 'Please provide a delivery address');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/v1/checkout/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(selectedAddress?.id ? { addressId: selectedAddress.id } : { newAddress }),
                    paymentMethod,
                    promoCode: promoCode || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                if (data.data.paymentUrl) {
                    window.location.href = data.data.paymentUrl;
                } else {
                    router.push(`${localePath('/order-success')}?token=${data.data.trackingToken}`);
                }
            } else {
                alert(data.error || (locale === 'ar' ? 'فشل في تقديم الطلب' : 'Failed to place order'));
            }
        } catch (error) {
            console.error('Failed to submit order:', error);
            alert(locale === 'ar' ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const shipping = cart && cart.subtotal > 5000 ? 0 : 100;
    const total = cart ? cart.subtotal - promoDiscount + shipping : 0;

    const steps = locale === 'ar'
        ? ['التوصيل', 'الدفع', 'المراجعة']
        : ['Delivery', 'Payment', 'Review'];

    const paymentMethods = [
        {
            key: 'cod',
            label: locale === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery',
            desc: locale === 'ar' ? 'ادفع عند وصول طلبك' : 'Pay when your order arrives',
            icon: '💵'
        },
        {
            key: 'card',
            label: locale === 'ar' ? 'بطاقة ائتمان / خصم' : 'Credit / Debit Card',
            desc: locale === 'ar' ? 'فيزا، ماستركارد عبر Paymob' : 'Visa, Mastercard via Paymob',
            icon: '💳'
        },
        {
            key: 'wallet',
            label: locale === 'ar' ? 'محفظة إلكترونية' : 'Mobile Wallet',
            desc: locale === 'ar' ? 'فودافون كاش، أورانج موني، إلخ.' : 'Vodafone Cash, Orange Money, etc.',
            icon: '📱'
        },
    ];

    const governorates = locale === 'ar'
        ? ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية']
        : ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia', 'Gharbia', 'Monufia'];

    const labels = locale === 'ar'
        ? ['المنزل', 'العمل', 'آخر']
        : ['Home', 'Work', 'Other'];

    if (loading) {
        return (
            <div style={{ paddingTop: '40px', minHeight: '100vh' }}>
                <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div className="skeleton" style={{ height: 400 }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '40px', minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            <div className="container" style={{ maxWidth: 1100 }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                    marginBottom: 'var(--spacing-xl)',
                }}>
                    {t('title')}
                </h1>

                {/* Progress Steps */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-2xl)',
                }}>
                    {steps.map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                onClick={() => i + 1 < step && setStep(i + 1)}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: step > i ? 'var(--color-primary)' : step === i + 1 ? 'var(--color-secondary)' : 'var(--color-border)',
                                    color: step >= i + 1 ? 'white' : 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    cursor: i + 1 < step ? 'pointer' : 'default',
                                }}
                            >
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{
                                marginInlineStart: 8,
                                marginInlineEnd: 24,
                                color: step >= i + 1 ? 'var(--color-text)' : 'var(--color-text-muted)',
                                fontWeight: step === i + 1 ? 600 : 400,
                            }}>
                                {label}
                            </span>
                            {i < 2 && (
                                <div style={{
                                    width: 60,
                                    height: 2,
                                    background: step > i + 1 ? 'var(--color-primary)' : 'var(--color-border)',
                                    marginInlineEnd: 24,
                                }} />
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--spacing-2xl)' }}>
                    {/* Main Content */}
                    <div>
                        {/* Step 1: Address */}
                        {step === 1 && (
                            <div style={{
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-xl)',
                            }}>
                                <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    {locale === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}
                                </h2>

                                {(showNewAddress || savedAddresses.length === 0) && (
                                    <div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}</label>
                                                <input
                                                    className="input"
                                                    value={newAddress.fullName || ''}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, fullName: e.target.value }))}
                                                    placeholder={locale === 'ar' ? 'الاسم الثلاثي' : 'John Doe'}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'التسمية *' : 'Label *'}</label>
                                                <select
                                                    className="input"
                                                    value={newAddress.label}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                                                >
                                                    {labels.map(l => <option key={l}>{l}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'المحافظة *' : 'Governorate *'}</label>
                                                <select
                                                    className="input"
                                                    value={newAddress.governorate}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, governorate: e.target.value }))}
                                                >
                                                    {governorates.map(g => <option key={g}>{g}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'المدينة *' : 'City *'}</label>
                                                <input
                                                    className="input"
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                                                    placeholder={locale === 'ar' ? 'مثال: مدينة نصر' : 'e.g., Nasr City'}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'الحي *' : 'District *'}</label>
                                                <input
                                                    className="input"
                                                    value={newAddress.district}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, district: e.target.value }))}
                                                    placeholder={locale === 'ar' ? 'مثال: الحي العاشر' : 'e.g., 10th Zone'}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label style={labelStyle}>{locale === 'ar' ? 'عنوان الشارع *' : 'Street Address *'}</label>
                                            <input
                                                className="input"
                                                value={newAddress.street}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                                                placeholder={locale === 'ar' ? 'اسم ورقم الشارع' : 'Street name and number'}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'المبنى *' : 'Building *'}</label>
                                                <input
                                                    className="input"
                                                    value={newAddress.building}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, building: e.target.value }))}
                                                    placeholder="20"
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'الطابق' : 'Floor'}</label>
                                                <input
                                                    className="input"
                                                    value={newAddress.floor}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, floor: e.target.value }))}
                                                    placeholder="5"
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>{locale === 'ar' ? 'الشقة' : 'Apartment'}</label>
                                                <input
                                                    className="input"
                                                    value={newAddress.apartment}
                                                    onChange={(e) => setNewAddress(prev => ({ ...prev, apartment: e.target.value }))}
                                                    placeholder="12"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label style={labelStyle}>{locale === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                                            <input
                                                className="input"
                                                type="tel"
                                                value={newAddress.phone}
                                                onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                                                placeholder="01XXXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(2)}
                                    className="btn btn-primary btn-lg"
                                    style={{ width: '100%', marginTop: 'var(--spacing-xl)' }}
                                    disabled={!newAddress.street || !newAddress.building || !newAddress.phone}
                                >
                                    {locale === 'ar' ? 'المتابعة للدفع' : 'Continue to Payment'}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div style={{
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-xl)',
                            }}>
                                <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    {locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                                </h2>

                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.key}
                                        onClick={() => setPaymentMethod(method.key as 'card' | 'wallet' | 'cod')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-lg)',
                                            padding: 'var(--spacing-lg)',
                                            border: paymentMethod === method.key
                                                ? '2px solid var(--color-primary)'
                                                : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: 'var(--spacing-md)',
                                            cursor: 'pointer',
                                            background: paymentMethod === method.key ? 'rgba(26, 35, 50, 0.03)' : 'transparent',
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{method.icon}</span>
                                        <div>
                                            <strong>{method.label}</strong>
                                            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                                                {method.desc}
                                            </p>
                                        </div>
                                        <div style={{
                                            marginInlineStart: 'auto',
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            border: paymentMethod === method.key
                                                ? '8px solid var(--color-primary)'
                                                : '2px solid var(--color-border)',
                                        }} />
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
                                    <button onClick={() => setStep(1)} className="btn btn-outline btn-lg">
                                        {locale === 'ar' ? 'رجوع' : 'Back'}
                                    </button>
                                    <button onClick={() => setStep(3)} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                                        {locale === 'ar' ? 'المتابعة للمراجعة' : 'Continue to Review'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div style={{
                                background: 'var(--color-bg)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-xl)',
                            }}>
                                <h2 style={{ marginBottom: 'var(--spacing-xl)' }}>
                                    {locale === 'ar' ? 'مراجعة طلبك' : 'Review Your Order'}
                                </h2>

                                {/* Address Summary */}
                                <div style={{
                                    padding: 'var(--spacing-lg)',
                                    background: 'var(--color-bg-alt)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--spacing-lg)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <strong>{locale === 'ar' ? 'عنوان التوصيل' : 'Delivery Address'}</strong>
                                        <button onClick={() => setStep(1)} style={{ color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {tCommon('edit')}
                                        </button>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                                        {newAddress.street}, {newAddress.building}, {newAddress.district}, {newAddress.city}, {newAddress.governorate}
                                        <br />
                                        {locale === 'ar' ? 'الهاتف:' : 'Phone:'} {newAddress.phone}
                                    </p>
                                </div>

                                {/* Payment Summary */}
                                <div style={{
                                    padding: 'var(--spacing-lg)',
                                    background: 'var(--color-bg-alt)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--spacing-lg)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <strong>{locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}</strong>
                                        <button onClick={() => setStep(2)} style={{ color: 'var(--color-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {tCommon('edit')}
                                        </button>
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                                        {paymentMethods.find(m => m.key === paymentMethod)?.label}
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    <strong style={{ marginBottom: 'var(--spacing-md)', display: 'block' }}>
                                        {locale === 'ar' ? 'محتويات الطلب' : 'Order Items'}
                                    </strong>
                                    {cart?.items.map((item) => (
                                        <div key={item.id} style={{
                                            display: 'flex',
                                            gap: 'var(--spacing-md)',
                                            padding: 'var(--spacing-md) 0',
                                            borderBottom: '1px solid var(--color-border)',
                                        }}>
                                            <div className="relative w-[60px] h-[60px] shrink-0 rounded-md overflow-hidden bg-[#f7f5f2]">
                                                <Image
                                                    src={item.variant.product.images[0]?.thumbnailUrl || 'https://via.placeholder.com/60'}
                                                    alt={item.variant.product.name}
                                                    fill
                                                    sizes="60px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 500 }}>{item.variant.product.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                    {item.variant.name} × {item.quantity}
                                                </p>
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{item.itemTotal.toLocaleString()} {tCommon('egp')}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                                    <button onClick={() => setStep(2)} className="btn btn-outline btn-lg">
                                        {locale === 'ar' ? 'رجوع' : 'Back'}
                                    </button>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={submitting}
                                        className="btn btn-primary btn-lg"
                                        style={{ flex: 1 }}
                                    >
                                        {submitting
                                            ? (locale === 'ar' ? 'جاري المعالجة...' : 'Processing...')
                                            : `${locale === 'ar' ? 'تأكيد الطلب' : 'Place Order'} - ${total.toLocaleString()} ${tCommon('egp')}`
                                        }
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div style={{
                            background: 'var(--color-bg)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--spacing-xl)',
                            position: 'sticky',
                            top: 100,
                        }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
                                {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
                            </h3>

                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                {cart?.items.slice(0, 3).map((item) => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.875rem',
                                        marginBottom: 8,
                                    }}>
                                        <span style={{ color: 'var(--color-text-muted)' }}>
                                            {item.variant.product.name} × {item.quantity}
                                        </span>
                                        <span>{item.itemTotal.toLocaleString()} {tCommon('egp')}</span>
                                    </div>
                                ))}
                                {cart && cart.items.length > 3 && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                        +{cart.items.length - 3} {locale === 'ar' ? 'منتجات أخرى' : 'more items'}
                                    </p>
                                )}
                            </div>

                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{tCart('subtotal')}</span>
                                    <span>{cart?.subtotal.toLocaleString()} {tCommon('egp')}</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--color-success)' }}>
                                        <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                                        <span>-{promoDiscount.toLocaleString()} {tCommon('egp')}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>{tCart('shipping')}</span>
                                    <span>{shipping === 0 ? tCart('freeShipping') : `${shipping} ${tCommon('egp')}`}</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingTop: 'var(--spacing-md)',
                                    borderTop: '1px solid var(--color-border)',
                                    fontWeight: 600,
                                    fontSize: '1.25rem',
                                }}>
                                    <span>{tCart('total')}</span>
                                    <span>{total.toLocaleString()} {tCommon('egp')}</span>
                                </div>
                            </div>

                            <Link href={localePath('/cart')} style={{
                                display: 'block',
                                textAlign: 'center',
                                marginTop: 'var(--spacing-lg)',
                                fontSize: '0.875rem',
                                color: 'var(--color-text-muted)',
                            }}>
                                {locale === 'ar' ? '← العودة للسلة' : '← Back to Cart'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: 'var(--spacing-xs)',
    color: 'var(--color-text-muted)',
};
