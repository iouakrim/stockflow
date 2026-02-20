"use client"

import { signOutUser } from "@/app/(dashboard)/settings/actions"
import { LogOut } from "lucide-react"

export function SignOutButton() {
    const handleSignOut = async () => {
        const result = await signOutUser()
        if (result.success) {
            window.location.href = "/login"
        } else {
            alert("Exit Protocol Failed: " + result.error)
        }
    }

    return (
        <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 rounded-xl font-black text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2.5 px-2 hover:bg-destructive/10 transition-colors"
        >
            <LogOut className="h-4 w-4" /> Sign Out
        </button>
    )
}
