'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-hot-toast';

interface Order {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    itemCount: number;
}

export default function AccountPage() {
    const t = useTranslations('account');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const { data: session, status } = useSession();
    const router = useRouter();
    const localePath = (path: string) => `/${locale}${path}`;

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') router.push(localePath('/auth'));
    }, [status]);

    useEffect(() => {
        if (session?.user) {
            setFormData({ name: session.user.name || '', phone: '' });
            fetchOrders();
        }
    }, [session]);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/v1/orders');
            const data = await res.json();
            if (data.success) {
                const raw = Array.isArray(data.data) ? data.data : (data.data?.items || []);
                setOrders(raw.map((o: { id: string; orderNumber: string; total: number; status: string; createdAt: string; items?: unknown[] }) => ({
                    id: o.id, orderNumber: o.orderNumber, total: o.total,
                    status: o.status, createdAt: o.createdAt, itemCount: o.items?.length || 0,
                })));
            }
        } catch { /* silent */ }
        finally { setOrdersLoading(false); }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await fetch('/api/v1/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                setEditMode(false);
                toast.success(locale === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated!');
            } else {
                toast.error(data.error || 'Failed to update');
            }
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setUpdating(false);
        }
    }

    const handleLogout = () => signOut({ callbackUrl: `/${locale}` });

    const statusColor = (s: string) => {
        switch (s.toLowerCase()) {
            case 'delivered': return '#10b981';
            case 'shipped': return '#3b82f6';
            case 'processing': case 'paid': return '#f59e0b';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const statusLabel = (s: string) => {
        if (locale !== 'ar') return s;
        const map: Record<string, string> = {
            delivered: 'تم التوصيل', shipped: 'تم الشحن', processing: 'جاري المعالجة',
            paid: 'مدفوع', pending: 'قيد الانتظار', cancelled: 'ملغي',
        };
        return map[s.toLowerCase()] || s;
    };

    /* Loading */
    if (status === 'loading') {
        return (
            <div style={{ minHeight: '80vh', background: '#f7f5f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#1a1a2e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280', fontWeight: 500 }}>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
                </div>
            </div>
        );
    }

    if (!session?.user) return null;
    const profile = session.user;

    const quickLinks = [
        { href: localePath('/wishlist'), label: locale === 'ar' ? 'قائمة المفضلة' : 'My Wishlist', icon: '❤️' },
        { href: localePath('/products'), label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products', icon: '🛋️' },
        { href: localePath('/cart'), label: locale === 'ar' ? 'عرض السلة' : 'View Cart', icon: '🛒' },
        { href: localePath('/track'), label: locale === 'ar' ? 'تتبع الطلب' : 'Track Order', icon: '📦' },
        ...(profile.role === 'ADMIN' ? [{ href: localePath('/admin'), label: locale === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard', icon: '⚙️' }] : []),
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f7f5f2', paddingTop: '100px', paddingBottom: '80px' }}>
            <div className="container" style={{ maxWidth: '1200px' }}>

                {/* Edit Profile Modal */}
                {editMode && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <div onClick={() => setEditMode(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
                        <div style={{ position: 'relative', background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '28px' }}>
                                {t('editProfile')}
                            </h2>
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                        {locale === 'ar' ? 'الاسم' : 'Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1a1a2e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                                        {locale === 'ar' ? 'الهاتف' : 'Phone'}
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        placeholder={locale === 'ar' ? '01XXXXXXXXX' : '+20 xxxxxxxxxx'}
                                        className="input"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                    <button type="button" onClick={() => setEditMode(false)}
                                        style={{ flex: 1, padding: '12px', border: '2px solid #1a1a2e', background: 'transparent', color: '#1a1a2e', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.color = 'white'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; }}
                                    >
                                        {tCommon('cancel')}
                                    </button>
                                    <button type="submit" disabled={updating}
                                        style={{ flex: 1, padding: '12px', background: updating ? '#9ca3af' : '#1a1a2e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: updating ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                                        onMouseEnter={e => { if (!updating) e.currentTarget.style.background = '#c9a959'; }}
                                        onMouseLeave={e => { if (!updating) e.currentTarget.style.background = '#1a1a2e'; }}
                                    >
                                        {updating ? '...' : tCommon('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Page Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '40px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.75rem)', fontWeight: 700, color: '#1a1a2e' }}>
                        {t('title')}
                    </h1>
                    <button
                        onClick={handleLogout}
                        style={{ padding: '10px 24px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                    >
                        {tCommon('signOut')}
                    </button>
                </div>

                {/* Top Grid: Profile + Quick Links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', marginBottom: '24px' }}>

                    {/* Profile Card */}
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '36px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        {/* Avatar + Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #1a1a2e 0%, #c9a959 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.75rem', fontWeight: 700, flexShrink: 0 }}>
                                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '4px' }}>
                                    {profile.name || locale === 'ar' ? 'المستخدم' : 'User'}
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
                                    {profile.role === 'ADMIN' ? `👑 ${t('admin')}` : `🛋️ ${t('member')}`}
                                </p>
                            </div>
                        </div>

                        {/* Info */}
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                                    {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                                </label>
                                <p style={{ fontWeight: 500, color: '#1a1a2e' }}>{profile.email}</p>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                            <button
                                onClick={() => setEditMode(true)}
                                style={{ padding: '11px 28px', border: '2px solid #1a1a2e', background: 'transparent', color: '#1a1a2e', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#1a1a2e'; e.currentTarget.style.color = 'white'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; }}
                            >
                                {t('editProfile')}
                            </button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '20px' }}>
                            {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {quickLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', textDecoration: 'none', color: '#1a1a2e', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', background: 'transparent', border: '1px solid transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f7f5f2'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#c9a959'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#1a1a2e'; }}
                                >
                                    <span style={{ fontSize: '1.3rem' }}>{link.icon}</span>
                                    <span style={{ flex: 1 }}>{link.label}</span>
                                    <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>→</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb', padding: '36px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>
                            {t('recentOrders')}
                        </h3>
                        {orders.length > 5 && (
                            <Link href={localePath('/track')} style={{ color: '#c9a959', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                                {locale === 'ar' ? 'عرض الكل' : 'View All'} →
                            </Link>
                        )}
                    </div>

                    {ordersLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[1, 2].map(i => (
                                <div key={i} style={{ height: '72px', background: 'linear-gradient(90deg,#f7f5f2 25%,#ede9e3 50%,#f7f5f2 75%)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#f9f9f7', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
                            <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: '24px' }}>{t('noOrders')}</p>
                            <Link href={localePath('/products')} style={{ display: 'inline-block', background: '#1a1a2e', color: 'white', padding: '12px 28px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem' }}>
                                {t('startShopping')}
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {orders.slice(0, 5).map((order) => (
                                <Link
                                    key={order.id}
                                    href={`${localePath('/track')}?order=${order.orderNumber}`}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', background: '#f9f9f7', borderRadius: '14px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'all 0.2s', flexWrap: 'wrap', gap: '12px' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a959'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <div>
                                        <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '1rem', marginBottom: '4px' }}>
                                            {order.orderNumber}
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            {order.itemCount} {locale === 'ar' ? 'منتجات' : 'items'} · {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: `${statusColor(order.status)}18`, color: statusColor(order.status) }}>
                                            {statusLabel(order.status)}
                                        </span>
                                        <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                                            {Number(order.total).toLocaleString()} {tCommon('egp')}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
