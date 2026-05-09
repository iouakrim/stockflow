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

export async function resetPassword(email: string) {
    const supabase = createClient()
    
    // Default URL to redirect back to after clicking the reset link
    // It should point to a password reset callback or standard login page.
    const resetUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/login` 
        : 'http://localhost:3000/login'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
