import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WarehousesClient } from "./WarehousesClient"

export default async function WarehousesPage() {
    const supabase = createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (!['admin', 'super-admin'].includes(profile?.role || '')) {
        redirect("/dashboard")
    }

    // Fetch warehouses
    const { data: warehouses } = await supabase
        .from("warehouses")
        .select("*")
        .order("created_at", { ascending: false })

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            <WarehousesClient initialWarehouses={warehouses || []} />
        </div>
    )
}
