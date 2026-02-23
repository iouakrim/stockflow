"use client"

import { signOutUser } from "@/app/(dashboard)/settings/actions"
import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

export function SignOutButton({ collapsed, minimal }: { collapsed?: boolean; minimal?: boolean }) {
    const t = useTranslations("Sidebar")
    const handleSignOut = async () => {
        const result = await signOutUser()
        if (result.success) {
            window.location.href = "/login"
        } else {
            alert("Exit Protocol Failed: " + result.error)
        }
    }

    if (minimal) {
        return (
            <button
                onClick={handleSignOut}
                className="size-10 md:size-11 rounded-xl md:rounded-2xl bg-destructive/5 text-destructive border border-destructive/10 hover:bg-destructive/10 hover:border-destructive/20 transition-all active:scale-95 flex items-center justify-center group shadow-lg shadow-destructive/5"
                title={t("signOut")}
            >
                <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
        )
    }

    return (
        <button
            onClick={handleSignOut}
            className={`w-full flex items-center gap-3 rounded-xl font-black text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2.5 px-3 hover:bg-destructive/10 transition-all active:scale-[0.98] border border-transparent hover:border-destructive/10 ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? t("signOut") : undefined}
        >
            <LogOut className="h-4 w-4 shrink-0" /> {!collapsed && <span className="text-xs uppercase tracking-widest truncate">{t("signOut")}</span>}
        </button>
    )
}
