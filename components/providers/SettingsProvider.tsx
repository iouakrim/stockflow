"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

type SettingsContextType = {
    currency: string
    isLoading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState("DH")
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchSettings() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    setIsLoading(false)
                    return
                }

                // 1. Fetch user profile to get tenant_id
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('tenant_id')
                    .eq('id', user.id)
                    .single()

                if (profile?.tenant_id) {
                    // 2. Fetch tenant settings
                    const { data: tenant } = await supabase
                        .from('tenants')
                        .select('currency')
                        .eq('id', profile.tenant_id)
                        .single()

                    if (tenant?.currency) {
                        setCurrency(tenant.currency)
                    }
                }
            } catch (error) {
                console.error("Error fetching settings:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSettings()
    }, [supabase])

    return (
        <SettingsContext.Provider value={{ currency, isLoading }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext)
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}
