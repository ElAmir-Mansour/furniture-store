'use client';

import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1a1a2e] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Verifying admin access...</p>
                </div>
            </div>
        );
    }

    if (status === 'unauthenticated' || (session?.user as { role?: string })?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-[#1a1a2e] text-white p-6 shrink-0 relative">
                <Link href="/admin" className="block font-display text-xl font-bold mb-8 text-white no-underline">
                    FURNITURE
                    <span className="text-xs block font-normal opacity-70 mt-1">
                        Admin Dashboard
                    </span>
                </Link>

                <nav className="flex-1 overflow-y-auto">
                    <NavSection title="Overview">
                        <NavLink href="/admin" icon="📊">Dashboard</NavLink>
                    </NavSection>

                    <NavSection title="Sales">
                        <NavLink href="/admin/orders" icon="📦">Orders</NavLink>
                        <NavLink href="/admin/customers" icon="👥">Customers</NavLink>
                        <NavLink href="/admin/promos" icon="🎟️">Promo Codes</NavLink>
                    </NavSection>

                    <NavSection title="Catalog">
                        <NavLink href="/admin/products" icon="🪑">Products</NavLink>
                        <NavLink href="/admin/categories" icon="📁">Categories</NavLink>
                        <NavLink href="/admin/inventory" icon="📋">Inventory</NavLink>
                    </NavSection>

                    <NavSection title="Content">
                        <NavLink href="/admin/home-layout" icon="🏠">Home Layout</NavLink>
                        <NavLink href="/admin/banners" icon="🖼️">Banners</NavLink>
                    </NavSection>

                    <NavSection title="Settings">
                        <NavLink href="/admin/settings" icon="⚙️">General</NavLink>
                        <NavLink href="/admin/users" icon="👤">Admin Users</NavLink>
                    </NavSection>
                </nav>

                <div className="mt-6">
                    <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                        &larr; Back to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle (Placeholder for future implementation if needed) */}
                        <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            ☰
                        </button>
                        <input
                            type="search"
                            placeholder="Search orders, products..."
                            className="hidden sm:block w-64 lg:w-80 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#c9a959] focus:ring-1 focus:ring-[#c9a959]"
                        />
                    </div>
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl hover:bg-gray-100 transition-colors">
                            🔔
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="m-0 text-sm font-medium text-gray-900">
                                    {session?.user?.name || 'Admin'}
                                </p>
                                <p className="m-0 text-xs text-gray-500">
                                    {session?.user?.email}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a959] to-[#d4b86a] flex items-center justify-center text-white font-semibold">
                                {session?.user?.name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="mb-6">
            <h4 className="text-xs uppercase tracking-wider opacity-50 mb-2">
                {title}
            </h4>
            {children}
        </div>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: ReactNode }) {
    return (
        <Link href={href} className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/85 hover:text-white hover:bg-white/10 text-sm mb-1 transition-all">
            <span>{icon}</span>
            {children}
        </Link>
    );
}
