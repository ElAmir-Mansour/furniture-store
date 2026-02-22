'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
    id: string;
    orderNumber: string;
    customer: { name: string; email: string };
    total: number;
    status: string;
    paymentMethod: string;
    itemCount: number;
    createdAt: string;
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, [filter]);

    async function fetchOrders() {
        setLoading(true);
        // Mock data for now - replace with actual API call
        setTimeout(() => {
            setOrders([
                { id: '1', orderNumber: 'ORD-2026-001', customer: { name: 'Ahmed Mohamed', email: 'ahmed@example.com' }, total: 24500, status: 'PENDING', paymentMethod: 'COD', itemCount: 2, createdAt: '2026-01-28T22:30:00Z' },
                { id: '2', orderNumber: 'ORD-2026-002', customer: { name: 'Sara Hassan', email: 'sara@example.com' }, total: 18500, status: 'CONFIRMED', paymentMethod: 'CARD', itemCount: 1, createdAt: '2026-01-28T21:15:00Z' },
                { id: '3', orderNumber: 'ORD-2026-003', customer: { name: 'Mohamed Ali', email: 'mohamed@example.com' }, total: 32000, status: 'SHIPPED', paymentMethod: 'CARD', itemCount: 3, createdAt: '2026-01-28T19:45:00Z' },
                { id: '4', orderNumber: 'ORD-2026-004', customer: { name: 'Fatma Ibrahim', email: 'fatma@example.com' }, total: 12500, status: 'DELIVERED', paymentMethod: 'WALLET', itemCount: 1, createdAt: '2026-01-28T18:00:00Z' },
                { id: '5', orderNumber: 'ORD-2026-005', customer: { name: 'Ali Hassan', email: 'ali@example.com' }, total: 45600, status: 'PROCESSING', paymentMethod: 'COD', itemCount: 4, createdAt: '2026-01-28T16:30:00Z' },
                { id: '6', orderNumber: 'ORD-2026-006', customer: { name: 'Nour Ahmed', email: 'nour@example.com' }, total: 8900, status: 'CANCELLED', paymentMethod: 'CARD', itemCount: 1, createdAt: '2026-01-28T14:00:00Z' },
            ]);
            setLoading(false);
        }, 500);
    }

    const filteredOrders = filter === 'all'
        ? orders
        : orders.filter(o => o.status === filter);

    const statusCounts = {
        all: orders.length,
        PENDING: orders.filter(o => o.status === 'PENDING').length,
        CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
        PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
        SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
        CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold mb-2">Orders</h1>
                    <p className="text-gray-500">Manage and track all customer orders</p>
                </div>
                <button className="inline-flex items-center justify-center px-4 py-2 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors whitespace-nowrap">
                    Export Orders
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                {[
                    { key: 'all', label: 'All Orders' },
                    { key: 'PENDING', label: 'Pending' },
                    { key: 'CONFIRMED', label: 'Confirmed' },
                    { key: 'PROCESSING', label: 'Processing' },
                    { key: 'SHIPPED', label: 'Shipped' },
                    { key: 'DELIVERED', label: 'Delivered' },
                    { key: 'CANCELLED', label: 'Cancelled' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shadow-sm ${filter === tab.key
                                ? 'bg-[#c9a959] text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100'
                            }`}
                    >
                        {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts] || 0})
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading...</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No orders found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[#c9a959] hover:underline">
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            <div className="min-w-0 pr-4">
                                                <p className="m-0 font-medium text-gray-900 truncate">{order.customer.name}</p>
                                                <p className="m-0 text-xs text-gray-500 truncate mt-0.5">{order.customer.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700">{order.itemCount} items</td>
                                        <td className="p-4">
                                            <span className="font-semibold text-gray-900">{order.total.toLocaleString()} EGP</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-EG', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Link href={`/admin/orders/${order.id}`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors">
                                                    View
                                                </Link>
                                                {order.status === 'PENDING' && (
                                                    <button className="px-3 py-1.5 bg-[#1a1a2e] hover:bg-[#2a2a4e] text-white rounded-md text-xs font-medium transition-colors">
                                                        Confirm
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-500',
        CONFIRMED: 'bg-blue-50 text-blue-500',
        PROCESSING: 'bg-purple-50 text-purple-500',
        SHIPPED: 'bg-cyan-50 text-cyan-500',
        DELIVERED: 'bg-emerald-50 text-emerald-500',
        CANCELLED: 'bg-red-50 text-red-500',
    };

    const colorClass = colors[status] || colors.PENDING;

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${colorClass}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}
