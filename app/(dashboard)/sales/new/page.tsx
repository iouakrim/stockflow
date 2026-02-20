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

    // Fetch products
    const { data: products } = await supabase.from("products").select("*").order("name", { ascending: true })

    return (
        <div className="h-full flex flex-col">
            <div className="md:mb-4 mb-2 flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-bold">New Sale (POS)</h1>
            </div>
            <POSClient products={products || []} />
        </div>
    )
}
