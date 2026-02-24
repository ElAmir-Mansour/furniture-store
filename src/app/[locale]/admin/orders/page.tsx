'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Order {
    id: string;
    orderNumber: string;
    shippingName?: string;
    shippingEmail?: string;
    shippingPhone?: string;
    total: number;
    status: string;
    paymentMethod?: string;
    items: Array<{ id: string }>;
    createdAt: string;
    user?: { name: string; email: string };
}

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: '#fffbeb', color: '#d97706' },
    CONFIRMED: { bg: '#eff6ff', color: '#2563eb' },
    PROCESSING: { bg: '#f5f3ff', color: '#7c3aed' },
    SHIPPED: { bg: '#ecfeff', color: '#0891b2' },
    DELIVERED: { bg: '#ecfdf5', color: '#059669' },
    CANCELLED: { bg: '#fef2f2', color: '#dc2626' },
};

const STATUS_NEXT: Record<string, { label: string; next: string; bg: string; color: string }> = {
    PENDING: { label: 'Confirm', next: 'CONFIRMED', bg: '#1a1a2e', color: 'white' },
    CONFIRMED: { label: 'Process', next: 'PROCESSING', bg: '#7c3aed', color: 'white' },
    PROCESSING: { label: 'Ship', next: 'SHIPPED', bg: '#0891b2', color: 'white' },
    SHIPPED: { label: 'Deliver', next: 'DELIVERED', bg: '#059669', color: 'white' },
};

const TABS = [
    { key: 'all', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrdersPage() {
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status') || 'all';

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(initialStatus);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ pageSize: '100' });
            if (filter !== 'all') params.set('status', filter);
            if (search) params.set('search', search);

            const res = await fetch(`/api/v1/admin/orders?${params}`);
            const data = await res.json();
            if (data.success) {
                setOrders(data.data.items);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [filter, search]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    async function advanceStatus(orderId: string, nextStatus: string) {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: nextStatus }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Order status updated to ${nextStatus}`);
                fetchOrders();
            } else {
                toast.error(data.error || 'Update failed');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setUpdating(null);
        }
    }

    function exportCSV() {
        const headers = ['Order Number', 'Customer', 'Email', 'Total (EGP)', 'Status', 'Payment', 'Date'];
        const rows = orders.map(o => [
            o.orderNumber,
            o.user?.name || o.shippingName || 'Guest',
            o.user?.email || o.shippingEmail || '',
            Number(o.total).toFixed(2),
            o.status,
            o.paymentMethod || 'N/A',
            new Date(o.createdAt).toLocaleDateString(),
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${filter}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('CSV downloaded!');
    }

    const statusCounts: Record<string, number> = { all: orders.length };
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px 0' }}>Orders</h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>Manage and track all customer orders</p>
                </div>
                <button
                    onClick={exportCSV}
                    style={{ padding: '10px 20px', background: '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    ⬇ Export CSV
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="search"
                    placeholder="Search by order number, customer name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', maxWidth: '480px', padding: '10px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', background: 'white', boxSizing: 'border-box' }}
                    onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
                {TABS.map((tab) => {
                    const active = filter === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            style={{
                                padding: '8px 16px', borderRadius: '10px', fontSize: '0.8125rem', fontWeight: 600,
                                whiteSpace: 'nowrap', cursor: 'pointer',
                                border: active ? 'none' : '1px solid #e5e7eb',
                                background: active ? '#c9a959' : 'white',
                                color: active ? 'white' : '#374151',
                                transition: 'all 0.15s',
                            }}
                        >
                            {tab.label} ({statusCounts[tab.key] ?? 0})
                        </button>
                    );
                })}
            </div>

            {/* Orders Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#c9a959', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        Loading orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                        <p style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>📭</p>
                        No orders found for this filter.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    {['Order', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e5e7eb' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                                    const nextAction = STATUS_NEXT[order.status];
                                    const isUpdating = updating === order.id;
                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td style={{ padding: '14px 16px' }}>
                                                <Link href={`/admin/orders/${order.id}`} style={{ fontWeight: 700, color: '#c9a959', textDecoration: 'none', fontSize: '0.875rem' }}>
                                                    {order.orderNumber}
                                                </Link>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                                                    {order.user?.name || order.shippingName || 'Guest'}
                                                </p>
                                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>
                                                    {order.user?.email || order.shippingEmail || ''}
                                                </p>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '0.875rem', color: '#374151' }}>
                                                {order.items?.length ?? 0} items
                                            </td>
                                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>
                                                {Number(order.total).toLocaleString()} EGP
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: s.bg, color: s.color }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', fontSize: '0.8125rem', color: '#9ca3af' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' })}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    <Link href={`/admin/orders/${order.id}`}
                                                        style={{ padding: '5px 12px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontSize: '12px', fontWeight: 500, textDecoration: 'none' }}>
                                                        View
                                                    </Link>
                                                    {nextAction && (
                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => advanceStatus(order.id, nextAction.next)}
                                                            style={{
                                                                padding: '5px 12px', background: isUpdating ? '#9ca3af' : nextAction.bg,
                                                                color: nextAction.color, borderRadius: '8px', fontSize: '12px',
                                                                fontWeight: 500, border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer',
                                                                transition: 'opacity 0.2s',
                                                            }}
                                                        >
                                                            {isUpdating ? '...' : nextAction.label}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
