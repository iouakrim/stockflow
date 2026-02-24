import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
// Force restart to resolve static asset 404 issues
const nextConfig = {};

export default withNextIntl(nextConfig);
