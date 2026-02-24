'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth?redirect=/admin');
        } else if (status === 'authenticated' && session?.user) {
            const user = session.user as { role?: string };
            if (user.role !== 'ADMIN') {
                router.push('/');
            }
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f5f2' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#1a1a2e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>Verifying admin access...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (status === 'unauthenticated' || (session?.user as { role?: string })?.role !== 'ADMIN') {
        return null;
    }

    const navSections = [
        {
            title: 'Overview',
            links: [{ href: '/admin', icon: '📊', label: 'Dashboard' }],
        },
        {
            title: 'Sales',
            links: [
                { href: '/admin/orders', icon: '📦', label: 'Orders' },
                { href: '/admin/promos', icon: '🎟️', label: 'Promo Codes' },
            ],
        },
        {
            title: 'Catalog',
            links: [
                { href: '/admin/products', icon: '🪑', label: 'Products' },
                { href: '/admin/categories', icon: '📁', label: 'Categories' },
            ],
        },
    ];

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (min-width: 1024px) { .admin-sidebar { display: flex !important; } }
            `}</style>

            {/* Full-screen admin layout — NavbarWrapper/SpacerWrapper/FooterWrapper already hidden by AdminLayoutFixer */}
            <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f5f2' }}>
                {/* Sidebar */}
                <aside
                    className="admin-sidebar"
                    style={{
                        display: 'none',
                        flexDirection: 'column',
                        width: '256px',
                        background: '#0a0a14',
                        color: 'white',
                        flexShrink: 0,
                        position: 'sticky',
                        top: 0,
                        height: '100vh',
                        overflowY: 'auto',
                    }}
                >
                    {/* Brand */}
                    <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <Link href="/admin" style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'white', textDecoration: 'none' }}>
                            FURNITURE<span style={{ color: '#c9a959' }}>.</span>
                            <span style={{ display: 'block', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 400, color: 'rgba(255,255,255,0.4)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Admin Suite
                            </span>
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 700, padding: '0 8px', marginBottom: '12px' }}>
                                    {section.title}
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {section.links.map((link) => {
                                        const isActive = pathname === link.href || (link.href !== '/admin' && pathname?.startsWith(link.href));
                                        return (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '10px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    textDecoration: 'none',
                                                    transition: 'all 0.2s',
                                                    background: isActive ? 'rgba(201,169,89,0.15)' : 'transparent',
                                                    color: isActive ? '#c9a959' : 'rgba(255,255,255,0.6)',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.color = 'white';
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                                                        e.currentTarget.style.background = 'transparent';
                                                    }
                                                }}
                                            >
                                                <span>{link.icon}</span>
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Back to Store */}
                    <div style={{ padding: '20px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <Link
                            href="/"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                        >
                            ← Back to Store
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                    {/* Top Bar */}
                    <header style={{
                        height: '64px',
                        background: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 32px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                        {/* Search Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const q = searchQuery.trim();
                                    if (!q) return;
                                    // Search orders by number/name or products by name
                                    if (/^ORD/i.test(q)) {
                                        router.push(`/admin/orders?search=${encodeURIComponent(q)}`);
                                    } else {
                                        router.push(`/admin/products?search=${encodeURIComponent(q)}`);
                                    }
                                }}
                                style={{ display: 'flex', gap: '8px' }}
                            >
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search orders, products..."
                                    style={{ width: '280px', padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', background: '#f9fafb' }}
                                    onFocus={(e) => e.target.style.borderColor = '#c9a959'}
                                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </form>
                        </div>

                        {/* Right Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                            {/* Notification Bell */}
                            <div ref={notifRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowNotif(v => !v)}
                                    style={{ width: '40px', height: '40px', borderRadius: '10px', background: showNotif ? '#f3f4f6' : '#f7f5f2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}
                                >
                                    🔔
                                    <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#dc2626', borderRadius: '50%', border: '2px solid white' }} />
                                </button>
                                {showNotif && (
                                    <div style={{ position: 'absolute', top: '48px', right: 0, width: '300px', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                                        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>Notifications</p>
                                        </div>
                                        <div style={{ padding: '12px 16px' }}>
                                            <Link href="/admin/orders?status=PENDING" onClick={() => setShowNotif(false)}
                                                style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '10px', textDecoration: 'none', background: '#fffbeb' }}>
                                                <span style={{ fontSize: '1.2rem' }}>⏳</span>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8125rem', color: '#111827' }}>Pending Orders</p>
                                                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Review & confirm pending orders</p>
                                                </div>
                                            </Link>
                                        </div>
                                        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                                            <Link href="/admin/orders" onClick={() => setShowNotif(false)}
                                                style={{ display: 'block', textAlign: 'center', color: '#c9a959', fontSize: '0.8125rem', fontWeight: 700, textDecoration: 'none' }}>
                                                View all orders →
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* User Avatar + Dropdown */}
                            <div ref={userMenuRef} style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowUserMenu(v => !v)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '10px', background: showUserMenu ? '#f3f4f6' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                                >
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>
                                            {session?.user?.name || 'Admin'}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Admin</p>
                                    </div>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #c9a959, #d4b86a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a1a2e', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                                        {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                </button>

                                {showUserMenu && (
                                    <div style={{ position: 'absolute', top: '52px', right: 0, width: '200px', background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: '#111827' }}>{session?.user?.name}</p>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>{session?.user?.email}</p>
                                        </div>
                                        <div style={{ padding: '8px' }}>
                                            <Link href="/" onClick={() => setShowUserMenu(false)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                🏠 Back to Store
                                            </Link>
                                            <button
                                                onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: '/' }); }}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', color: '#dc2626', background: 'transparent', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                🚪 Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
