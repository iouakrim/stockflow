"use server"

import { createClient } from "@/lib/supabase/server"

export async function resetPassword(email: string) {
    const supabase = createClient()

    // In a real app, you'd specify a redirectTo URL
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/dashboard/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
