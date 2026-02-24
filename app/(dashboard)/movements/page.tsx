import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { MovementsClient } from "./MovementsClient"
import { getTranslations } from "next-intl/server"

export default async function MovementsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, warehouse_access")
        .eq("id", user.id)
        .single()

    const cookieStore = cookies()
    const activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    const t = await getTranslations("Inventory")

    const isFullAccess = profile?.role === 'admin' || profile?.role === 'super-admin'
    // Access validation
    if (activeWarehouseId && !isFullAccess) {
        if (!profile?.warehouse_access?.includes(activeWarehouseId)) {
            return <div className="p-20 text-center font-black uppercase text-red-500 tracking-widest italic tracking-widest bg-red-500/10 rounded-3xl animate-pulse">{t("restrictedAccess")}</div>
        }
    }

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("movementsHistory")}</h1>
                    <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest mt-2">{t("auditTrail")}</p>
                </div>
            </div>

            <MovementsClient activeWarehouseId={activeWarehouseId} />
        </div>
    )
}
