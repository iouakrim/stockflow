import { createClient, getTenantSettings } from "@/lib/supabase/server"
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
    Boxes,
    AlertCircle,
    ShieldCheck
} from "lucide-react"
import { SupplierEditDrawer } from "@/components/suppliers/SupplierEditDrawer"

export default async function SupplierDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { currency } = await getTenantSettings()

    // Fetch supplier
    const { data: supplier } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!supplier) notFound()

    // Fetch catalog (products linked to this supplier) with stock from all warehouses
    const { data: productsData } = await supabase
        .from("products")
        .select("*, warehouse_stock(stock_quantity, low_stock_threshold)")
        .eq("supplier_id", params.id)
        .order("name", { ascending: true })

    const products = productsData?.map(p => ({
        ...p,
        stock_quantity: p.warehouse_stock?.reduce((acc: number, ws: any) => acc + ws.stock_quantity, 0) || 0,
        low_stock_threshold: p.warehouse_stock?.[0]?.low_stock_threshold || 0
    }))

    const totalStockValue = products?.reduce((acc, p) => acc + (p.cost_price * p.stock_quantity), 0) || 0
    const t = await getTranslations("Suppliers")

    return (
        <div className="flex-1 space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
            {/* Header section with back button */}
            <div className="space-y-6">
                <Link href="/suppliers" className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                    {t("supplyChainMatrix")}
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary/10 pb-8">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-2xl shadow-primary/10">
                            <Truck className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none uppercase">{supplier.name}</h1>
                            <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="text-[9px] font-black tracking-widest bg-primary/5 uppercase border-primary/20 text-primary">
                                    {supplier.category || t("generalSupply")}
                                </Badge>
                                <span className="text-label">
                                    ID: {params.id.slice(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 text-sm">
                        <div className="flex items-center gap-3 group/item">
                            <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/5">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-label mb-0.5">{t("emailProtocol")}</p>
                                <p className="font-bold truncate">{supplier.email || "---"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 group/item">
                            <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/5">
                                <Phone className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-label mb-0.5">{t("voiceLine")}</p>
                                <p className="font-bold truncate">{supplier.phone || "---"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <SupplierEditDrawer supplier={supplier} />
                    </div>
                </div>
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
                </div>

                <div className="p-2 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-primary/5">
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("skuDescription")}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("classification")}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-right">{t("acquisition")}</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 text-center">{t("availableStock")}</th>
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
                                                {product.cost_price.toFixed(2)} <span className="text-[10px] ml-1 opacity-50">{currency}</span>
                                            </td>
                                            <td className="px-6 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <span className={`text-sm font-black tracking-tighter ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                                                        {product.stock_quantity}
                                                    </span>
                                                    <span className="text-[10px] font-black text-muted-foreground/30 uppercase">{product.unit}</span>
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
    )
}
