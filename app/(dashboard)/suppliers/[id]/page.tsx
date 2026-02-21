import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Truck,
    Package,
    Phone,
    Mail,
    MapPin,
    Star,
    ShieldCheck,
    ArrowUpRight,
    Boxes,
    Tag,
    AlertCircle,
    ShoppingBag
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default async function SupplierDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch supplier
    const { data: supplier } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!supplier) notFound()

    // Fetch catalog (products linked to this supplier)
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .eq("supplier_id", params.id)
        .order("name", { ascending: true })

    const totalStockValue = products?.reduce((acc, p) => acc + (p.cost_price * p.stock_quantity), 0) || 0
    const t = await getTranslations("Suppliers")

    return (
        <div className="flex-1 space-y-10 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            {/* Header section with back button */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div className="space-y-4">
                    <Link href="/suppliers" className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                        {t("supplyChainMatrix")}
                    </Link>
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/10">
                            <Truck className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none uppercase">{supplier.name}</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-primary/5 uppercase border-primary/20 text-primary">
                                    {supplier.category || t("generalSupply")}
                                </Badge>
                                <span className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                                    ID: {params.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        {t("editEntity")}
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-background rounded-2xl h-12 px-8 font-black text-xs gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        {t("newOrder")} <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-card rounded-[2.5rem] p-8 border border-primary/10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />

                        <div className="space-y-6 relative">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("partnerCommunications")}</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 group-hover/item:text-primary transition-colors border border-primary/5">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{t("emailProtocol")}</p>
                                            <p className="text-xs font-bold truncate">{supplier.email || "---"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 group-hover/item:text-primary transition-colors border border-primary/5">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{t("voiceLine")}</p>
                                            <p className="text-xs font-bold truncate">{supplier.phone || "---"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group/item">
                                        <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary/60 group-hover/item:text-primary transition-colors border border-primary/5">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{t("geographicHub")}</p>
                                            <p className="text-xs font-bold line-clamp-2 leading-relaxed">{supplier.address || t("noAddressProtocol")}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-primary/5" />

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("trustMetrics")}</h4>
                                <div className="bg-primary/5 rounded-[1.5rem] p-5 border border-primary/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black uppercase text-muted-foreground/60 italic">{t("reliabilityRanking")}</span>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3 w-3 fill-primary text-primary" />
                                            <span className="text-xs font-black">4.8</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-primary/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-primary h-full w-[85%]" />
                                    </div>
                                    <p className="text-[8px] text-muted-foreground/40 font-black uppercase tracking-widest">{t("topSupplyNodes")}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-[2.5rem] p-8 border border-primary/10 bg-emerald-500/5">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{t("verifiedNode")}</span>
                        </div>
                        <p className="text-[11px] text-emerald-500/80 font-bold leading-relaxed">{t("supplierAuthenticated")}</p>
                    </div>
                </div>

                {/* Catalog & Stats */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Stats Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: t("assetPortfolio"), value: products?.length || 0, icon: Boxes, color: 'text-primary' },
                            { label: t("inventoryAggregate"), value: products?.reduce((acc, p) => acc + p.stock_quantity, 0) || 0, icon: ShoppingBag, color: 'text-blue-500' },
                            { label: t("capitalExposure"), value: `$${totalStockValue.toLocaleString()}`, icon: Tag, color: 'text-emerald-500' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-card rounded-[2rem] p-7 border border-primary/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">{stat.label}</p>
                                    <p className={`text-2xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                                </div>
                                <div className={`size-12 rounded-2xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Product Catalog Section */}
                    <div className="glass-card rounded-[3rem] border border-primary/10 overflow-hidden shadow-2xl">
                        <div className="px-10 py-8 border-b border-primary/10 bg-primary/[0.02] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-background shadow-lg shadow-primary/20">
                                    <Package className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight uppercase">{t("supplierCatalog")}</h3>
                                    <p className="text-[10px] text-muted-foreground/60 font-black tracking-widest uppercase mt-1 italic">{t("verifiedSkuPortfolio")}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-xl font-black text-[10px] tracking-widest border-primary/10 uppercase hover:bg-primary/5">
                                {t("exportLedger")}
                            </Button>
                        </div>

                        <div className="p-2 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-primary/5">
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("skuDescription")}</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("classification")}</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">{t("acquisition")}</th>
                                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">{t("stockNode")}</th>
                                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right text-destructive">{t("alertStatus")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!products || products.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-20">
                                                    <Boxes className="h-12 w-12" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">{t("noCatalogData")}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map(product => {
                                            const isLow = product.stock_quantity <= product.low_stock_threshold
                                            return (
                                                <tr key={product.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                                    <td className="px-10 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-accent flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-primary/5">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors uppercase">{product.name}</span>
                                                                <span className="text-[9px] font-mono font-bold text-muted-foreground/40 mt-0.5">{product.sku || t("skuUnspecified")}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6">
                                                        <Badge variant="outline" className="bg-accent/30 border-none text-[9px] font-black tracking-widest uppercase">
                                                            {product.category || t("generalSupply")}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 text-right font-black text-sm tracking-tighter">
                                                        ${product.cost_price.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 text-center">
                                                        <div className="flex flex-col">
                                                            <span className={`text-sm font-black tracking-tighter ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                                                                {product.stock_quantity}
                                                            </span>
                                                            <span className="text-[9px] font-black text-muted-foreground/30 uppercase">{product.unit || t("unit")}s</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 text-right">
                                                        {isLow ? (
                                                            <div className="flex items-center justify-end gap-2 text-destructive animate-pulse">
                                                                <AlertCircle className="h-3 w-3" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{t("lowStockAlert")}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-end gap-2 text-emerald-500/40">
                                                                <ShieldCheck className="h-3 w-3" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest">{t("optimalAlpha")}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
