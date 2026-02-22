'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function AuthPage() {
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const result = await signIn('credentials', {
                    redirect: false,
                    email: formData.email,
                    password: formData.password,
                });

                if (result?.error) {
                    setError(locale === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
                } else {
                    setSuccess(t('loginSuccess'));
                    setTimeout(() => router.push(`/${locale}/account`), 1000);
                }
            } else {
                // Register
                if (formData.password !== formData.confirmPassword) {
                    setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
                    setLoading(false);
                    return;
                }

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
                    setSuccess(t('registerSuccess'));
                    // Auto-login after registration
                    await signIn('credentials', {
                        redirect: false,
                        email: formData.email,
                        password: formData.password,
                    });
                    setTimeout(() => router.push(`/${locale}/account`), 1000);
                } else {
                    setError(data.error || (locale === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'));
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(locale === 'ar' ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
            background: '#f9fafb',
        }}>
            <div style={{
                width: '100%',
                maxWidth: 420,
                background: 'white',
                borderRadius: '16px',
                padding: '40px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href={`/${locale}`} style={{
                        fontFamily: 'var(--font-display, Georgia, serif)',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#1f2937',
                        textDecoration: 'none',
                    }}>
                        {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}<span style={{ color: '#b8860b' }}>.</span>
                    </Link>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    marginBottom: '32px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    padding: '4px',
                }}>
                    <button
                        onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: isLogin ? 'white' : 'transparent',
                            color: isLogin ? '#1f2937' : '#6b7280',
                            boxShadow: isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('login')}
                    </button>
                    <button
                        onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                        style={{
                            flex: 1,
                            padding: '12px',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: !isLogin ? 'white' : 'transparent',
                            color: !isLogin ? '#1f2937' : '#6b7280',
                            boxShadow: !isLogin ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('register')}
                    </button>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#fef2f2',
                        color: '#991b1b',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        fontSize: '0.875rem',
                    }}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{
                        padding: '12px 16px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        borderRadius: '8px',
                        marginBottom: '24px',
                        fontSize: '0.875rem',
                    }}>
                        ✓ {success}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>{t('name')}</label>
                            <input
                                className="input"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required={!isLogin}
                                placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('email')}</label>
                        <input
                            className="input"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>{t('password')}</label>
                        <input
                            className="input"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                        />
                    </div>

                    {!isLogin && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>{t('confirmPassword')}</label>
                            <input
                                className="input"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required={!isLogin}
                                placeholder={locale === 'ar' ? 'أعد إدخال كلمة المرور' : 'Confirm your password'}
                            />
                        </div>
                    )}

                    {isLogin && (
                        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                            <Link href="#" style={{ color: '#b8860b', fontSize: '0.875rem', textDecoration: 'none' }}>
                                {t('forgotPassword')}
                            </Link>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: '#1f2937',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading
                            ? (locale === 'ar' ? 'جاري التحميل...' : 'Loading...')
                            : isLogin ? t('login') : t('register')
                        }
                    </button>
                </form>

                {/* Switch */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    color: '#6b7280',
                    fontSize: '0.875rem',
                }}>
                    {isLogin ? t('noAccount') : t('hasAccount')}{' '}
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#b8860b',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        {isLogin ? t('register') : t('login')}
                    </button>
                </p>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '8px',
};
