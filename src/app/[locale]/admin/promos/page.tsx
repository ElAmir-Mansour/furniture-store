'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface PromoCode {
    id: string;
    code: string;
    description?: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    minCartValue?: number;
    maxDiscountAmount?: number;
    currentUses: number;
    maxUses?: number;
    isActive: boolean;
    startsAt: string;
    expiresAt?: string;
    createdAt: string;
}

interface FormData {
    code: string;
    description: string;
    discountType: 'PERCENT' | 'FIXED';
    discountValue: string;
    minCartValue: string;
    maxDiscountAmount: string;
    maxUses: string;
    expiresAt: string;
}

const emptyForm: FormData = {
    code: '', description: '', discountType: 'PERCENT',
    discountValue: '', minCartValue: '', maxDiscountAmount: '', maxUses: '', expiresAt: '',
};

export default function AdminPromosPage() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState<FormData>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);

    const fetchPromos = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/admin/promos');
            const data = await res.json();
            if (data.success) setPromos(data.data);
        } catch {
            toast.error('Failed to load promo codes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPromos(); }, [fetchPromos]);

    function openCreate() {
        setEditingPromo(null);
        setForm(emptyForm);
        setShowModal(true);
    }

    function openEdit(promo: PromoCode) {
        setEditingPromo(promo);
        setForm({
            code: promo.code,
            description: promo.description || '',
            discountType: promo.discountType,
            discountValue: String(promo.discountValue),
            minCartValue: promo.minCartValue ? String(promo.minCartValue) : '',
            maxDiscountAmount: promo.maxDiscountAmount ? String(promo.maxDiscountAmount) : '',
            maxUses: promo.maxUses ? String(promo.maxUses) : '',
            expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 10) : '',
        });
        setShowModal(true);
    }

    async function savePromo() {
        if (!form.code.trim() || !form.discountValue) {
            toast.error('Code and discount value are required');
            return;
        }
        setSaving(true);
        try {
            const body = {
                code: form.code.toUpperCase().trim(),
                description: form.description,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minCartValue: form.minCartValue ? Number(form.minCartValue) : undefined,
                maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
                maxUses: form.maxUses ? Number(form.maxUses) : undefined,
                expiresAt: form.expiresAt || undefined,
            };

            const url = editingPromo ? `/api/v1/admin/promos/${editingPromo.id}` : '/api/v1/admin/promos';
            const method = editingPromo ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingPromo ? 'Promo code updated!' : 'Promo code created!');
                setShowModal(false);
                fetchPromos();
            } else {
                toast.error(data.error || 'Failed to save');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setSaving(false);
        }
    }

    async function togglePromo(promo: PromoCode) {
        setTogglingId(promo.id);
        try {
            const res = await fetch(`/api/v1/admin/promos/${promo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !promo.isActive }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Promo ${promo.isActive ? 'disabled' : 'enabled'} successfully`);
                fetchPromos();
            } else {
                toast.error(data.error || 'Failed to update');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setTogglingId(null);
        }
    }

    const activePromos = promos.filter(p => p.isActive);
    const totalUsage = promos.reduce((s, p) => s + p.currentUses, 0);

    const stats = [
        { label: 'Total Codes', value: promos.length, icon: '🎟️' },
        { label: 'Active', value: activePromos.length, icon: '✅' },
        { label: 'Total Uses', value: totalUsage, icon: '📊' },
        { label: 'Inactive', value: promos.length - activePromos.length, icon: '⏸️' },
    ];

    function fmtDate(d: string) {
        return new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 6px 0' }}>Promo Codes</h1>
                    <p style={{ color: '#6b7280', margin: 0 }}>{activePromos.length} active • {totalUsage} total uses</p>
                </div>
                <button
                    onClick={openCreate}
                    style={{ padding: '10px 20px', background: '#c9a959', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    + Create Promo Code
                </button>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {stats.map((stat) => (
                    <div key={stat.label} style={{ background: 'white', padding: '20px', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px 0' }}>{stat.label}</p>
                            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{stat.value}</p>
                        </div>
                        <span style={{ fontSize: '1.75rem', opacity: 0.8 }}>{stat.icon}</span>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#c9a959', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                        Loading promo codes...
                    </div>
                ) : promos.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
                        <p style={{ fontSize: '2rem', margin: '0 0 8px 0' }}>🎟️</p>
                        <p style={{ margin: '0 0 16px 0' }}>No promo codes yet</p>
                        <button onClick={openCreate} style={{ padding: '10px 20px', background: '#c9a959', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>
                            Create First Promo Code
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb' }}>
                                    {['Code', 'Discount', 'Conditions', 'Usage', 'Status', 'Validity', 'Actions'].map(h => (
                                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e5e7eb' }}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {promos.map((promo) => (
                                    <tr key={promo.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '14px 16px' }}>
                                            <code style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', color: '#1a1a2e' }}>
                                                {promo.code}
                                            </code>
                                            {promo.description && (
                                                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{promo.description}</p>
                                            )}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1a1a2e', fontSize: '0.9rem' }}>
                                            {promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `${promo.discountValue} EGP`}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280' }}>
                                            {promo.minCartValue && <div>Min: {Number(promo.minCartValue).toLocaleString()} EGP</div>}
                                            {promo.maxDiscountAmount && <div>Cap: {Number(promo.maxDiscountAmount).toLocaleString()} EGP</div>}
                                            {!promo.minCartValue && !promo.maxDiscountAmount && <span style={{ color: '#9ca3af' }}>No conditions</span>}
                                        </td>
                                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>
                                            {promo.currentUses}
                                            {promo.maxUses && <span style={{ color: '#9ca3af', fontWeight: 400 }}> / {promo.maxUses}</span>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                                background: promo.isActive ? '#ecfdf5' : '#f3f4f6',
                                                color: promo.isActive ? '#059669' : '#6b7280',
                                            }}>
                                                {promo.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6b7280' }}>
                                            <div>From: {fmtDate(promo.startsAt)}</div>
                                            {promo.expiresAt && <div>Until: {fmtDate(promo.expiresAt)}</div>}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <button
                                                    onClick={() => openEdit(promo)}
                                                    style={{ padding: '5px 12px', background: '#f3f4f6', color: '#374151', borderRadius: '8px', fontSize: '12px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    disabled={togglingId === promo.id}
                                                    onClick={() => togglePromo(promo)}
                                                    style={{
                                                        padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, border: 'none',
                                                        cursor: togglingId === promo.id ? 'not-allowed' : 'pointer',
                                                        background: promo.isActive ? '#fef2f2' : '#ecfdf5',
                                                        color: promo.isActive ? '#dc2626' : '#059669',
                                                        opacity: togglingId === promo.id ? 0.6 : 1,
                                                    }}
                                                >
                                                    {togglingId === promo.id ? '...' : promo.isActive ? 'Disable' : 'Enable'}
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

            {/* Create / Edit Modal */}
            {showModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
                >
                    <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: '#1a1a2e', margin: '0 0 24px 0' }}>
                            {editingPromo ? 'Edit Promo Code' : 'Create Promo Code'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Code */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                    Promo Code *
                                </label>
                                <input
                                    value={form.code}
                                    onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                    placeholder="e.g. SAVE20"
                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em', boxSizing: 'border-box' }}
                                    onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Description</label>
                                <input
                                    value={form.description}
                                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="e.g. 20% off all furniture"
                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>

                            {/* Discount Type + Value */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Discount Type *</label>
                                    <select
                                        value={form.discountType}
                                        onChange={(e) => setForm(f => ({ ...f, discountType: e.target.value as 'PERCENT' | 'FIXED' }))}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    >
                                        <option value="PERCENT">Percentage (%)</option>
                                        <option value="FIXED">Fixed (EGP)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                                        Value * {form.discountType === 'PERCENT' ? '(%)' : '(EGP)'}
                                    </label>
                                    <input
                                        type="number" min="0"
                                        value={form.discountValue}
                                        onChange={(e) => setForm(f => ({ ...f, discountValue: e.target.value }))}
                                        placeholder={form.discountType === 'PERCENT' ? '20' : '500'}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </div>

                            {/* Conditions */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Min Order (EGP)</label>
                                    <input
                                        type="number" min="0"
                                        value={form.minCartValue}
                                        onChange={(e) => setForm(f => ({ ...f, minCartValue: e.target.value }))}
                                        placeholder="e.g. 5000"
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Max Uses</label>
                                    <input
                                        type="number" min="0"
                                        value={form.maxUses}
                                        onChange={(e) => setForm(f => ({ ...f, maxUses: e.target.value }))}
                                        placeholder="e.g. 100"
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                        onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                        onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </div>

                            {/* Expiry */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Expiry Date</label>
                                <input
                                    type="date"
                                    value={form.expiresAt}
                                    onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                                    onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={savePromo}
                                disabled={saving}
                                style={{ flex: 1, padding: '12px', background: saving ? '#9ca3af' : '#c9a959', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.875rem', transition: 'opacity 0.2s' }}
                            >
                                {saving ? 'Saving...' : editingPromo ? 'Update Promo' : 'Create Promo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
