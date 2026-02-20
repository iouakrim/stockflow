"use server"

import { createClient } from "@/lib/supabase/server"

export async function processSaleCheckout(
    items: { product_id: string; quantity: number; unit_price: number; total_price: number }[],
    customerId?: string | null,
    paymentMethod: 'cash' | 'card' | 'credit' | 'bank_transfer' = 'cash'
) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

    if (!profile?.tenant_id) throw new Error("Missing tenant profile")

    // The RPC `process_sale` was defined in the schema.sql:
    // process_sale(p_tenant_id UUID, p_cashier_id UUID, p_customer_id UUID, p_payment_method text, p_items JSONB)

    const { data: saleId, error } = await supabase.rpc('process_sale', {
        p_tenant_id: profile.tenant_id,
        p_cashier_id: user.id,
        p_customer_id: customerId || null,
        p_payment_method: paymentMethod,
        p_items: items
    })

    if (error) {
        console.error("Sale Processing Error:", error)
        return { success: false, error: error.message }
    }

    return { success: true, saleId }
}
