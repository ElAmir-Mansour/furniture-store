'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
    todayOrders: number;
    todayRevenue: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockCount: number;
    totalCustomers: number;
}

interface RecentOrder {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        todayOrders: 12,
        todayRevenue: 45600,
        pendingOrders: 8,
        totalProducts: 8,
        lowStockCount: 3,
        totalCustomers: 156,
    });

    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([
        { id: '1', orderNumber: 'ORD-001', customer: 'Ahmed Mohamed', total: 24500, status: 'PENDING', createdAt: '2026-01-28T22:30:00Z' },
        { id: '2', orderNumber: 'ORD-002', customer: 'Sara Hassan', total: 18500, status: 'CONFIRMED', createdAt: '2026-01-28T21:15:00Z' },
        { id: '3', orderNumber: 'ORD-003', customer: 'Mohamed Ali', total: 32000, status: 'SHIPPED', createdAt: '2026-01-28T19:45:00Z' },
        { id: '4', orderNumber: 'ORD-004', customer: 'Fatma Ibrahim', total: 12500, status: 'DELIVERED', createdAt: '2026-01-28T18:00:00Z' },
    ]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-display text-2xl font-bold mb-2">
                    Dashboard
                </h1>
                <p className="text-gray-500">
                    Welcome back! Here's what's happening with your store today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Today's Orders"
                    value={stats.todayOrders.toString()}
                    change="+12%"
                    positive
                    icon="📦"
                />
                <StatCard
                    title="Today's Revenue"
                    value={`${stats.todayRevenue.toLocaleString()} EGP`}
                    change="+8%"
                    positive
                    icon="💰"
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders.toString()}
                    change="Needs attention"
                    icon="⏳"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockCount.toString()}
                    change="Restock soon"
                    icon="⚠️"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders - Spans 2 cols on lg screens */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                        <Link href="/admin/orders" className="text-[#c9a959] text-sm font-medium hover:underline">
                            View All &rarr;
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">Order</th>
                                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">Customer</th>
                                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">Total</th>
                                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">Status</th>
                                    <th className="py-3 px-4 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4 border-b border-gray-100">
                                            <Link href={`/admin/orders/${order.id}`} className="text-[#1a1a2e] font-medium hover:text-[#c9a959] transition-colors">
                                                #{order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-4 border-b border-gray-100 text-sm text-gray-800">{order.customer}</td>
                                        <td className="py-4 px-4 border-b border-gray-100 text-sm font-medium">{order.total.toLocaleString()} EGP</td>
                                        <td className="py-4 px-4 border-b border-gray-100">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="py-4 px-4 border-b border-gray-100 text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-EG', { day: 'numeric', month: 'short' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                        Quick Actions
                    </h2>

                    <div className="flex flex-col gap-3">
                        <QuickActionButton href="/admin/products/new" icon="➕" label="Add New Product" />
                        <QuickActionButton href="/admin/orders?status=pending" icon="📋" label="View Pending Orders" />
                        <QuickActionButton href="/admin/promos/new" icon="🎟️" label="Create Promo Code" />
                        <QuickActionButton href="/admin/inventory" icon="📦" label="Update Inventory" />
                    </div>

                    <div className="mt-8 p-5 bg-gradient-to-br from-[#c9a959]/10 to-[#1a1a2e]/5 rounded-xl border border-[#c9a959]/20">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Store Performance</h3>
                        <div className="flex justify-between text-sm mb-3">
                            <span className="text-gray-500">This Month</span>
                            <span className="font-semibold text-gray-900">342,500 EGP</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="w-[72%] h-full bg-gradient-to-r from-[#c9a959] to-[#d4b86a] rounded-full" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            72% of monthly goal (475,000 EGP)
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                {/* Top Products */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Top Selling Products
                    </h3>
                    <div className="flex flex-col">
                        {[
                            { name: 'Milano Velvet Sofa', sales: 24 },
                            { name: 'Marble Dining Table', sales: 18 },
                            { name: 'Executive Desk', sales: 15 },
                        ].map((product, i) => (
                            <div key={i} className={`flex justify-between py-3 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                                <span className="text-sm text-gray-800">{product.name}</span>
                                <span className="text-sm text-gray-500">{product.sales} sold</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Low Stock Alert
                    </h3>
                    <div className="flex flex-col">
                        {[
                            { name: 'Black Marble Table', stock: 3 },
                            { name: 'Burgundy Sofa', stock: 5 },
                            { name: 'White Oak Desk', stock: 4 },
                        ].map((item, i) => (
                            <div key={i} className={`flex justify-between items-center py-3 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                                <span className="text-sm text-gray-800">{item.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${item.stock <= 3 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {item.stock} left
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Customers */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Recent Customers
                    </h3>
                    <div className="flex flex-col">
                        {[
                            { name: 'Ahmed M.', email: 'ahmed@example.com' },
                            { name: 'Sara H.', email: 'sara@example.com' },
                            { name: 'Mohamed A.', email: 'mohamed@example.com' },
                        ].map((customer, i) => (
                            <div key={i} className={`flex items-center gap-3 py-3 ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#2a2a4e] flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                    {customer.name[0]}
                                </div>
                                <div className="min-w-0">
                                    <p className="m-0 text-sm font-medium text-gray-900 truncate">{customer.name}</p>
                                    <p className="m-0 text-xs text-gray-500 truncate">{customer.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, positive, icon }: {
    title: string;
    value: string;
    change: string;
    positive?: boolean;
    icon: string;
}) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-gray-500 mb-2">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 m-0">{value}</p>
                    <p className={`text-xs mt-2 ${positive ? 'text-emerald-500' : 'text-gray-500'}`}>
                        {change}
                    </p>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-600',
        CONFIRMED: 'bg-blue-50 text-blue-600',
        PROCESSING: 'bg-indigo-50 text-indigo-600',
        SHIPPED: 'bg-cyan-50 text-cyan-600',
        DELIVERED: 'bg-emerald-50 text-emerald-600',
        CANCELLED: 'bg-red-50 text-red-600',
    };

    const colorClass = colors[status] || colors.PENDING;

    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${colorClass}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

function QuickActionButton({ href, icon, label }: { href: string; icon: string; label: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-800 font-medium transition-colors">
            <span className="text-xl">{icon}</span>
            {label}
        </Link>
    );
}
