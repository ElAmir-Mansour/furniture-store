'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

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
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push(localePath('/auth'));
        }
    }, [status, router, locale]);

    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                phone: '',
            });
            fetchOrders();
        }
    }, [session]);

    async function fetchOrders() {
        try {
            const res = await fetch('/api/v1/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data.map((order: { id: string; orderNumber: string; total: number; status: string; createdAt: string; items: unknown[] }) => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    total: order.total,
                    status: order.status,
                    createdAt: order.createdAt,
                    itemCount: order.items?.length || 0,
                })));
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
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
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: `/${locale}` });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return '#10b981';
            case 'shipped': return '#3b82f6';
            case 'processing': case 'paid': return '#f59e0b';
            case 'pending': return '#6b7280';
            case 'cancelled': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        if (locale === 'ar') {
            switch (status.toLowerCase()) {
                case 'delivered': return 'تم التوصيل';
                case 'shipped': return 'تم الشحن';
                case 'processing': return 'جاري المعالجة';
                case 'paid': return 'مدفوع';
                case 'pending': return 'قيد الانتظار';
                case 'cancelled': return 'ملغي';
                default: return status;
            }
        }
        return status;
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40, height: 40,
                        border: '3px solid #e5e7eb',
                        borderTopColor: 'var(--color-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        {locale === 'ar' ? 'جاري تحميل حسابك...' : 'Loading your account...'}
                    </p>
                </div>
            </div>
        );
    }

    if (!session?.user) {
        return null;
    }

    const profile = session.user;

    const quickLinks = [
        { href: localePath('/account/addresses/new'), label: locale === 'ar' ? 'إضافة عنوان جديد' : 'Add New Address', icon: '📍' },
        { href: localePath('/wishlist'), label: locale === 'ar' ? 'قائمة المفضلة' : 'My Wishlist', icon: '❤️' },
        { href: localePath('/products'), label: locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products', icon: '🛋️' },
        { href: localePath('/cart'), label: locale === 'ar' ? 'عرض السلة' : 'View Cart', icon: '🛒' },
        { href: localePath('/track'), label: locale === 'ar' ? 'تتبع الطلب' : 'Track Order', icon: '📦' },
        ...(profile.role === 'ADMIN' ? [{
            href: localePath('/admin'),
            label: locale === 'ar' ? 'لوحة الإدارة' : 'Admin Dashboard',
            icon: '⚙️'
        }] : []),
    ];

    return (
        <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '40px var(--spacing-lg) var(--spacing-2xl)',
            minHeight: '80vh'
        }}>
            {/* Edit Profile Modal */}
            {editMode && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}>
                    <div onClick={() => setEditMode(false)} style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                    }} />
                    <div style={{
                        position: 'relative',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        width: '100%',
                        maxWidth: 400,
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>
                            {t('editProfile')}
                        </h2>
                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                                    {locale === 'ar' ? 'الاسم' : 'Name'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                                    {locale === 'ar' ? 'الهاتف' : 'Phone'}
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+20 xxx xxx xxxx"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditMode(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {tCommon('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        background: '#1f2937',
                                        color: 'white',
                                        fontWeight: 600,
                                        cursor: updating ? 'wait' : 'pointer',
                                    }}
                                >
                                    {updating
                                        ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                                        : tCommon('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>{t('title')}</h1>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        background: '#fef2f2',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    {tCommon('signOut')}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
                {/* Profile Card */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    border: '1px solid var(--color-border)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                        <div style={{
                            width: 64, height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #b8860b 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '1.5rem', fontWeight: 600
                        }}>
                            {profile.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{profile.name}</h2>
                            <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                                {profile.role === 'ADMIN'
                                    ? `👑 ${t('admin')}`
                                    : `🛋️ ${t('member')}`}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                            </label>
                            <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{profile.email}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--spacing-xl)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                            onClick={() => setEditMode(true)}
                            style={{
                                flex: 1, padding: '12px', border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)', background: 'transparent',
                                cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem'
                            }}
                        >
                            {t('editProfile')}
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-xl)',
                    border: '1px solid var(--color-border)'
                }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                        {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {quickLinks.map((link) => (
                            <Link key={link.href} href={link.href} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                textDecoration: 'none', color: 'inherit',
                                transition: 'background 0.2s',
                                border: '1px solid var(--color-border)'
                            }}>
                                <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
                                <span style={{ fontWeight: 500 }}>{link.label}</span>
                                <span style={{ marginInlineStart: 'auto', color: 'var(--color-text-muted)' }}>
                                    {locale === 'ar' ? '←' : '→'}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div style={{
                marginTop: 'var(--spacing-2xl)',
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                border: '1px solid var(--color-border)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>{t('recentOrders')}</h3>
                </div>

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--color-text-muted)' }}>
                        <p>{t('noOrders')}</p>
                        <Link href={localePath('/products')} style={{ color: 'var(--color-primary)' }}>
                            {t('startShopping')}
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {orders.slice(0, 5).map((order) => (
                            <Link
                                key={order.id}
                                href={`${localePath('/track')}?order=${order.orderNumber}`}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-md) var(--spacing-lg)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    flexWrap: 'wrap',
                                    gap: 'var(--spacing-md)',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    transition: 'background 0.2s',
                                }}
                            >
                                <div>
                                    <p style={{ fontWeight: 600, margin: 0 }}>{order.orderNumber}</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                                        {order.itemCount} {locale === 'ar' ? 'منتجات' : 'items'} • {new Date(order.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        background: `${getStatusColor(order.status)}20`,
                                        color: getStatusColor(order.status)
                                    }}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {Number(order.total).toLocaleString()} {tCommon('egp')}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
