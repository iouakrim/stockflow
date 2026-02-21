import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Package,
    ArrowLeft,
    Save,
    Tag,
    DollarSign,
    Layers,
    AlertCircle,
    Boxes,
    Truck
} from "lucide-react"

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

    async function addProduct(formData: FormData) {
        "use server"

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) redirect("/login")

        // Get profile again for consistency in server action
        const { data: profile } = await supabase
            .from("profiles")
            .select("tenant_id")
            .eq("id", user.id)
            .single()

        if (!profile?.tenant_id) throw new Error("Unauthorized")

        const name = formData.get("name") as string
        const category = formData.get("category") as string
        const supplier_id = formData.get("supplier_id") as string
        const description = formData.get("description") as string
        const sku = formData.get("sku") as string
        const barcode = formData.get("barcode") as string
        const unit = formData.get("unit") as string
        const cost_price = parseFloat(formData.get("cost_price") as string) || 0
        const selling_price = parseFloat(formData.get("selling_price") as string) || 0
        const stock_quantity = parseInt(formData.get("stock_quantity") as string) || 0
        const low_stock_threshold = parseInt(formData.get("low_stock_threshold") as string) || 5

        const { error } = await supabase
            .from("products")
            .insert({
                tenant_id: profile.tenant_id,
                name,
                category,
                supplier_id: supplier_id === "none" ? null : supplier_id,
                description,
                unit: unit || 'kg',
                sku: sku || null,
                barcode: barcode || null,
                cost_price,
                selling_price,
                stock_quantity,
                low_stock_threshold
            })

        if (error) {
            console.error(error)
            throw new Error(error.message)
        }

        redirect("/products")
    }

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
                    <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {t("inventoryProtocolEntry")}
                        </span>
                        <span className="text-muted-foreground/40 text-xs font-medium tracking-tight">{t("definingParameters")}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/products">
                        <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                            {t("discardEntry")}
                        </Button>
                    </Link>
                </div>
            </div>

            <form action={addProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Product Identity */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 md:p-10 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                            <Package className="size-32" />
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Tag className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight uppercase">{t("coreIdentity")}</h3>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("assetNomenclature")}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 text-base font-bold focus:ring-primary focus:border-primary/30 transition-all placeholder:font-medium"
                                    placeholder={t("assetPlaceholder")}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("classificationHub")}</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-bold focus:ring-primary transition-all"
                                        placeholder={t("classificationPlaceholder")}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="unit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("salesUnit")}</Label>
                                    <Input
                                        id="unit"
                                        name="unit"
                                        className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-bold focus:ring-primary transition-all placeholder:italic"
                                        placeholder={t("salesUnitPlaceholder")}
                                    />
                                </div>
                            </div>

                            {/* Supplier Link */}
                            <div className="space-y-3">
                                <Label htmlFor="supplier_id" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 flex items-center gap-2">
                                    <Truck className="h-3 w-3" /> {t("designatedSupplier")}
                                </Label>
                                <Select name="supplier_id" defaultValue="none">
                                    <SelectTrigger className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-bold focus:ring-primary transition-all">
                                        <SelectValue placeholder={t("selectLogisticsPartner")} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-primary/10 p-2">
                                        <SelectItem value="none" className="rounded-xl py-3 font-bold focus:bg-primary/10 focus:text-primary">{t("noSpecificSupplier")}</SelectItem>
                                        {suppliers?.map(s => (
                                            <SelectItem key={s.id} value={s.id} className="rounded-xl py-3 font-bold focus:bg-primary/10 focus:text-primary">{s.name.toUpperCase()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("serialId")}</Label>
                                <Input
                                    id="sku"
                                    name="sku"
                                    className="h-14 bg-card/40 border-primary/10 rounded-2xl px-6 font-mono font-bold uppercase focus:ring-primary transition-all"
                                    placeholder={t("skuPlaceholder")}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("telemetryDescription")}</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    className="w-full bg-card/40 border border-primary/10 rounded-2xl p-6 font-medium text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 min-h-[120px]"
                                    placeholder={t("descriptionPlaceholder")}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pricing & Logistics */}
                <div className="space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group border-primary/20 bg-primary/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight uppercase">{t("settlement")}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="cost_price" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("acquisitionCost")}</Label>
                                <div className="relative group/input">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-muted-foreground/40 group-focus-within/input:text-primary transition-colors">$</span>
                                    <Input
                                        id="cost_price"
                                        name="cost_price"
                                        type="number"
                                        step="0.01"
                                        defaultValue="0"
                                        className="h-14 bg-card/60 border-primary/10 rounded-2xl pl-10 pr-6 font-black text-lg focus:ring-primary transition-all border"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="selling_price" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("terminalPrice")}</Label>
                                <div className="relative group/input">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-muted-foreground/40 group-focus-within/input:text-primary transition-colors">$</span>
                                    <Input
                                        id="selling_price"
                                        name="selling_price"
                                        type="number"
                                        step="0.01"
                                        required
                                        defaultValue="0"
                                        className="h-14 bg-card/60 border-primary/10 rounded-2xl pl-10 pr-6 font-black text-lg focus:ring-primary transition-all border"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Layers className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight uppercase">{t("inventorySync")}</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="stock_quantity" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("initialPayload")}</Label>
                                <div className="relative group/input">
                                    <Boxes className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-blue-500 transition-colors" />
                                    <Input
                                        id="stock_quantity"
                                        name="stock_quantity"
                                        type="number"
                                        defaultValue="0"
                                        className="h-14 bg-card/40 border-primary/10 rounded-2xl pl-14 pr-6 font-black text-lg focus:ring-blue-500 transition-all border shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="low_stock_threshold" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">{t("warningThreshold")}</Label>
                                <div className="relative group/input">
                                    <AlertCircle className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within/input:text-destructive transition-colors" />
                                    <Input
                                        id="low_stock_threshold"
                                        name="low_stock_threshold"
                                        type="number"
                                        defaultValue="5"
                                        className="h-14 bg-card/40 border-primary/10 rounded-2xl pl-14 pr-6 font-black text-lg focus:ring-destructive transition-all border shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-2xl shadow-primary/30 rounded-[2.5rem] p-8 h-auto flex flex-col gap-1 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <Save className="h-6 w-6 stroke-[3px] mb-1 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm uppercase tracking-[0.2em]">{t("commitProtocol")}</span>
                        <span className="text-[9px] opacity-40 uppercase tracking-widest font-black">{t("syncingToGlobalMatrix")}</span>
                    </Button>
                </div>
            </form>
        </div>
    )
}
