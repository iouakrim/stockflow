"use client"

import { useEffect } from "react"
import { AlertCircle, RefreshCcw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Dashboard error boundary caught:", error)
    }, [error])

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] text-center animate-in fade-in duration-500">
            <div className="size-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative">
                <div className="absolute inset-0 rounded-full bg-red-500/5 animate-ping" />
                <AlertCircle className="h-10 w-10 relative z-10" />
            </div>

            <h2 className="text-3xl font-black tracking-tighter mb-4 text-foreground">Une erreur inattendue s&apos;est produite</h2>

            <div className="max-w-md bg-card/50 backdrop-blur-sm border border-primary/10 rounded-2xl p-6 mb-8 shadow-inner font-mono text-xs text-left overflow-x-auto text-muted-foreground/80">
                <p className="font-bold text-red-400 mb-2">{"//"} Message d&apos;erreur technique :</p>
                <p>{error.message || "Erreur de rendu ou de récupération des données."}</p>
                {error.digest && <p className="mt-2 text-[10px] opacity-50">Digest: {error.digest}</p>}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                    onClick={() => reset()}
                    className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-[0.1em] shadow-xl shadow-primary/20 active:scale-95 transition-all gap-2"
                >
                    <RefreshCcw className="h-5 w-5" /> Tenter une récupération
                </Button>

                <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-primary/20 hover:bg-primary/5 text-primary font-black uppercase tracking-[0.1em] shadow-sm active:scale-95 transition-all gap-2">
                    <Link href="/dashboard">
                        <Home className="h-5 w-5" /> Retour à l&apos;accueil
                    </Link>
                </Button>
            </div>
        </div>
    )
}
