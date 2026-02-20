"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOnboardingData(formData: {
    tenantName: string;
    taxId: string;
    currency: string;
    reportingPeriod: string;
    brandColor: string;
}) {
    const supabase = createClient()

    // 1. Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: "Authentication required" }
    }

    // 2. Get tenant_id from profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return { error: "Profile not found or multiple tenants assigned" }
    }

    // 3. Update tenant data
    const { error: updateError } = await supabase
        .from('tenants')
        .update({
            name: formData.tenantName,
            tax_id: formData.taxId,
            currency: formData.currency,
            reporting_period: formData.reportingPeriod,
            brand_color: formData.brandColor,
            onboarding_completed: true,
            updated_at: new Date().toISOString()
        })
        .eq('id', profile.tenant_id)

    if (updateError) {
        return { error: updateError.message }
    }

    revalidatePath('/')
    revalidatePath('/dashboard')

    return { success: true }
}
