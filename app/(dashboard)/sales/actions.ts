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

export async function cancelAndRevertSale(saleId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

    if (!profile?.tenant_id) throw new Error("Missing tenant profile")

    const { data: sale } = await supabase
        .from("sales")
        .select("*")
        .eq("id", saleId)
        .eq("tenant_id", profile.tenant_id)
        .single()

    if (!sale) throw new Error("Sale not found")

    const { data: items } = await supabase
        .from("sale_items")
        .select("*")
        .eq("sale_id", saleId)
        .eq("tenant_id", profile.tenant_id)

    if (items && items.length > 0) {
        for (const item of items) {
            const { data: p } = await supabase
                .from("products")
                .select("stock_quantity")
                .eq("id", item.product_id)
                .single()

            if (p) {
                await supabase
                    .from("products")
                    .update({ stock_quantity: p.stock_quantity + item.quantity })
                    .eq("id", item.product_id)

                await supabase.from("stock_movements").insert({
                    tenant_id: profile.tenant_id,
                    product_id: item.product_id,
                    type: "return",
                    quantity: item.quantity,
                    reference_id: saleId,
                    created_by: user.id,
                    notes: "Sale cancelled from POS"
                })
            }
        }
    }

    if (sale.payment_method === 'credit' && sale.customer_id) {
        const { data: c } = await supabase
            .from("customers")
            .select("credit_balance")
            .eq("id", sale.customer_id)
            .single()
        if (c) {
            await supabase
                .from("customers")
                .update({ credit_balance: c.credit_balance - sale.total })
                .eq("id", sale.customer_id)
        }
    }

    await supabase.from("sale_items").delete().eq("sale_id", saleId)
    await supabase.from("sales").delete().eq("id", saleId)

    return { success: true }
}
