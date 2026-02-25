'use client';

import * as React from 'react';
import { useThemeStore, ThemePalette } from '@/store/useThemeStore';
import { Check, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { updateUserTheme } from "./actions";
import { toast } from "sonner";

const palettes: { id: ThemePalette; name: string; color: string; labelKey: string }[] = [
    { id: 'default', name: 'Emerald', color: 'bg-[#11d473]', labelKey: 'optimal' },
    { id: 'cobalt', name: 'Cobalt', color: 'bg-[#3b82f6]', labelKey: 'cobalt' },
    { id: 'amethyst', name: 'Amethyst', color: 'bg-[#a855f7]', labelKey: 'amethyst' },
    { id: 'ruby', name: 'Ruby', color: 'bg-[#e11d48]', labelKey: 'ruby' },
    { id: 'amber', name: 'Amber', color: 'bg-[#f59e0b]', labelKey: 'amber' },
    { id: 'slate', name: 'Slate', color: 'bg-[#64748b]', labelKey: 'slate' },
];

export function ThemeSwitcher() {
    const { palette: currentPalette, setPalette } = useThemeStore();
    const [mounted, setMounted] = React.useState(false);
    const t = useTranslations("Settings");
    const tReports = useTranslations("Reports");

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Card className="glass-card border-primary/10 overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Palette className="size-5" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-tight underline decoration-primary/30 underline-offset-4">{t("themeSaaS")}</CardTitle>
                </div>
                <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">{t("customizeVisual")}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {palettes.map((p) => (
                        <button
                            key={p.id}
                            onClick={async () => {
                                setPalette(p.id)
                                const result = await updateUserTheme(p.id)
                                if (result.success) {
                                    toast.success(t("themeSaved"))
                                } else {
                                    toast.error(result.error)
                                }
                            }}
                            className={cn(
                                "group relative flex flex-col items-start p-4 rounded-[1.5rem] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                                currentPalette === p.id
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-primary/5 bg-card/50 hover:border-primary/20 hover:bg-primary/[0.02]"
                            )}
                        >
                            <div className={cn("size-8 rounded-full mb-3 shadow-inner flex items-center justify-center", p.color)}>
                                {currentPalette === p.id && <Check className="size-4 text-background font-black" />}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="font-black text-[10px] uppercase tracking-widest group-hover:text-primary transition-colors">{p.name}</span>
                                <span className="text-[9px] text-muted-foreground font-medium opacity-60 leading-tight">
                                    {p.id === 'default' ? tReports("optimal") : t(p.labelKey)}
                                </span>
                            </div>

                            {currentPalette === p.id && (
                                <div className="absolute top-2 right-2 flex size-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <div className="pt-4 p-4 rounded-2xl bg-primary/[0.03] border border-primary/10">
                    <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                        * Ces changements s&apos;appliquent instantanément à tous les modules : Tableau de bord, POS, Inventaire et Rapports. La palette choisie est sauvegardée dans vos préférences locales.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
