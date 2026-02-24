import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { PurchaseClient } from "@/components/purchase/PurchaseClient"

export default async function NewPurchasePage() {
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

    const isFullAccess = profile.role === 'admin' || profile.role === 'super-admin' || profile.role === 'manager'

    if (!isFullAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-red-500 uppercase tracking-widest italic opacity-80 underline underline-offset-8">Accès Refusé</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Seuls les managers et administrateurs peuvent réceptionner de la marchandise.</p>
            </div>
        )
    }

    const cookieStore = cookies()
    const activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    if (!activeWarehouseId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-muted-foreground uppercase tracking-widest italic opacity-50">Aucun Dépôt Actif</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Veuillez sélectionner un dépôt pour réceptionner la marchandise.</p>
            </div>
        )
    }

    // Server-side warehouse access verification
    const hasWarehouseAccess = profile.role === 'admin' || profile.role === 'super-admin' || profile.warehouse_access?.includes(activeWarehouseId)
    if (!hasWarehouseAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-red-500 uppercase tracking-widest italic opacity-80 underline underline-offset-8">Accès Refusé</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Vous n&apos;avez pas l&apos;autorisation d&apos;opérer sur ce dépôt.</p>
            </div>
        )
    }

    // Fetch products
    const { data: products } = await supabase
        .from("products")
        .select(`*, suppliers(name)`)
        .order("name", { ascending: true })

    // Fetch suppliers
    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("*")
        .order("name", { ascending: true })

    // Fetch current warehouse info
    const { data: warehouse } = await supabase.from('warehouses').select('name').eq('id', activeWarehouseId).single()

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col -mt-4 -mx-4 md:-mt-10 md:-mx-10 px-3 pt-3 flex-1 overflow-hidden">
            <PurchaseClient
                products={products || []}
                suppliers={suppliers || []}
                warehouseId={activeWarehouseId}
                warehouseName={warehouse?.name || 'Inconnu'}
            />
        </div>
    )
}
