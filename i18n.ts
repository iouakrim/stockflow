import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Determine locale from cookie or fallback to French (Morocco default)
    let locale = cookies().get('NEXT_LOCALE')?.value || 'fr';

    // Support only allowed locales
    const locales = ['en', 'fr', 'ar'];
    if (!locales.includes(locale)) {
        locale = 'fr';
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
