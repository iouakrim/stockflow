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

            const { data, error } = await supabase
                .from('warehouses')
                .select('*')
                .order('name')

            if (data && data.length > 0) {
                setWarehouses(data)
                const savedId = localStorage.getItem('stockflow_active_warehouse')
                if (savedId) {
                    const saved = data.find(w => w.id === savedId)
                    if (saved) {
                        setActiveWarehouse(saved)
                        setIsLoading(false)
                        return
                    }
                }
                setActiveWarehouse(data[0])
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
