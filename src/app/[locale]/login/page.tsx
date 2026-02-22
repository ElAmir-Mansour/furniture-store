'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        if (mode === 'register' && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'login') {
                // Use NextAuth.js for login
                const result = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                });

                if (result?.error) {
                    setError('Invalid email or password');
                } else {
                    router.push('/account');
                    router.refresh();
                }
            } else {
                // Register through custom API, then sign in
                const res = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                const data = await res.json();

                if (data.success) {
                    // Auto sign in after registration
                    const result = await signIn('credentials', {
                        email: formData.email,
                        password: formData.password,
                        redirect: false,
                    });

                    if (result?.error) {
                        setError('Registration successful but login failed. Please sign in.');
                    } else {
                        router.push('/account');
                        router.refresh();
                    }
                } else {
                    setError(data.error || 'Registration failed');
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }


    return (
        <div style={{
            paddingTop: '100px',
            minHeight: '100vh',
            background: 'var(--color-bg-alt)',
            display: 'flex',
            alignItems: 'center',
        }}>
            <div className="container" style={{ maxWidth: 450 }}>
                <div style={{
                    background: 'var(--color-bg)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--spacing-2xl)',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <Link href="/" style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            textDecoration: 'none',
                        }}>
                            FURNITURE.
                        </Link>
                    </div>

                    {/* Tabs */}
                    <div style={{
                        display: 'flex',
                        marginBottom: 'var(--spacing-xl)',
                        background: 'var(--color-bg-alt)',
                        borderRadius: 'var(--radius-md)',
                        padding: 4,
                    }}>
                        <button
                            onClick={() => { setMode('login'); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                background: mode === 'login' ? 'var(--color-bg)' : 'transparent',
                                color: mode === 'login' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                fontWeight: mode === 'login' ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode('register'); setError(''); }}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                background: mode === 'register' ? 'var(--color-bg)' : 'transparent',
                                color: mode === 'register' ? 'var(--color-text)' : 'var(--color-text-muted)',
                                fontWeight: mode === 'register' ? 600 : 400,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {mode === 'register' && (
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={labelStyle}>Email Address</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={labelStyle}>Password</label>
                            <input
                                type="password"
                                className="input"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {mode === 'register' && (
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={labelStyle}>Confirm Password</label>
                                <input
                                    type="password"
                                    className="input"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--color-error)',
                                fontSize: '0.875rem',
                                marginBottom: 'var(--spacing-md)',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', marginBottom: 'var(--spacing-md)' }}
                        >
                            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>

                        {mode === 'login' && (
                            <div style={{ textAlign: 'center' }}>
                                <Link href="/forgot-password" style={{
                                    fontSize: '0.875rem',
                                    color: 'var(--color-secondary)',
                                }}>
                                    Forgot your password?
                                </Link>
                            </div>
                        )}
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        margin: 'var(--spacing-xl) 0',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                        <span style={{ padding: '0 var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                            or continue with
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
                    </div>

                    {/* Social Login */}
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button className="btn btn-outline" style={{ flex: 1 }}>
                            <span style={{ marginRight: 8 }}>🔵</span> Google
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1 }}>
                            <span style={{ marginRight: 8 }}>🔷</span> Facebook
                        </button>
                    </div>

                    {/* Guest Checkout */}
                    <div style={{
                        marginTop: 'var(--spacing-xl)',
                        paddingTop: 'var(--spacing-xl)',
                        borderTop: '1px solid var(--color-border)',
                        textAlign: 'center',
                    }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                            Just browsing?
                        </p>
                        <Link href="/products" style={{
                            color: 'var(--color-secondary)',
                            fontWeight: 500,
                        }}>
                            Continue as Guest →
                        </Link>
                    </div>
                </div>

                {/* Terms */}
                <p style={{
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--spacing-xl)',
                }}>
                    By continuing, you agree to our{' '}
                    <Link href="/terms" style={{ color: 'var(--color-secondary)' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" style={{ color: 'var(--color-secondary)' }}>Privacy Policy</Link>
                </p>
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
