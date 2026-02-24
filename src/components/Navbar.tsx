'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import SearchModal from '@/components/SearchModal';
import { getWishlistCount } from '@/lib/wishlist';

export default function Navbar() {
    const t = useTranslations('common');
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();
    const [cartCount, setCartCount] = useState(0);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchCartCount();
        setWishlistCount(getWishlistCount());

        const handleWishlistUpdate = () => setWishlistCount(getWishlistCount());
        const handleCartUpdate = () => fetchCartCount();

        window.addEventListener('wishlistUpdated', handleWishlistUpdate);
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => {
            window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
            window.removeEventListener('cartUpdated', handleCartUpdate);
        };
    }, []);

    async function fetchCartCount() {
        try {
            const res = await fetch('/api/v1/cart');
            const data = await res.json();
            if (data.success) {
                setCartCount(data.data.itemCount);
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    }

    const switchLocale = () => {
        const newLocale = locale === 'en' ? 'ar' : 'en';
        // Get path without current locale prefix
        const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';
        router.push(`/${newLocale}${pathWithoutLocale}`);
    };

    // Build localized paths
    const localePath = (path: string) => `/${locale}${path}`;

    // Check if path is active
    const isActive = (path: string) => {
        const fullPath = `/${locale}${path}`;
        return pathname === fullPath || (path !== '/' && pathname.startsWith(fullPath));
    };

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/products', label: t('shop') },
        { href: '/categories', label: t('categories') },
        { href: '/about', label: t('about') },
        { href: '/contact', label: t('contact') },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/5 h-20 transition-all duration-300">
                <div className="container h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link href={localePath('/')} className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight" style={{ textDecoration: 'none' }}>
                        {locale === 'ar' ? 'فيرنتشر' : 'FURNITURE'}<span className="text-[#c9a959]">.</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex gap-8 items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={localePath(link.href)}
                                className={`relative text-sm transition-colors duration-200 ${isActive(link.href)
                                    ? 'text-gray-900 font-semibold'
                                    : 'text-gray-500 hover:text-gray-900 font-medium'
                                    }`}
                                style={{ textDecoration: 'none' }}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#c9a959] rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Language Switcher */}
                        <button
                            onClick={switchLocale}
                            className="flex items-center justify-center w-11 h-11 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            aria-label="Switch language"
                        >
                            {locale === 'en' ? 'عربي' : 'EN'}
                        </button>

                        {/* Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="flex items-center justify-center w-11 h-11 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            aria-label={t('search')}
                        >
                            <SearchIcon />
                        </button>

                        {/* Wishlist */}
                        <Link
                            href={localePath('/wishlist')}
                            className="relative flex items-center justify-center w-11 h-11 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            aria-label={t('wishlist')}
                        >
                            <HeartIcon />
                            {mounted && wishlistCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-[#c9a959] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Account */}
                        <Link
                            href={localePath('/account')}
                            className="flex items-center justify-center w-11 h-11 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            aria-label={t('account')}
                        >
                            <UserIcon />
                        </Link>

                        {/* Cart */}
                        <Link
                            href={localePath('/cart')}
                            className="relative flex items-center justify-center w-11 h-11 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                            aria-label={t('cart')}
                        >
                            <CartIcon />
                            {mounted && cartCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-[#c9a959] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex md:hidden items-center justify-center w-11 h-11 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            aria-label="Menu"
                        >
                            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu dropdown */}
                <div
                    className={`md:hidden absolute top-20 left-0 right-0 bg-white border-b border-gray-200 shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <div className="p-4 flex flex-col gap-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={localePath(link.href)}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.href)
                                    ? 'bg-gray-50 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                style={{ textDecoration: 'none' }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}

// Icons
function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}
