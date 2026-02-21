"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createWarehouse(formData: FormData) {
    const supabase = createClient()
    const name = formData.get("name") as string
    const address = formData.get("address") as string
    const online_sync = formData.get("online_sync") === "on"

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Non authentifié" }

    const { error } = await supabase
        .from("warehouses")
        .insert({
            name,
            address,
            tenant_id: (await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()).data?.tenant_id
        })

    if (error) return { error: error.message }

    revalidatePath("/warehouses")
    return { success: true }
}

export async function updateWarehouse(id: string, formData: FormData) {
    const supabase = createClient()
    const name = formData.get("name") as string
    const address = formData.get("address") as string

    const { error } = await supabase
        .from("warehouses")
        .update({ name, address })
        .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/warehouses")
    return { success: true }
}

export async function deleteWarehouse(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from("warehouses")
        .delete()
        .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/warehouses")
    return { success: true }
}
