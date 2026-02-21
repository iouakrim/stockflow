import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
    // Determine locale from cookie or fallback to French (Morocco default)
    const locale = cookies().get('NEXT_LOCALE')?.value || 'fr';

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
