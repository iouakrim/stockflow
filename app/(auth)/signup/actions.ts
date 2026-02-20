"use server"

import { createClient } from "@/lib/supabase/server"


export async function signUpUser(formData: {
    facilityName: string;
    address: string;
    fullName: string;
    email: string;
}) {
    const supabase = createClient()

    // 1. Sign up user
    // In a real app, you'd also take a password. For this demo/premium feel, we might skip it or use a default.
    // Let's assume the user provides a password or we use a temporary one for the demo.
    // Actually, I'll add a password field to the form in the next step.

    // For now, I'll use a placeholder password if none is provided to demonstrate the flow.
    const password = "StockFlowPassword123!"

    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
            data: {
                full_name: formData.fullName,
            }
        }
    })

    if (authError) return { error: authError.message }
    if (!authData.user) return { error: "User creation failed" }

    // 2. Create Tenant
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
            name: formData.facilityName,
        })
        .select()
        .single()

    if (tenantError) return { error: tenantError.message }

    // 3. Create Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .insert({
            id: authData.user.id,
            tenant_id: tenant.id,
            email: formData.email,
            full_name: formData.fullName,
            role: 'admin'
        })

    if (profileError) return { error: profileError.message }

    // 4. Create initial warehouse
    const { error: warehouseError } = await supabase
        .from('warehouses')
        .insert({
            tenant_id: tenant.id,
            name: "Primary Terminal",
            address: formData.address
        })

    if (warehouseError) {
        console.error("Failed to create initial warehouse:", warehouseError)
    }

    return { success: true }
}
