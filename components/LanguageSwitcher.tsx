"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
    { code: "fr", label: "Français" },
    { code: "ar", label: "العربية" },
    { code: "en", label: "English" },
];

export function LanguageSwitcher() {
    const [currentLocale, setCurrentLocale] = useState("fr");
    const supabase = createClient();

    useEffect(() => {
        const match = document.cookie.match(/(?:^|;)\s*NEXT_LOCALE=([^;]*)/);
        if (match) {
            setCurrentLocale(match[1]);
        }
    }, []);

    const setLanguage = async (locale: string) => {
        document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
        setCurrentLocale(locale);

        // Update profile in background if user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase.from('profiles').update({ preferred_language: locale }).eq('id', user.id);
        }

        window.location.reload();
    };

    const currentLang = LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative size-10 md:size-11 rounded-xl md:rounded-2xl bg-accent/30 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10" title="Changer de Langue">
                    <Globe className="h-5 w-5" />
                    <span className="absolute -bottom-1 -right-1 text-[8px] font-black uppercase bg-primary text-background rounded-md px-1">{currentLang.code}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-2xl border-primary/10 shadow-xl p-2 glass-card space-y-1">
                {LANGUAGES.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`rounded-xl px-3 py-2 cursor-pointer font-bold gap-3 ${currentLocale === lang.code ? 'bg-primary/10 text-primary' : 'hover:bg-accent'}`}
                    >
                        {lang.label}
                        {currentLocale === lang.code && <div className="size-1.5 bg-primary rounded-full animate-pulse ml-auto" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
