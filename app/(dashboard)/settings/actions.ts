"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Handles account deletion.
 * In a real production app, this should probably be a "soft delete" or 
 * require additional security confirmation. 
 */
export async function deleteUserAccount() {
    const supabase = createClient()

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: "Security validation failed. Session required." }
    }

    // 2. We can delete the profile and associated data.
    // Note: Deleting from auth.users requires service_role client usually.
    // For this demo, let's just log them out and maybe mark the profile as deleted.

    // For a real "Total Wipe", you would:
    // const { error } = await supabase.auth.admin.deleteUser(user.id) // Requires Service Role

    // Let's implement Logout as a basic "Exit Protocol" for now, or just return an error
    // because we don't have service_role here to delete the auth user.

    return { error: "Administrative privilege required for total wipeout. Contact StockFlow Support." }
}

/**
 * Signs out the current session.
 */
export async function signOutUser() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) return { error: error.message }
    return { success: true }
}
