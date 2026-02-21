"use client"

import { Filter } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function RoleFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentRole = searchParams.get("role") || "all"

    const setRole = (role: string) => {
        const params = new URLSearchParams(searchParams)
        if (role === "all") {
            params.delete("role")
        } else {
            params.set("role", role)
        }
        router.push(`/settings?${params.toString()}`)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-2xl h-11 px-6 text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all border-primary/10 bg-card/40">
                    <Filter className="h-4 w-4 mr-2" /> {currentRole === 'all' ? 'Filter Roles' : currentRole.toUpperCase()}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={() => setRole("all")} className="text-xs font-bold py-2.5 cursor-pointer">All Roles</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("admin")} className="text-xs font-bold py-2.5 cursor-pointer">Admin</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("manager")} className="text-xs font-bold py-2.5 cursor-pointer">Manager</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRole("cashier")} className="text-xs font-bold py-2.5 cursor-pointer">Cashier</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
