"use server"

import { createClient } from "@/lib/supabase/server"

export async function updatePassword(password: string) {
    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
