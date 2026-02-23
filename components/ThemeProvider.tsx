'use client';

import * as React from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { palette } = useThemeStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted) return;

        const root = window.document.documentElement;
        if (palette === 'default') {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', palette);
        }
    }, [palette, mounted]);

    // Prevent flash of unstyled content by not rendering until mounted
    // or use a clever script in layout.tsx
    return <>{children}</>;
}
