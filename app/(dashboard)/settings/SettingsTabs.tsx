"use client"

import { useTranslations } from "next-intl"

export function SettingsTabs({ currentTab, isAdmin }: { currentTab: string, isAdmin: boolean }) {
    const t = useTranslations("Sidebar")
    const tabs = [
        ...(isAdmin ? [
            { key: "Users & Roles", label: t("usersAndRoles") },
            { key: "General Settings", label: t("generalSettings") }
        ] : []),
        { key: "Appearance", label: t("appearance") }
    ]

    return (
        <div className="border-b border-primary/5 flex items-center gap-10 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
                const isActive = tab.key === currentTab;
                return (
                    <button
                        key={tab.key}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${isActive ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search)
                            params.set('tab', tab.key)
                            window.location.search = params.toString()
                        }}
                    >
                        {tab.label}
                        {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-lg shadow-primary/50" />}
                    </button>
                )
            })}
        </div>
    )
}
