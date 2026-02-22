import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    localePrefix: 'as-needed'  // Only show locale prefix for non-default locale
});

export type Locale = (typeof routing.locales)[number];
