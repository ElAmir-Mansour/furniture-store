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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus('sent');
    };

    return (
        <div>
            {/* Hero */}
            <section style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                color: 'white',
                padding: '80px 0',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>{t('title')}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>{t('subtitle')}</p>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '80px 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
                        {/* Contact Info */}
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', color: '#1f2937' }}>{t('getInTouch')}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {[
                                    { icon: '📍', label: t('address'), value: t('addressValue') },
                                    { icon: '📞', label: t('phone'), value: '+20 100 000 0000' },
                                    { icon: '✉️', label: t('email'), value: 'hello@furniture.com' },
                                    { icon: '🕒', label: t('hours'), value: t('hoursValue').replace(/\\n/g, '\n') },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>{item.label}</p>
                                            <p style={{ color: '#6b7280', whiteSpace: 'pre-line' }}>{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form */}
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '32px', color: '#1f2937' }}>{t('sendMessage')}</h2>
                            {status === 'sent' ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '48px',
                                    background: '#f0fdf4',
                                    borderRadius: '16px',
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
                                    <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '8px' }}>{t('messageSent')}</h3>
                                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>{t('messageSuccess')}</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        style={{
                                            padding: '12px 24px',
                                            background: '#1f2937',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {t('sendAnother')}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                        <div>
                                            <label style={labelStyle}>{t('yourName')}</label>
                                            <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>{t('emailAddress')}</label>
                                            <input className="input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={labelStyle}>{t('phoneNumber')}</label>
                                        <input className="input" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={labelStyle}>{t('subject')}</label>
                                        <select className="input" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required>
                                            <option value="">{t('selectSubject')}</option>
                                            <option value="general">{t('general')}</option>
                                            <option value="order">{t('orderQuestion')}</option>
                                            <option value="support">{t('customerSupport')}</option>
                                            <option value="feedback">{t('feedback')}</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={labelStyle}>{t('yourMessage')}</label>
                                        <textarea className="input" rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: '#1f2937',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
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

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1f2937',
    marginBottom: '8px',
};
