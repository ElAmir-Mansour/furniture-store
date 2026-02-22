'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PromoCode {
    id: string;
    code: string;
    description: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minCartValue?: number;
    maxDiscountAmount?: number;
    usageCount: number;
    maxUses?: number;
    isActive: boolean;
    startsAt: string;
    expiresAt?: string;
}

export default function AdminPromosPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchPromos();
    }, []);

    async function fetchPromos() {
        setLoading(true);
        // Mock data - replace with API
        setTimeout(() => {
            setPromos([
                { id: '1', code: 'WELCOME10', description: '10% off first order', discountType: 'PERCENT', discountValue: 10, usageCount: 45, isActive: true, startsAt: '2026-01-01T00:00:00Z' },
                { id: '2', code: 'FURNITURE20', description: '20% off orders over 10,000 EGP', discountType: 'PERCENT', discountValue: 20, minCartValue: 10000, maxDiscountAmount: 5000, usageCount: 23, maxUses: 100, isActive: true, startsAt: '2026-01-01T00:00:00Z' },
                { id: '3', code: 'FREESHIP', description: 'Free shipping', discountType: 'FIXED', discountValue: 100, usageCount: 156, isActive: true, startsAt: '2026-01-01T00:00:00Z' },
                { id: '4', code: 'SUMMER25', description: '25% summer sale', discountType: 'PERCENT', discountValue: 25, usageCount: 0, maxUses: 50, isActive: false, startsAt: '2026-06-01T00:00:00Z', expiresAt: '2026-08-31T00:00:00Z' },
            ]);
            setLoading(false);
        }, 300);
    }

    const activePromos = promos.filter(p => p.isActive);
    const totalUsage = promos.reduce((sum, p) => sum + p.usageCount, 0);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="font-display text-2xl font-bold mb-2">Promo Codes</h1>
                    <p className="text-gray-500">
                        {activePromos.length} active • {totalUsage} total uses
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="inline-flex items-center justify-center px-4 py-2 bg-[#1a1a2e] text-white font-medium rounded-lg hover:bg-[#2a2a4e] transition-colors whitespace-nowrap">
                    + Create Promo Code
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Codes', value: promos.length, icon: '🎟️' },
                    { label: 'Active', value: activePromos.length, icon: '✅' },
                    { label: 'Total Uses', value: totalUsage, icon: '📊' },
                    { label: 'This Month', value: 78, icon: '📅' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-500 mb-1 font-medium tracking-wide uppercase">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900 m-0">{stat.value}</p>
                        </div>
                        <span className="text-2xl opacity-80">{stat.icon}</span>
                    </div>
                ))}
            </div>

            {/* Promo Codes Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Conditions</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Validity</th>
                                    <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promos.map((promo) => (
                                    <tr key={promo.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="min-w-0 pr-4">
                                                <code className="font-mono font-bold text-sm bg-gray-100 px-2.5 py-1 rounded-md text-gray-800">
                                                    {promo.code}
                                                </code>
                                                <p className="m-0 mt-2 text-xs text-gray-500 truncate">
                                                    {promo.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold text-[#1a1a2e]">
                                                {promo.discountType === 'PERCENT'
                                                    ? `${promo.discountValue}%`
                                                    : `${promo.discountValue} EGP`
                                                }
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                                                {promo.minCartValue && <div>Min: {promo.minCartValue.toLocaleString()} EGP</div>}
                                                {promo.maxDiscountAmount && <div>Max: {promo.maxDiscountAmount.toLocaleString()} EGP</div>}
                                                {!promo.minCartValue && !promo.maxDiscountAmount && <span>No conditions</span>}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium text-gray-900">
                                                {promo.usageCount}
                                                {promo.maxUses && <span className="text-gray-400"> / {promo.maxUses}</span>}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${promo.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                                {promo.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 flex flex-col gap-0.5">
                                            <div>From: {new Date(promo.startsAt).toLocaleDateString('en-EG')}</div>
                                            {promo.expiresAt && <div>Until: {new Date(promo.expiresAt).toLocaleDateString('en-EG')}</div>}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors">
                                                    Edit
                                                </button>
                                                <button className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${promo.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'}`}>
                                                    {promo.isActive ? 'Disable' : 'Enable'}
                                                </button>
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
