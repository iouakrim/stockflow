"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"

export function SearchInput() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [query, setQuery] = useState(searchParams.get("q") || "")

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            startTransition(() => {
                const params = new URLSearchParams(searchParams)
                if (query) {
                    params.set("q", query)
                } else {
                    params.delete("q")
                }
                router.push(`/settings?${params.toString()}`)
            })
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [query, router, searchParams])

    return (
        <div className="relative group w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
                className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border"
                placeholder="Search by name or email identifier..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {isPending && <span className="absolute right-4 top-1/2 -translate-y-1/2 size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
    )
}
