'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';

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
}

const FIELD: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', gap: '6px',
};
const LABEL: React.CSSProperties = {
    fontSize: '0.7rem', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase' as const, letterSpacing: '0.08em',
};
const INPUT: React.CSSProperties = {
    padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
    fontSize: '0.95rem', color: '#1a1a2e', background: 'white', outline: 'none',
    width: '100%', transition: 'border-color 0.2s', boxSizing: 'border-box' as const,
};
const CARD: React.CSSProperties = {
    background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb',
    padding: '36px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};
const BTN_PRIMARY: React.CSSProperties = {
    display: 'block', width: '100%', padding: '16px', background: '#1a1a2e',
    color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700,
    fontSize: '1rem', cursor: 'pointer', textAlign: 'center' as const,
    transition: 'background 0.2s, transform 0.1s', letterSpacing: '0.02em',
};

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
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cod'>('cod');
    const [promoDiscount] = useState(0);
    const [promoCode] = useState('');

    const isAr = locale === 'ar';

    const [addr, setAddr] = useState<Address>({
        fullName: '',
        label: isAr ? 'المنزل' : 'Home',
        governorate: isAr ? 'القاهرة' : 'Cairo',
        city: isAr ? 'القاهرة' : 'Cairo',
        district: '', street: '', building: '', floor: '', apartment: '', phone: '',
    });

    useEffect(() => { fetchCart(); }, []);

    async function fetchCart() {
        try {
            const res = await fetch('/api/v1/cart');
            const data = await res.json();
            if (data.success) {
                setCart(data.data);
                if (!data.data.items.length) router.push(localePath('/cart'));
            }
        } catch { toast.error('Failed to load cart'); }
        finally { setLoading(false); }
    }

    async function handleSubmitOrder() {
        if (!addr.street || !addr.building || !addr.phone) {
            toast.error(isAr ? 'يرجى إدخال عنوان التوصيل بالكامل' : 'Please complete your delivery address');
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/v1/checkout/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newAddress: addr, paymentMethod, promoCode: promoCode || undefined }),
            });
            const data = await res.json();
            if (data.success) {
                if (data.data.paymentUrl) window.location.href = data.data.paymentUrl;
                else router.push(`${localePath('/order-success')}?token=${data.data.trackingToken}`);
            } else {
                toast.error(data.error || (isAr ? 'فشل في تقديم الطلب' : 'Failed to place order'));
            }
        } catch {
            toast.error(isAr ? 'حدث خطأ.' : 'An error occurred.');
        } finally {
            setSubmitting(false);
        }
    }

    const shipping = cart && cart.subtotal > 5000 ? 0 : 50;
    const total = cart ? cart.subtotal - promoDiscount + (shipping ?? 0) : 0;
    const steps = isAr ? ['التوصيل', 'الدفع', 'المراجعة'] : ['Delivery', 'Payment', 'Review'];

    const payMethods = [
        { key: 'cod', label: isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery', desc: isAr ? 'ادفع عند وصول طلبك' : 'Pay when your order arrives', icon: '💵' },
        { key: 'card', label: isAr ? 'بطاقة ائتمان / خصم' : 'Credit / Debit Card', desc: isAr ? 'فيزا، ماستركارد عبر Paymob' : 'Visa, Mastercard via Paymob', icon: '💳' },
        { key: 'wallet', label: isAr ? 'محفظة إلكترونية' : 'Mobile Wallet', desc: isAr ? 'فودافون كاش' : 'Vodafone Cash, Orange Money', icon: '📱' },
    ];

    const govs = isAr
        ? ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية']
        : ['Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia'];

    const addrLabels = isAr ? ['المنزل', 'العمل', 'آخر'] : ['Home', 'Work', 'Other'];

    const canProceed = addr.street.trim() && addr.building.trim() && addr.phone.trim();

    /* Loading skeleton */
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <div style={{ height: '400px', background: 'linear-gradient(90deg,#ede9e3 25%,#e5e0d8 50%,#ede9e3 75%)', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="container" style={{ maxWidth: '1080px' }}>
                {/* Title */}
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 700, color: '#1a1a2e', marginBottom: '40px' }}>
                    {t('title')}
                </h1>

                {/* Steps */}
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '48px', gap: '0' }}>
                    {/* Connecting line */}
                    <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '2px', background: '#e5e7eb', zIndex: 0, transform: 'translateY(-50%)' }}></div>
                    {steps.map((label, i) => {
                        const isDone = step > i + 1;
                        const isActive = step === i + 1;
                        return (
                            <button
                                key={label}
                                onClick={() => isDone && setStep(i + 1)}
                                disabled={!isDone}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                    background: 'none', border: 'none', cursor: isDone ? 'pointer' : 'default',
                                    flex: 1, position: 'relative', zIndex: 1,
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s',
                                    background: isDone ? '#1a1a2e' : isActive ? '#c9a959' : 'white',
                                    color: (isDone || isActive) ? 'white' : '#9ca3af',
                                    border: `2px solid ${isDone ? '#1a1a2e' : isActive ? '#c9a959' : '#e5e7eb'}`,
                                    boxShadow: isActive ? '0 0 0 4px rgba(201,169,89,0.2)' : 'none',
                                }}>
                                    {isDone ? '✓' : i + 1}
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (isDone || isActive) ? '#1a1a2e' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Main 2-col layout */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px', alignItems: 'start' }}>

                    {/* LEFT: Steps */}
                    <div>
                        {/* Step 1: Address */}
                        {step === 1 && (
                            <div style={CARD}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '28px' }}>
                                    {isAr ? 'عنوان التوصيل' : 'Delivery Address'}
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Full Name */}
                                    <div style={FIELD}>
                                        <label style={LABEL}>{isAr ? 'الاسم بالكامل *' : 'Full Name *'}</label>
                                        <input style={INPUT} value={addr.fullName || ''} placeholder={isAr ? 'الاسم الثلاثي' : 'John Doe'}
                                            onFocus={e => e.target.style.borderColor = '#c9a959'}
                                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                            onChange={e => setAddr(p => ({ ...p, fullName: e.target.value }))} />
                                    </div>

                                    {/* Label + Governorate */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'التسمية *' : 'Label *'}</label>
                                            <select style={INPUT} value={addr.label}
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, label: e.target.value }))}>
                                                {addrLabels.map(l => <option key={l}>{l}</option>)}
                                            </select>
                                        </div>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'المحافظة *' : 'Governorate *'}</label>
                                            <select style={INPUT} value={addr.governorate}
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, governorate: e.target.value }))}>
                                                {govs.map(g => <option key={g}>{g}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* City + District */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'المدينة *' : 'City *'}</label>
                                            <input style={INPUT} value={addr.city} placeholder={isAr ? 'مدينة نصر' : 'Nasr City'}
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, city: e.target.value }))} />
                                        </div>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'الحي *' : 'District *'}</label>
                                            <input style={INPUT} value={addr.district} placeholder={isAr ? 'الحي العاشر' : '10th Zone'}
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, district: e.target.value }))} />
                                        </div>
                                    </div>

                                    {/* Street */}
                                    <div style={FIELD}>
                                        <label style={LABEL}>{isAr ? 'عنوان الشارع *' : 'Street Address *'}</label>
                                        <input style={INPUT} value={addr.street} placeholder={isAr ? 'اسم ورقم الشارع' : 'Street name and number'}
                                            onFocus={e => e.target.style.borderColor = '#c9a959'}
                                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                            onChange={e => setAddr(p => ({ ...p, street: e.target.value }))} />
                                    </div>

                                    {/* Building + Floor + Apt */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'المبنى *' : 'Building *'}</label>
                                            <input style={INPUT} value={addr.building} placeholder="20"
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, building: e.target.value }))} />
                                        </div>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'الطابق' : 'Floor'}</label>
                                            <input style={INPUT} value={addr.floor || ''} placeholder="5"
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, floor: e.target.value }))} />
                                        </div>
                                        <div style={FIELD}>
                                            <label style={LABEL}>{isAr ? 'الشقة' : 'Apartment'}</label>
                                            <input style={INPUT} value={addr.apartment || ''} placeholder="12"
                                                onFocus={e => e.target.style.borderColor = '#c9a959'}
                                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                                onChange={e => setAddr(p => ({ ...p, apartment: e.target.value }))} />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div style={FIELD}>
                                        <label style={LABEL}>{isAr ? 'رقم الهاتف *' : 'Phone Number *'}</label>
                                        <input style={INPUT} type="tel" value={addr.phone} placeholder="01XXXXXXXXX"
                                            onFocus={e => e.target.style.borderColor = '#c9a959'}
                                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                            onChange={e => setAddr(p => ({ ...p, phone: e.target.value }))} />
                                    </div>
                                </div>

                                <button
                                    style={{ ...BTN_PRIMARY, marginTop: '28px', opacity: canProceed ? 1 : 0.5, cursor: canProceed ? 'pointer' : 'not-allowed' }}
                                    disabled={!canProceed}
                                    onClick={() => setStep(2)}
                                    onMouseEnter={e => { if (canProceed) e.currentTarget.style.background = '#c9a959'; }}
                                    onMouseLeave={e => { if (canProceed) e.currentTarget.style.background = '#1a1a2e'; }}
                                >
                                    {isAr ? 'المتابعة للدفع →' : 'Continue to Payment →'}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div style={CARD}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '28px' }}>
                                    {isAr ? 'طريقة الدفع' : 'Payment Method'}
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {payMethods.map((method) => {
                                        const active = paymentMethod === method.key;
                                        return (
                                            <button
                                                key={method.key}
                                                onClick={() => setPaymentMethod(method.key as 'card' | 'wallet' | 'cod')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '16px', padding: '20px',
                                                    border: active ? '2px solid #1a1a2e' : '1.5px solid #e5e7eb',
                                                    borderRadius: '14px', background: active ? '#f9f8f5' : 'white',
                                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                                    boxShadow: active ? '0 4px 12px rgba(26,26,46,0.08)' : 'none',
                                                }}
                                            >
                                                <span style={{ fontSize: '2rem', flexShrink: 0 }}>{method.icon}</span>
                                                <div style={{ flex: 1, textAlign: 'left' }}>
                                                    <strong style={{ display: 'block', color: '#1a1a2e', fontWeight: 700, marginBottom: '2px' }}>{method.label}</strong>
                                                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>{method.desc}</p>
                                                </div>
                                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: active ? '2px solid #1a1a2e' : '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    {active && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1a1a2e' }} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: '0 0 auto', padding: '14px 24px', border: '2px solid #1a1a2e', background: 'transparent', color: '#1a1a2e', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; }}
                                    >
                                        ← {isAr ? 'رجوع' : 'Back'}
                                    </button>
                                    <button onClick={() => setStep(3)}
                                        style={{ ...BTN_PRIMARY, flex: 1 }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#c9a959'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#1a1a2e'}
                                    >
                                        {isAr ? 'المتابعة للمراجعة →' : 'Continue to Review →'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {step === 3 && (
                            <div style={CARD}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '28px' }}>
                                    {isAr ? 'مراجعة طلبك' : 'Review Your Order'}
                                </h2>

                                {/* Address Summary */}
                                <div style={{ background: '#f9f8f5', borderRadius: '14px', padding: '20px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong style={{ color: '#1a1a2e', fontWeight: 700 }}>{isAr ? 'عنوان التوصيل' : 'Delivery Address'}</strong>
                                        <button onClick={() => setStep(1)} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c9a959', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {tCommon('edit')}
                                        </button>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {addr.fullName && <strong style={{ color: '#1a1a2e' }}>{addr.fullName}<br /></strong>}
                                        {addr.street}, {addr.building}, {addr.district}, {addr.city}, {addr.governorate}
                                        <br /><span style={{ fontWeight: 600, color: '#1a1a2e' }}>{isAr ? 'الهاتف:' : 'Phone:'}</span> {addr.phone}
                                    </p>
                                </div>

                                {/* Payment Summary */}
                                <div style={{ background: '#f9f8f5', borderRadius: '14px', padding: '20px', marginBottom: '24px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong style={{ color: '#1a1a2e', fontWeight: 700 }}>{isAr ? 'طريقة الدفع' : 'Payment Method'}</strong>
                                        <button onClick={() => setStep(2)} style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c9a959', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            {tCommon('edit')}
                                        </button>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, margin: 0 }}>
                                        <span style={{ fontSize: '1.5rem' }}>{payMethods.find(m => m.key === paymentMethod)?.icon}</span>
                                        {payMethods.find(m => m.key === paymentMethod)?.label}
                                    </p>
                                </div>

                                {/* Items */}
                                <div style={{ marginBottom: '28px' }}>
                                    <strong style={{ display: 'block', color: '#9ca3af', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                                        {isAr ? 'محتويات الطلب' : 'Order Items'}
                                    </strong>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {cart?.items.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', gap: '14px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', background: 'white', alignItems: 'center' }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', background: '#f7f5f2', position: 'relative', flexShrink: 0 }}>
                                                    <Image src={item.variant.product.images[0]?.thumbnailUrl || 'https://via.placeholder.com/56'} alt={item.variant.product.name} fill sizes="56px" style={{ objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {item.variant.product.name}
                                                    </p>
                                                    <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                        {item.variant.name} · Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <span style={{ fontWeight: 700, color: '#c9a959', whiteSpace: 'nowrap' }}>
                                                    {Number(item.itemTotal).toLocaleString()} {tCommon('egp')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(2)} style={{ flex: '0 0 auto', padding: '14px 24px', border: '2px solid #1a1a2e', background: 'transparent', color: '#1a1a2e', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; }}
                                    >
                                        ← {isAr ? 'رجوع' : 'Back'}
                                    </button>
                                    <button
                                        onClick={handleSubmitOrder}
                                        disabled={submitting}
                                        style={{ ...BTN_PRIMARY, flex: 1, background: submitting ? '#9ca3af' : '#1a1a2e', cursor: submitting ? 'not-allowed' : 'pointer' }}
                                        onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = '#c9a959'; }}
                                        onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = submitting ? '#9ca3af' : '#1a1a2e'; }}
                                    >
                                        {submitting
                                            ? (isAr ? 'جاري المعالجة...' : 'Processing...')
                                            : `${isAr ? 'تأكيد الطلب' : 'Place Order'} — ${total.toLocaleString()} ${tCommon('egp')}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={CARD}>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                                {isAr ? 'ملخص الطلب' : 'Order Summary'}
                            </h3>

                            {/* Items list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                {cart?.items.slice(0, 3).map((item) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                            {item.quantity}× {item.variant.product.name}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                            {Number(item.itemTotal).toLocaleString()} {tCommon('egp')}
                                        </span>
                                    </div>
                                ))}
                                {cart && cart.items.length > 3 && (
                                    <p style={{ fontSize: '0.8rem', color: '#c9a959', fontWeight: 700 }}>
                                        +{cart.items.length - 3} {isAr ? 'منتجات أخرى' : 'more items'}
                                    </p>
                                )}
                            </div>

                            {/* Totals */}
                            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{tCart('subtotal')}</span>
                                    <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{cart?.subtotal.toLocaleString()} {tCommon('egp')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{tCart('shipping')}</span>
                                    <span style={{ fontWeight: 600, color: shipping === 0 ? '#10b981' : '#1a1a2e', fontSize: shipping === 0 ? '0.75rem' : 'inherit', textTransform: shipping === 0 ? 'uppercase' : 'none' }}>
                                        {shipping === 0 ? (isAr ? 'مجاني' : 'FREE') : `${shipping} ${tCommon('egp')}`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #f3f4f6', paddingTop: '16px' }}>
                                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: '#1a1a2e' }}>{tCart('total')}</span>
                                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: '#c9a959' }}>{total.toLocaleString()} {tCommon('egp')}</span>
                                </div>
                            </div>

                            <Link href={localePath('/cart')} style={{ display: 'block', textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#1a1a2e'}
                                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                            >
                                ← {isAr ? 'العودة للسلة' : 'Back to Cart'}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
