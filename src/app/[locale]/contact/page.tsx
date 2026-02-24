'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

export default function ContactPage() {
    const t = useTranslations('contact');
    const locale = useLocale();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', subject: '', message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('sent');
    };

    const contactItems = [
        { icon: '📍', label: t('address'), value: t('addressValue') },
        { icon: '📞', label: t('phone'), value: '+20 100 000 0000' },
        { icon: '✉️', label: t('email'), value: 'hello@furniture.com' },
        { icon: '🕒', label: t('hours'), value: t('hoursValue').replace(/\\n/g, '\n') },
    ];

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '11px 16px',
        border: '1.5px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '0.95rem',
        outline: 'none',
        fontFamily: 'var(--font-body)',
        background: '#fafafa',
        transition: 'border-color 0.2s',
        color: '#1a1a2e',
    };

    return (
        <div style={{ background: '#f7f5f2', minHeight: '100vh' }}>
            {/* Hero */}
            <section style={{ background: '#1a1a2e', color: 'white', padding: '80px 0', textAlign: 'center' }}>
                <div className="container">
                    <h1 className="font-display" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '16px', color: 'white' }}>
                        {t('title')}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.15rem', maxWidth: '500px', margin: '0 auto' }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'start' }}>

                        {/* Contact Info */}
                        <div>
                            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '32px' }}>
                                {t('getInTouch')}
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {contactItems.map((item, i) => (
                                    <div
                                        key={i}
                                        style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'white', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                                    >
                                        <div style={{ fontSize: '2rem', flexShrink: 0, lineHeight: 1 }}>{item.icon}</div>
                                        <div>
                                            <p className="font-display" style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1a1a2e', marginBottom: '4px' }}>{item.label}</p>
                                            <p style={{ color: '#6b7280', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                            <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '32px' }}>
                                {t('sendMessage')}
                            </h2>

                            {status === 'sent' ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(16,185,129,0.06)', borderRadius: '16px', border: '1px solid rgba(16,185,129,0.2)' }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                                    <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', marginBottom: '12px' }}>{t('messageSent')}</h3>
                                    <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '1.05rem' }}>{t('messageSuccess')}</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        style={{ padding: '10px 28px', border: '2px solid #1a1a2e', borderRadius: '8px', background: 'transparent', color: '#1a1a2e', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}
                                    >
                                        {t('sendAnother')}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', marginBottom: '8px' }}>{t('yourName')}</label>
                                            <input style={inputStyle} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                                                onFocus={e => e.target.style.borderColor = '#c9a959'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', marginBottom: '8px' }}>{t('emailAddress')}</label>
                                            <input style={inputStyle} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required
                                                onFocus={e => e.target.style.borderColor = '#c9a959'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', marginBottom: '8px' }}>{t('phoneNumber')}</label>
                                        <input style={inputStyle} type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            onFocus={e => e.target.style.borderColor = '#c9a959'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', marginBottom: '8px' }}>{t('subject')}</label>
                                        <select style={{ ...inputStyle, cursor: 'pointer' }} value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required
                                            onFocus={e => e.currentTarget.style.borderColor = '#c9a959'} onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                                            <option value="">{t('selectSubject')}</option>
                                            <option value="general">{t('general')}</option>
                                            <option value="order">{t('orderQuestion')}</option>
                                            <option value="support">{t('customerSupport')}</option>
                                            <option value="feedback">{t('feedback')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1a1a2e', marginBottom: '8px' }}>{t('yourMessage')}</label>
                                        <textarea style={{ ...inputStyle, resize: 'none' }} rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required
                                            onFocus={e => e.target.style.borderColor = '#c9a959'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        style={{ width: '100%', padding: '14px', background: status === 'sending' ? '#6b7280' : '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '1rem', cursor: status === 'sending' ? 'not-allowed' : 'pointer', transition: 'background 0.2s, transform 0.2s' }}
                                        onMouseEnter={e => { if (status !== 'sending') e.currentTarget.style.background = '#c9a959'; }}
                                        onMouseLeave={e => { if (status !== 'sending') e.currentTarget.style.background = '#1a1a2e'; }}
                                    >
                                        {status === 'sending' ? t('sending') : t('send')}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
