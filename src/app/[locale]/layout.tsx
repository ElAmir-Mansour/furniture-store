import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '../globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from 'react-hot-toast';
import { NavbarWrapper, SpacerWrapper, FooterWrapper } from '@/components/AdminLayoutFixer';

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--next-font-display',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--next-font-body',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Furniture Store | Premium Home Furnishings',
    description: 'Discover exquisite furniture pieces for your home. Premium quality sofas, beds, dining sets, and more. Free shipping across Egypt.',
};

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as 'en' | 'ar')) {
        notFound();
    }

    const messages = await getMessages();
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <body className={`${playfair.variable} ${inter.variable} font-body bg-bg text-text`} suppressHydrationWarning>
                <SessionProvider>
                    <NextIntlClientProvider messages={messages}>
                        {/* NavbarWrapper auto-hides on /admin routes */}
                        <NavbarWrapper>
                            <Navbar />
                        </NavbarWrapper>
                        {/* Spacer auto-hides on /admin routes */}
                        <SpacerWrapper />
                        <main>
                            {children}
                        </main>
                        {/* Footer auto-hides on /admin routes */}
                        <FooterWrapper>
                            <Footer />
                        </FooterWrapper>
                        <Toaster position="bottom-right" />
                    </NextIntlClientProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
