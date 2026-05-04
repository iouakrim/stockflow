"use client"

import { useEffect } from "react"

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

    return null
}
