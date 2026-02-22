import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import '../globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import Navbar from '@/components/Navbar';
import { Toaster } from 'react-hot-toast';

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

    // Validate locale
    if (!routing.locales.includes(locale as 'en' | 'ar')) {
        notFound();
    }

    // Get messages for the locale
    const messages = await getMessages();

    // Determine text direction
    const dir = locale === 'ar' ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} suppressHydrationWarning>
            <body className={`${playfair.variable} ${inter.variable} font-body bg-bg text-text`} suppressHydrationWarning>
                <SessionProvider>
                    <NextIntlClientProvider messages={messages}>
                        <Navbar />
                        <main style={{ paddingTop: 80 }}>
                            {children}
                        </main>
                        <Toaster position="bottom-right" />
                    </NextIntlClientProvider>
                </SessionProvider>
            </body>
        </html>
    );
}
