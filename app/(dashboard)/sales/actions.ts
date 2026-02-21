"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function processSaleCheckout(
    items: { product_id: string; quantity: number; unit_price: number; total_price: number }[],
    customerId?: string | null,
    paymentMethod: 'cash' | 'card' | 'credit' | 'bank_transfer' = 'cash',
    discount: number = 0
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

    const cookieStore = cookies()
    let activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    if (!activeWarehouseId) {
        // Fallback to first warehouse if cookie is missing
        const { data: firstWarehouse } = await supabase.from('warehouses').select('id').limit(1).maybeSingle()
        if (firstWarehouse) {
            activeWarehouseId = firstWarehouse.id
        } else {
            throw new Error("No warehouse configured. Please set up a warehouse first.")
        }
    }

    const { data: saleId, error } = await supabase.rpc('process_sale', {
        p_tenant_id: profile.tenant_id,
        p_cashier_id: user.id,
        p_warehouse_id: activeWarehouseId,
        p_customer_id: customerId || null,
        p_payment_method: paymentMethod,
        p_items: items,
        p_discount: discount
    })

    if (error) {
        console.error("Sale Processing Error:", error)
        return { success: false, error: error.message }
    }

    return { success: true, saleId }
}

export async function quickCreateCustomer(name: string, phone: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

    if (!profile?.tenant_id) throw new Error("Missing tenant profile")

    const { data, error } = await supabase
        .from("customers")
        .insert({
            tenant_id: profile.tenant_id,
            name,
            phone,
            status: 'active'
        })
        .select("id")
        .single()

    if (error) {
        console.error("Error creating customer:", error)
        return { success: false, error: error.message }
    }

    return { success: true, id: data.id }
}
