"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function processCreditPayment(
    customerId: string,
    amount: number,
    paymentMethod: "cash" | "card" | "bank_transfer" | "mobile_money",
    notes?: string
) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { data: profile } = await supabase
            .from("profiles")
            .select("tenant_id")
            .eq("id", user.id)
            .single()

        if (!profile?.tenant_id) return { success: false, error: "Missing tenant profile" }

        const { data: customer } = await supabase
            .from("customers")
            .select("credit_balance")
            .eq("id", customerId)
            .eq("tenant_id", profile.tenant_id)
            .single()

        if (!customer) return { success: false, error: "Customer not found" }

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

        if (paymentError) return { success: false, error: "Failed to record payment: " + paymentError.message }

        // 2. Update balance
        const { error: updateError } = await supabase
            .from("customers")
            .update({ credit_balance: newBalance })
            .eq("id", customerId)
            .eq("tenant_id", profile.tenant_id)

        if (updateError) return { success: false, error: "Failed to update balance: " + updateError.message }

        revalidatePath(`/customers/${customerId}`)
        revalidatePath("/customers")

        return { success: true }
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "Process failed" }
    }
}
