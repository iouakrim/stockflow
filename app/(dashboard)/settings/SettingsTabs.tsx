"use client"

import { Button } from "@/components/ui/button"

export function SettingsTabs({ currentTab }: { currentTab: string }) {
    const tabs = ["Users & Roles", "General Settings", "Security", "Notifications", "Warehouses Network"]

    return (
        <div className="border-b border-primary/5 flex items-center gap-10 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
                const isActive = tab === currentTab;
                return (
                    <button
                        key={tab}
                        className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${isActive ? 'text-primary' : 'text-muted-foreground/40 hover:text-foreground'}`}
                        onClick={() => {
                            const params = new URLSearchParams(window.location.search)
                            params.set('tab', tab)
                            window.location.search = params.toString()
                        }}
                    >
                        {tab}
                        {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary shadow-lg shadow-primary/50" />}
                    </button>
                )
            })}
        </div>
    )
}
