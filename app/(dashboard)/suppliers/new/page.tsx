import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Truck,
    ArrowLeft,
    Building2,
    MapPin,
    Phone,
    Mail,
    User,
    Layers
} from "lucide-react"

export default async function NewSupplierPage() {
    async function addSupplier(formData: FormData) {
        "use server"

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

        const name = formData.get("name") as string
        const contact_name = formData.get("contact_name") as string
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string
        const address = formData.get("address") as string
        const category = formData.get("category") as string

        const { error } = await supabase
            .from("suppliers")
            .insert({
                tenant_id: profile.tenant_id,
                name,
                contact_name: contact_name || null,
                email: email || null,
                phone: phone || null,
                address: address || null,
                category: category || null,
                status: 'active'
            })

        if (error) {
            console.error(error)
            throw new Error(error.message)
        }

        redirect("/suppliers")
    }

    const t = await getTranslations("Suppliers")

    return (
        <div className="flex-1 space-y-10 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/suppliers" className="group">
                            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/20">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                        </Link>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary underline underline-offset-4 decoration-primary/30">{t("backToMatrix")}</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("onboardPartner")}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/suppliers">
                        <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                            {t("discardEntry")}
                        </Button>
                    </Link>
                </div>
            </div>

            <form action={addSupplier} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Identity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Building2 className="size-32" />
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Truck className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight uppercase">{t("corporateEntity")}</h3>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-label ml-1">{t("companyName")} *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 text-base font-bold focus:ring-primary focus:border-primary/30 transition-all placeholder:font-medium"
                                    placeholder={t("companyNamePlaceholder")}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="category" className="text-label ml-1">{t("primaryCommoditiesHub")}</Label>
                                <div className="relative group/input">
                                    <Layers className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <Input
                                        id="category"
                                        name="category"
                                        className="h-14 bg-card/40 border-primary/10 rounded-2xl pl-14 pr-6 font-bold focus:ring-primary transition-all"
                                        placeholder={t("categoryPlaceholder")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="address" className="text-label ml-1">{t("geographicHeadquarters")}</Label>
                                <div className="relative group/input">
                                    <MapPin className="absolute left-5 top-6 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={3}
                                        className="w-full bg-card/40 border border-primary/10 rounded-2xl pl-14 pr-6 py-4 font-medium text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 min-h-[100px]"
                                        placeholder={t("addressPlaceholder")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Communications */}
                <div className="space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group border-blue-500/20 bg-blue-500/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <User className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight uppercase">{t("directContact")}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="contact_name" className="text-label ml-1">{t("accountManager")}</Label>
                                <Input
                                    id="contact_name"
                                    name="contact_name"
                                    className="h-14 bg-card/40 border-blue-500/10 rounded-2xl px-6 font-bold focus:ring-blue-500 transition-all border"
                                    placeholder={t("contactNamePlaceholder")}
                                />
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-label ml-1">{t("voiceProtocol")}</Label>
                                <div className="relative group/input">
                                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        className="h-14 bg-card/40 border-blue-500/10 rounded-2xl pl-12 pr-6 font-bold text-sm focus:ring-blue-500 transition-all border"
                                        placeholder={t("phonePlaceholder")}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-label ml-1">{t("digitalTransmission")}</Label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="h-14 bg-card/40 border-blue-500/10 rounded-2xl pl-12 pr-6 font-bold text-sm focus:ring-blue-500 transition-all border"
                                        placeholder={t("emailPlaceholder")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-background font-black shadow-xl shadow-primary/20 rounded-2xl h-14 transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
                    >
                        {t("validatePartner")}
                    </Button>
                </div>
            </form>
        </div>
    )
}
