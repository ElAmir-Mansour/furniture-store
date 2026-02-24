'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * Wraps Navbar, spacer div, page content, and Footer.
 * On /admin routes it hides the Navbar, spacer, and Footer so the
 * AdminLayout can take full control of the viewport.
 */
export function NavbarWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.includes('/admin');
    if (isAdmin) return null;
    return <>{children}</>;
}

export function SpacerWrapper() {
    const pathname = usePathname();
    const isAdmin = pathname?.includes('/admin');
    if (isAdmin) return null;
    return <div id="navbar-spacer" style={{ height: '80px', flexShrink: 0 }} aria-hidden="true" />;
}

export function FooterWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.includes('/admin');
    if (isAdmin) return null;
    return <>{children}</>;
}
