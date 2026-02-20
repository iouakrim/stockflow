"use server"

import { createClient } from "@/lib/supabase/server"

export async function signInUser(formData: {
    email: string;
    password: string;
}) {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
