'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import LocationPicker dynamically to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
    ssr: false,
    loading: () => <div style={{ height: 400, background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading map...</div>,
});

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

export default function AddAddressPage() {
    const router = useRouter();
    const [location, setLocation] = useState<Location | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        label: 'Home',
        fullName: '',
        street: '',
        building: '',
        floor: '',
        apartment: '',
        city: '',
        governorate: 'Cairo',
        landmark: '',
        phone: '',
    });

    const handleLocationSelect = (loc: Location) => {
        setLocation(loc);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!location) {
            setError('Please select a location on the map');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/v1/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: formData.label,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    street: formData.street,
                    building: formData.building,
                    floor: formData.floor,
                    apartment: formData.apartment,
                    city: formData.city || 'Cairo',
                    governorate: formData.governorate,
                    lat: location.lat,
                    lng: location.lng,
                    isDefault: true,
                }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/account?message=Address saved successfully');
            } else {
                setError(data.error || 'Failed to save address');
            }
        } catch (err) {
            console.error('Failed to save address:', err);
            setError('Failed to save address. Please try again.');
        } finally {
            setSaving(false);
        }
    };


    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--color-bg-alt)' }}>
            <div className="container" style={{ maxWidth: 900 }}>
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <Link href="/account/addresses" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        ← Back to Addresses
                    </Link>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginTop: 'var(--spacing-md)' }}>
                        Add New Address
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Pin your location on the map for accurate delivery
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-xl)' }}>
                        {/* Map Section */}
                        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }}>
                            <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-lg)' }}>📍 Pin Location on Map</h2>
                            <LocationPicker
                                onLocationSelect={handleLocationSelect}
                                height={350}
                            />
                        </div>

                        {/* Address Details */}
                        <div style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-xl)' }}>
                            <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--spacing-lg)' }}>📝 Address Details</h2>

                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={labelStyle}>Address Label *</label>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                    {['Home', 'Work', 'Other'].map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, label }))}
                                            style={{
                                                flex: 1,
                                                padding: '12px',
                                                border: formData.label === label ? '2px solid var(--color-secondary)' : '1px solid var(--color-border)',
                                                borderRadius: 'var(--radius-md)',
                                                background: formData.label === label ? 'rgba(193, 167, 130, 0.1)' : 'var(--color-bg)',
                                                cursor: 'pointer',
                                                fontWeight: formData.label === label ? 600 : 400,
                                            }}
                                        >
                                            {label === 'Home' && '🏠'} {label === 'Work' && '💼'} {label === 'Other' && '📍'} {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={labelStyle}>Street Address *</label>
                                <input
                                    className="input"
                                    value={formData.street}
                                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                    placeholder="Street name and number"
                                    required
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                                <div>
                                    <label style={labelStyle}>Building *</label>
                                    <input
                                        className="input"
                                        value={formData.building}
                                        onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                                        placeholder="e.g., 20"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Floor</label>
                                    <input
                                        className="input"
                                        value={formData.floor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                                        placeholder="e.g., 5"
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Apartment</label>
                                    <input
                                        className="input"
                                        value={formData.apartment}
                                        onChange={(e) => setFormData(prev => ({ ...prev, apartment: e.target.value }))}
                                        placeholder="e.g., 12"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={labelStyle}>Landmark (Optional)</label>
                                <input
                                    className="input"
                                    value={formData.landmark}
                                    onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
                                    placeholder="Near mosque, pharmacy, etc."
                                />
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <label style={labelStyle}>Phone Number *</label>
                                <input
                                    className="input"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    placeholder="01XXXXXXXXX"
                                    required
                                />
                            </div>

                            {/* Location confirmation */}
                            {location && (
                                <div style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: 'var(--spacing-lg)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#10b981' }}>✓ Location pinned on map</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving || !location}
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                            >
                                {saving ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: 'var(--spacing-xs)',
    color: 'var(--color-text)',
};
