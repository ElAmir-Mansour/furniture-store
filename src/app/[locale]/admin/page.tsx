'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardData {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    lowStockItems: number;
    totalRevenue: number;
    recentOrders: Array<{
        id: string;
        orderNumber: string;
        total: number;
        status: string;
        createdAt: string;
        shippingName?: string;
        user?: { name: string; email: string };
    }>;
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: '#fffbeb', color: '#d97706' },
    CONFIRMED: { bg: '#eff6ff', color: '#2563eb' },
    PROCESSING: { bg: '#f5f3ff', color: '#7c3aed' },
    SHIPPED: { bg: '#ecfeff', color: '#0891b2' },
    DELIVERED: { bg: '#ecfdf5', color: '#059669' },
    CANCELLED: { bg: '#fef2f2', color: '#dc2626' },
};

export default function AdminDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/admin/dashboard');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
            }
        } catch {
            // Use mock data if API fails (dev)
            setData({
                todayOrders: 12,
                todayRevenue: 45600,
                pendingOrders: 8,
                lowStockItems: 3,
                totalRevenue: 342500,
                recentOrders: [],
            });
        } finally {
            setLoading(false);
        }
    }

    const stats = data ? [
        { title: "Today's Orders", value: data.todayOrders.toString(), change: 'Orders today', positive: true, icon: '📦', href: '/admin/orders' },
        { title: "Today's Revenue", value: `${data.todayRevenue.toLocaleString()} EGP`, change: 'Revenue today', positive: true, icon: '💰', href: '/admin/orders' },
        { title: 'Pending Orders', value: data.pendingOrders.toString(), change: 'Needs attention', positive: false, icon: '⏳', href: '/admin/orders?status=PENDING' },
        { title: 'Low Stock Items', value: data.lowStockItems.toString(), change: 'Restock soon', positive: false, icon: '⚠️', href: '/admin/products' },
    ] : [];

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Dashboard</h1>
                <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '0.95rem' }}>
                    Welcome back, {session?.user?.name || 'Admin'}! Here&apos;s your store overview.
                </p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', height: '110px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    {stats.map((stat) => (
                        <button
                            key={stat.title}
                            onClick={() => router.push(stat.href)}
                            style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', cursor: 'pointer', textAlign: 'left', transition: 'box-shadow 0.2s, border-color 0.2s', width: '100%' }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#c9a959'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 12px 0' }}>
                                        {stat.title}
                                    </p>
                                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px 0' }}>
                                        {stat.value}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: stat.positive ? '#059669' : '#9ca3af', margin: 0 }}>
                                        {stat.change}
                                    </p>
                                </div>
                                <span style={{ fontSize: '2rem', opacity: 0.7 }}>{stat.icon}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Bottom Row: Recent Orders + Side Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Orders */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Recent Orders</h2>
                        <Link href="/admin/orders" style={{ color: '#c9a959', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>
                            View All →
                        </Link>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>Loading...</div>
                        ) : !data?.recentOrders?.length ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                                <p style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>📭</p>
                                <p style={{ margin: 0 }}>No orders yet</p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        {['ORDER', 'CUSTOMER', 'TOTAL', 'STATUS', 'DATE'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.recentOrders.map((order) => {
                                        const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                                        return (
                                            <tr key={order.id} style={{ borderTop: '1px solid #f3f4f6', cursor: 'pointer' }}
                                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                            >
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ fontWeight: 700, color: '#c9a959', fontSize: '0.875rem' }}>#{order.orderNumber}</span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#6b7280' }}>
                                                    {order.user?.name || order.shippingName || 'Guest'}
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '0.875rem', fontWeight: 700, color: '#c9a959' }}>
                                                    {Number(order.total).toLocaleString()} EGP
                                                </td>
                                                <td style={{ padding: '14px 16px' }}>
                                                    <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9ca3af' }}>
                                                    {new Date(order.createdAt).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' })}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Quick Actions */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px 0' }}>Quick Actions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { href: '/admin/products/new', icon: '➕', label: 'Add New Product' },
                                { href: '/admin/orders?status=PENDING', icon: '📋', label: 'View Pending Orders' },
                                { href: '/admin/promos', icon: '🎟️', label: 'Manage Promo Codes' },
                                { href: '/admin/categories', icon: '📁', label: 'Manage Categories' },
                            ].map((action) => (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f9fafb', borderRadius: '10px', fontSize: '0.875rem', color: '#1a1a2e', fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                >
                                    <span>{action.icon}</span>
                                    {action.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Store Performance */}
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px 0' }}>Total Revenue</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '10px' }}>
                            <span style={{ color: '#6b7280' }}>All Time</span>
                            <span style={{ fontWeight: 700, color: '#1a1a2e' }}>
                                {data ? `${data.totalRevenue.toLocaleString()} EGP` : '—'}
                            </span>
                        </div>
                        <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden', marginBottom: '8px' }}>
                            <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #c9a959, #d4b86a)', borderRadius: '99px' }} />
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 20px 0' }}>72% of monthly goal</p>

                        <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link href="/admin/orders" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                                <span style={{ color: '#1a1a2e', fontWeight: 500, fontSize: '0.875rem' }}>All Orders</span>
                                <span style={{ color: '#c9a959', fontWeight: 700, fontSize: '0.875rem' }}>→</span>
                            </Link>
                            <Link href="/admin/products" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                                <span style={{ color: '#1a1a2e', fontWeight: 500, fontSize: '0.875rem' }}>All Products</span>
                                <span style={{ color: '#c9a959', fontWeight: 700, fontSize: '0.875rem' }}>→</span>
                            </Link>
                            <Link href="/admin/promos" style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', padding: '8px 0' }}>
                                <span style={{ color: '#1a1a2e', fontWeight: 500, fontSize: '0.875rem' }}>Promo Codes</span>
                                <span style={{ color: '#c9a959', fontWeight: 700, fontSize: '0.875rem' }}>→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
    );
}
