import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { PurchasesListClient } from "./PurchasesListClient"

export default async function PurchasesListPage() {
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
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Seuls les managers et administrateurs peuvent consulter l'historique des arrivages.</p>
            </div>
        )
    }

    const cookieStore = cookies()
    const activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    if (!activeWarehouseId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-muted-foreground uppercase tracking-widest italic opacity-50">Aucun Dépôt Actif</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Veuillez sélectionner un dépôt pour voir l'historique des arrivages.</p>
            </div>
        )
    }

    // Server-side warehouse access verification
    const hasWarehouseAccess = profile.role === 'admin' || profile.role === 'super-admin' || profile.warehouse_access?.includes(activeWarehouseId)
    if (!hasWarehouseAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-red-500 uppercase tracking-widest italic opacity-80 underline underline-offset-8">Accès Refusé</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Vous n'avez pas l'autorisation de consulter ce dépôt.</p>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col">
            <PurchasesListClient warehouseId={activeWarehouseId} />
        </div>
    )
}
