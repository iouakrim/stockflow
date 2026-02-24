"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

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

    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (error) return { error: error.message }
    return { success: true }
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

/**
 * Invites a new user to the organization.
 */
export async function inviteUser(data: { email: string, fullName: string, role: string, warehouseAccess: string[] }) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    // Check if current user is admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { error: "Non authentifié" }

    const { data: profile } = await supabase.from("profiles").select("role, tenant_id").eq("id", currentUser.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin') {
        return { error: "Permission refusée" }
    }

    // 1. Invite user via Supabase Auth
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(data.email, {
        data: { full_name: data.fullName },
        // Use origin if available, or fallback to env
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?next=/dashboard`
    })

    if (inviteError) return { error: inviteError.message }

    // 2. The profile might be created by a trigger on Auth signup, 
    // but since this is an "Invite", we might need to update the profile 
    // that the trigger creates or insert it explicitly if there is no trigger.

    // Check if profile exists (created by trigger)
    const { data: existingProfile } = await adminSupabase.from("profiles").select("id").eq("id", inviteData.user.id).single()

    if (existingProfile) {
        const { error: updateError } = await adminSupabase
            .from("profiles")
            .update({
                full_name: data.fullName,
                role: data.role,
                warehouse_access: data.warehouseAccess
            })
            .eq("id", inviteData.user.id)
        if (updateError) return { error: updateError.message }
    } else {
        const { error: insertError } = await adminSupabase
            .from("profiles")
            .insert({
                id: inviteData.user.id,
                tenant_id: profile.tenant_id,
                email: data.email,
                full_name: data.fullName,
                role: data.role,
                warehouse_access: data.warehouseAccess
            })
        if (insertError) return { error: insertError.message }
    }

    revalidatePath("/settings")
    return { success: true }
}

/**
 * Administrative: Updates a user's role and warehouse access.
 */
export async function updateUserAccess(userId: string, data: { role: string, warehouseAccess: string[] }) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    // 1. Authorization check
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { error: "Non authentifié" }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin') {
        return { error: "Permission refusée" }
    }

    // 2. Prevent self-demotion (optional but safe)
    if (userId === currentUser.id && data.role !== 'admin') {
        return { error: "Vous ne pouvez pas rétrograder votre propre compte administrateur." }
    }

    // 3. Update profile
    const { error } = await adminSupabase
        .from("profiles")
        .update({
            role: data.role,
            warehouse_access: data.warehouseAccess
        })
        .eq("id", userId)

    if (error) return { error: error.message }

    revalidatePath("/settings")
    return { success: true }
}

/**
 * Administrative: Deletes a user account entirely.
 */
export async function deleteUser(userId: string) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) return { error: "Non authentifié" }
    if (userId === currentUser.id) return { error: "Vous ne pouvez pas supprimer votre propre compte." }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin') {
        return { error: "Permission refusée" }
    }

    // Delete Auth User (Triggers profile deletion due to CASCADE in schema)
    const { error } = await adminSupabase.auth.admin.deleteUser(userId)
    if (error) return { error: error.message }

    revalidatePath("/settings")
    return { success: true }
}

/**
 * Sends a password reset email to a user.
 */
export async function sendUserResetPassword(email: string) {
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm?next=/dashboard`
        }
    })

    if (error) return { error: error.message }
    return { success: true }
}

/**
 * Updates the organization (tenant) name.
 */
export async function updateTenantName(name: string) {
    const supabase = createClient()

    // 1. Authorization check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Non authentifié" }

    const { data: profile } = await supabase.from("profiles").select("role, tenant_id").eq("id", user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin') {
        return { error: "Permission refusée" }
    }

    if (!profile.tenant_id) return { error: "Tenant non trouvé" }

    // 2. Update tenant
    const { error } = await supabase
        .from("tenants")
        .update({ name })
        .eq("id", profile.tenant_id)

    if (error) return { error: error.message }

    revalidatePath("/settings")
    return { success: true }
}

/**
 * Updates the current user's preferred theme palette.
 */
export async function updateUserTheme(palette: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "Non authentifié" }

    const { error } = await supabase
        .from("profiles")
        .update({ preferred_palette: palette })
        .eq("id", user.id)

    if (error) return { error: error.message }
    return { success: true }
}
