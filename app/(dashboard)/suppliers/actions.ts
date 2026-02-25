"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSupplier(
    id: string,
    data: {
        name: string
        contact_name?: string | null
        email?: string | null
        phone?: string | null
        address?: string | null
        category?: string | null
    }
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

        const { error } = await supabase
            .from("suppliers")
            .update({
                name: data.name,
                contact_name: data.contact_name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                category: data.category
            })
            .eq("id", id)
            .eq("tenant_id", profile.tenant_id)

        if (error) return { success: false, error: error.message }

        revalidatePath(`/suppliers/${id}`)
        revalidatePath("/suppliers")

        return { success: true }
    } catch (err: unknown) {
        return { success: false, error: err instanceof Error ? err.message : "Update failed" }
    }
}
