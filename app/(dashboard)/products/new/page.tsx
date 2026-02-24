import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProductForm } from "@/components/products/ProductForm"

export default async function NewProductPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

    if (!profile?.tenant_id) {
        throw new Error("User has no tenant assigned")
    }

    // Fetch suppliers for the dropdown
    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id, name")
        .order("name", { ascending: true })

    const t = await getTranslations("Inventory")

    return (
        <div className="flex-1 space-y-10 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/products" className="group">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/20">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary underline underline-offset-4 decoration-primary/30">{t("backToWarehouse")}</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">{t("initializeSku")}</h1>

                </div>

                <div className="flex items-center gap-3">
                    <Link href="/products">
                        <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                            {t("discardEntry")}
                        </Button>
                    </Link>
                </div>
            </div>

            <ProductForm suppliers={suppliers || []} tenantId={profile.tenant_id} />
        </div>
    )
}
