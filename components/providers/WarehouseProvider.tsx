"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

type Warehouse = {
    id: string
    name: string
    address?: string
}

type WarehouseContextType = {
    activeWarehouse: Warehouse | null
    warehouses: Warehouse[]
    setActiveWarehouse: (w: Warehouse) => void
    isLoading: boolean
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined)

export function WarehouseProvider({ children }: { children: ReactNode }) {
    const [activeWarehouse, setActiveWarehouse] = useState<Warehouse | null>(null)
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchWarehouses() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setIsLoading(false)
                return
            }

            // 1. Fetch user profile for role and access list
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, warehouse_access')
                .eq('id', user.id)
                .single()

            if (!profile) {
                setIsLoading(false)
                return
            }

            // 2. Query warehouses
            let query = supabase.from('warehouses').select('*').order('name')

            // 3. Filter by access list if not admin
            const isFullAccess = profile.role === 'admin' || profile.role === 'super-admin'
            if (!isFullAccess) {
                if (!profile.warehouse_access || profile.warehouse_access.length === 0) {
                    setWarehouses([])
                    setIsLoading(false)
                    return
                }
                query = query.in('id', profile.warehouse_access)
            }

            const { data, error } = await query

            if (data && data.length > 0) {
                setWarehouses(data)

                // 4. Try to restore saved active warehouse
                const savedId = localStorage.getItem('stockflow_active_warehouse')
                const activeIdFromCookie = document.cookie.match(/(?:^|;)\s*stockflow_active_warehouse=([^;]*)/)?.[1]
                const targetId = savedId || activeIdFromCookie

                if (targetId) {
                    const saved = data.find(w => w.id === targetId)
                    if (saved) {
                        setActiveWarehouse(saved)
                        setIsLoading(false)
                        return
                    }
                }

                // 5. Default to first available
                setActiveWarehouse(data[0])
                // Update cookie/localstorage to stay in sync
                document.cookie = `stockflow_active_warehouse=${data[0].id}; path=/; max-age=31536000; SameSite=Lax`;
                localStorage.setItem('stockflow_active_warehouse', data[0].id)
            } else {
                setWarehouses([])
                setActiveWarehouse(null)
            }
            setIsLoading(false)
        }

        fetchWarehouses()
    }, [supabase])

    const handleSetActive = (w: Warehouse) => {
        setActiveWarehouse(w)
        localStorage.setItem('stockflow_active_warehouse', w.id)
        document.cookie = `stockflow_active_warehouse=${w.id}; path=/; max-age=31536000; SameSite=Lax`;

        // Force a page turn refresh so all downstream server/client components update data
        window.location.reload()
    }

    return (
        <WarehouseContext.Provider value={{ activeWarehouse, warehouses, setActiveWarehouse: handleSetActive, isLoading }}>
            {children}
        </WarehouseContext.Provider>
    )
}

export function useWarehouse() {
    const context = useContext(WarehouseContext)
    if (context === undefined) {
        throw new Error('useWarehouse must be used within a WarehouseProvider')
    }
    return context
}
