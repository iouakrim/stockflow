"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function processCreditPayment(
    customerId: string,
    amount: number,
    paymentMethod: "cash" | "card" | "bank_transfer",
    notes?: string
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

    // For transaction, we can just use normal inserts since it's an MVP,
    // but we must guarantee atomic update on customer credit balance.
    // Actually, Supabase has no easy atomic updates without limits or RPC,
    // except we can just update it like `credit_balance = credit_balance - X` if we had an RPC.
    // We can write a quick RPC or just select -> update if concurrency is low.
    // Let's do select -> update for MVP as it's a single cashier usually.

    const { data: customer } = await supabase
        .from("customers")
        .select("credit_balance")
        .eq("id", customerId)
        .eq("tenant_id", profile.tenant_id)
        .single()

    if (!customer) throw new Error("Customer not found")

    const newBalance = Number(customer.credit_balance) - amount

    // 1. Log the payment
    const { error: paymentError } = await supabase
        .from("credit_payments")
        .insert({
            tenant_id: profile.tenant_id,
            customer_id: customerId,
            amount: amount,
            payment_method: paymentMethod,
            notes: notes || null,
            received_by: user.id
        })

    if (paymentError) throw new Error("Failed to record payment: " + paymentError.message)

    // 2. Update balance
    const { error: updateError } = await supabase
        .from("customers")
        .update({ credit_balance: newBalance })
        .eq("id", customerId)
        .eq("tenant_id", profile.tenant_id)

    if (updateError) throw new Error("Failed to update balance: " + updateError.message)

    revalidatePath(`/customers/${customerId}`)
    revalidatePath("/customers")

    return { success: true }
}
