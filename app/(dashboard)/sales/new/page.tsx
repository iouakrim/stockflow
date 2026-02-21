import { createClient } from "@/lib/supabase/server"
import { POSClient } from "@/components/pos/POSClient"
import { redirect } from "next/navigation"

export default async function NewSalePage() {
    const supabase = createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch tenant profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

    if (!profile?.tenant_id) {
        return <div className="p-4 text-destructive font-bold">Error: User missing tenant_id. Please configure profile.</div>
    }

    // Fetch products with supplier details
    const { data: products } = await supabase
        .from("products")
        .select(`*, suppliers(name)`)
        .order("name", { ascending: true })

    // Fetch customers
    const { data: customers } = await supabase.from("customers").select("id, name, phone").order("name", { ascending: true })

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col -mt-4 -mx-4 md:-mt-10 md:-mx-10 px-3 pt-3 flex-1 overflow-hidden">
            <POSClient products={products || []} customers={customers || []} />
        </div>
    )
}
