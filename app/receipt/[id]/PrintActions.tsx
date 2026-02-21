"use client"

import { useEffect } from "react"
import { Printer } from "lucide-react"

export function PrintActions() {
    useEffect(() => {
        // Only trigger auto-print if ?print=true is in the URL (to avoid auto-printing inside the POS iframe)
        const params = new URLSearchParams(window.location.search)
        if (params.get("print") === "true") {
            const timer = setTimeout(() => {
                window.print()
            }, 800)

            // Auto close is useful for Kiosk popup mode
            // window.onafterprint = () => window.close()

            return () => clearTimeout(timer)
        }
    }, [])

    return (
        <div className="fixed top-4 right-4 flex gap-2 print:hidden z-50">
            <button
                onClick={() => window.print()}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
                <Printer className="size-4" /> Imprimer via USB/Bluetooth
            </button>
        </div>
    )
}
