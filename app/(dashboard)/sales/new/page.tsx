import { createClient } from "@/lib/supabase/server"
import { POSClient } from "@/components/pos/POSClient"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function NewSalePage() {
    const supabase = createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch profile and access
    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id, role, warehouse_access")
        .eq("id", user.id)
        .single()

    if (!profile?.tenant_id) {
        return <div className="p-4 text-destructive font-bold text-center mt-20">Error: Configuration profile missing.</div>
    }

    const cookieStore = cookies()
    const activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    if (!activeWarehouseId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-muted-foreground uppercase tracking-widest italic opacity-50">Aucun Dépôt Actif</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Veuillez sélectionner un dépôt dans le menu supérieur pour commencer une vente.</p>
            </div>
        )
    }

    // Server-side access verification
    const isFullAccess = profile.role === 'admin' || profile.role === 'super-admin'
    const hasAccess = isFullAccess || (profile.warehouse_access?.includes(activeWarehouseId))

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-red-500 uppercase tracking-widest italic opacity-80 underline underline-offset-8">Accès Refusé</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Vous n&apos;avez pas l&apos;autorisation d&apos;opérer sur ce dépôt.</p>
            </div>
        )
    }

    // Fetch products with supplier details
    const { data: globalProducts } = await supabase
        .from("products")
        .select(`*, suppliers(name)`)
        .order("name", { ascending: true })

    // Fetch local stock
    const { data: localStockParams } = await supabase
        .from("warehouse_stock")
        .select("product_id, stock_quantity")
        .eq("warehouse_id", activeWarehouseId || '')

    const localStockMap = new Map((localStockParams || []).map(s => [s.product_id, s.stock_quantity]));

    const products = globalProducts?.map(p => ({
        ...p,
        stock_quantity: localStockMap.get(p.id) || 0
    })) || []

    // Fetch customers
    const { data: customers } = await supabase.from("customers").select("id, name, phone").order("name", { ascending: true })

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col -mt-4 -mx-4 md:-mt-10 md:-mx-10 px-3 pt-3 flex-1 overflow-hidden">
            <POSClient products={products || []} customers={customers || []} />
        </div>
    )
}
