'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function AuthPage() {
    const t = useTranslations('auth');
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
                if (formData.password !== formData.confirmPassword) {
                    setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
                    setLoading(false);
                    return;
                }
                const res = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
                });
                const data = await res.json();
                if (data.success) {
                    setSuccess(t('registerSuccess'));
                    await signIn('credentials', { redirect: false, email: formData.email, password: formData.password });
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
            minHeight: '100vh',
            display: 'flex',
            background: '#f7f5f2',
        }}>
            {/* Left Panel — Branding */}
            <div style={{
                display: 'none',
                flex: 1,
                background: '#1a1a2e',
                padding: '60px 48px',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
            }} className="auth-left-panel">
                {/* Decorative circle */}
                <div style={{
                    position: 'absolute',
                    bottom: '-120px',
                    right: '-120px',
                    width: '480px',
                    height: '480px',
                    borderRadius: '50%',
                    border: '1px solid rgba(201,169,89,0.15)',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-60px',
                    right: '-60px',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    border: '1px solid rgba(201,169,89,0.1)',
                    pointerEvents: 'none',
                }} />

                <Link href={`/${locale}`} style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: 'white',
                    textDecoration: 'none',
                    letterSpacing: '-0.02em',
                }}>
                    {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}
                    <span style={{ color: '#c9a959' }}>.</span>
                </Link>

                <div>
                    <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                        color: 'white',
                        fontWeight: 600,
                        lineHeight: 1.2,
                        marginBottom: '20px',
                    }}>
                        {locale === 'ar' ? 'مرحباً بك في\nعالم الأثاث\nالفاخر' : 'Furniture for\nthe way you\nwant to live.'}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: '360px' }}>
                        {locale === 'ar'
                            ? 'اكتشف مجموعتنا الرائعة من الأثاث الفاخر لمنزلك.'
                            : 'Discover our curated collection of premium furniture crafted for modern living.'}
                    </p>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                    © {new Date().getFullYear()} Furniture Store. All rights reserved.
                </p>
            </div>

            {/* Right Panel — Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                minHeight: '100vh',
            }}>
                <div style={{ width: '100%', maxWidth: '420px' }}>

                    {/* Mobile logo */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }} className="auth-mobile-logo">
                        <Link href={`/${locale}`} style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '2rem',
                            fontWeight: 700,
                            color: '#1a1a2e',
                            textDecoration: 'none',
                        }}>
                            {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}
                            <span style={{ color: '#c9a959' }}>.</span>
                        </Link>
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        color: '#1a1a2e',
                        marginBottom: '8px',
                        textAlign: 'center',
                    }}>
                        {isLogin
                            ? (locale === 'ar' ? 'تسجيل الدخول' : 'Sign in')
                            : (locale === 'ar' ? 'إنشاء حساب' : 'Create account')}
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        textAlign: 'center',
                        marginBottom: '36px',
                        fontSize: '0.95rem',
                    }}>
                        {isLogin
                            ? (locale === 'ar' ? 'أدخل بياناتك للمتابعة' : 'Enter your details to continue')
                            : (locale === 'ar' ? 'أنشئ حسابك الآن مجاناً' : 'Join us — it\'s free')}
                    </p>

                    {/* Tab switcher */}
                    <div style={{
                        display: 'flex',
                        background: '#ege9e4',
                        borderRadius: '12px',
                        padding: '4px',
                        marginBottom: '28px',
                        backgroundColor: '#e8e4de',
                    }}>
                        {[
                            { label: t('login'), active: isLogin, onClick: () => { setIsLogin(true); setError(''); setSuccess(''); } },
                            { label: t('register'), active: !isLogin, onClick: () => { setIsLogin(false); setError(''); setSuccess(''); } },
                        ].map((tab) => (
                            <button
                                key={tab.label}
                                onClick={tab.onClick}
                                style={{
                                    flex: 1,
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.25s ease',
                                    background: tab.active ? 'white' : 'transparent',
                                    color: tab.active ? '#1a1a2e' : '#6b7280',
                                    boxShadow: tab.active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '14px 16px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            color: '#dc2626',
                            fontSize: '0.88rem',
                            fontWeight: 500,
                        }}>
                            <span>⚠</span>
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '14px 16px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            color: '#16a34a',
                            fontSize: '0.88rem',
                            fontWeight: 500,
                        }}>
                            <span>✓</span>
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {!isLogin && (
                            <div>
                                <label style={labelStyle}>{t('name')}</label>
                                <input
                                    style={inputStyle}
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required={!isLogin}
                                    placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c9a959'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,89,0.15)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={labelStyle}>{t('email')}</label>
                            <input
                                style={inputStyle}
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'you@example.com'}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#c9a959'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,89,0.15)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>{t('password')}</label>
                                {isLogin && (
                                    <a href="#" style={{ color: '#c9a959', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                                        {t('forgotPassword')}
                                    </a>
                                )}
                            </div>
                            <input
                                style={inputStyle}
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder={locale === 'ar' ? 'أدخل كلمة المرور' : '••••••••'}
                                onFocus={(e) => { e.currentTarget.style.borderColor = '#c9a959'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,89,0.15)'; }}
                                onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {!isLogin && (
                            <div>
                                <label style={labelStyle}>{t('confirmPassword')}</label>
                                <input
                                    style={inputStyle}
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required={!isLogin}
                                    placeholder={locale === 'ar' ? 'أعد إدخال كلمة المرور' : '••••••••'}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#c9a959'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,169,89,0.15)'; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.boxShadow = 'none'; }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                marginTop: '4px',
                                background: loading ? '#374151' : '#1a1a2e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-body)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.75 : 1,
                                transition: 'all 0.2s ease',
                                letterSpacing: '0.02em',
                            }}
                            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#c9a959'; }}
                            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1a1a2e'; }}
                        >
                            {loading
                                ? (locale === 'ar' ? 'جاري التحميل...' : 'Please wait...')
                                : isLogin
                                    ? (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                                    : (locale === 'ar' ? 'إنشاء الحساب' : 'Create Account')
                            }
                        </button>
                    </form>

                    {/* Switch */}
                    <p style={{
                        textAlign: 'center',
                        marginTop: '28px',
                        color: '#6b7280',
                        fontSize: '0.9rem',
                    }}>
                        {isLogin ? t('noAccount') : t('hasAccount')}{' '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#c9a959',
                                fontWeight: 700,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontFamily: 'var(--font-body)',
                                padding: 0,
                            }}
                        >
                            {isLogin ? t('register') : t('login')}
                        </button>
                    </p>
                </div>
            </div>

            {/* CSS for responsive left panel */}
            <style>{`
                @media (min-width: 1024px) {
                    .auth-left-panel {
                        display: flex !important;
                    }
                    .auth-mobile-logo {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: 'var(--font-body)',
    background: 'white',
    color: '#1a1a2e',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
};
