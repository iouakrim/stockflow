import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePalette = 'default' | 'cobalt' | 'amethyst' | 'ruby' | 'amber' | 'slate';

interface ThemeState {
    palette: ThemePalette;
    setPalette: (palette: ThemePalette) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            palette: 'default',
            setPalette: (palette) => set({ palette }),
        }),
        {
            name: 'stockflow-theme',
        }
    )
);
