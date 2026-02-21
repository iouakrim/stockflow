import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, User, Mail, Phone, MapPin, Save, UserPlus } from "lucide-react"

export default function NewCustomerPage() {
    async function addCustomer(formData: FormData) {
        "use server"

        // Auth validation
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            redirect("/login")
        }

        // Get the tenant_id from profiles
        const { data: profile } = await supabase
            .from("profiles")
            .select("tenant_id")
            .eq("id", user.id)
            .single()

        if (!profile?.tenant_id) {
            throw new Error("User has no tenant assigned")
        }

        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const phone = formData.get("phone") as string
        const address = formData.get("address") as string

        const { error } = await supabase
            .from("customers")
            .insert({
                tenant_id: profile.tenant_id,
                name,
                email: email || null,
                phone: phone || null,
                address: address || null,
            })

        if (error) {
            console.error(error)
            throw new Error(error.message)
        }

        redirect("/customers")
    }

    const t = await getTranslations("Customers")

    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-700 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-primary/5 pb-6">
                <Link href="/customers">
                    <Button variant="ghost" size="icon" className="size-11 rounded-2xl bg-card/40 hover:bg-primary/10 hover:text-primary transition-all border border-primary/10">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
                        <UserPlus className="h-8 w-8 text-primary" /> {t("onboardNewClient")}
                    </h1>
                    <p className="text-muted-foreground/60 text-xs font-black uppercase tracking-widest mt-1">{t("registerNewVerifiedEntity")}</p>
                </div>
            </div>

            <form action={addCustomer} className="space-y-6">
                <Card className="glass-card overflow-hidden border-primary/10 shadow-2xl">
                    <CardHeader className="bg-primary/5 border-b border-primary/5">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> {t("entityProfileData")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Name Input */}
                        <div className="space-y-3">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("fullLegalName")} <span className="text-destructive">*</span></Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    className="h-14 bg-accent/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/30"
                                    placeholder={t("namePlaceholder")}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Email Input */}
                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("primaryEmail")}</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        className="h-14 bg-accent/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/30"
                                        placeholder={t("emailPlaceholder")}
                                    />
                                </div>
                            </div>

                            {/* Phone Input */}
                            <div className="space-y-3">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("secureContactNumber")}</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        className="h-14 bg-accent/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/30"
                                        placeholder={t("phonePlaceholder")}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address Input */}
                        <div className="space-y-3">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t("physicalLocation")}</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="address"
                                    name="address"
                                    className="h-14 bg-accent/50 border-none rounded-2xl pl-12 pr-4 text-sm font-bold focus-visible:ring-1 focus-visible:ring-primary transition-all placeholder:text-muted-foreground/30"
                                    placeholder={t("addressPlaceholder")}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-primary/[0.02] border-t border-primary/5 p-6 flex justify-end gap-4">
                        <Link href="/customers">
                            <Button variant="ghost" type="button" className="h-12 px-6 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-colors">{t("abortSetup")}</Button>
                        </Link>
                        <Button type="submit" className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-[#102219] font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            <Save className="h-4 w-4" /> {t("finalizeRegistration")}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    )
}
