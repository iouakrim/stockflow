import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BulkEntryClient } from "./BulkEntryClient"
import { getTranslations } from "next-intl/server"

export default async function ImportProductsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const t = await getTranslations("BulkImport")

    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("status", "active")
        .order("name", { ascending: true })

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/products" className="group">
                    <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/20">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">
                        {t("title")}
                    </h1>
                    <p className="text-xs text-muted-foreground/50 font-bold uppercase tracking-widest mt-1">
                        {t("hint")}
                    </p>
                </div>
            </div>

            <BulkEntryClient
                tenantId={profile?.tenant_id ?? ""}
                suppliers={suppliers ?? []}
            />
        </div>
    )
}
