import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Download,
    AlertCircle,
    Boxes,
    BarChart2,
    Zap,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ProductsListClient } from "./ProductsListClient"
import { Product } from "@/types"

export default async function ProductsPage() {
    const supabase = createClient()
    const cookieStore = cookies()
    const activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, warehouse_access")
        .eq("id", user?.id)
        .single()

    const { currency } = await getTenantSettings()
    const isFullAccess = profile?.role === 'admin' || profile?.role === 'super-admin'
    const hasAccess = isFullAccess || (profile?.warehouse_access?.includes(activeWarehouseId || ''))

    if (activeWarehouseId && !hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <p className="font-black text-xl text-red-500 uppercase tracking-widest italic opacity-80 underline underline-offset-8">Accès Restreint</p>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à l&apos;inventaire de ce dépôt.</p>
            </div>
        )
    }

    // Fetch warehouse info
    let warehouse = null;
    if (activeWarehouseId) {
        const { data } = await supabase.from('warehouses').select('name').eq('id', activeWarehouseId).single()
        warehouse = data;
    } else {
        const { data } = await supabase.from('warehouses').select('name, id').limit(1).maybeSingle();
        warehouse = data;
    }

    const t = await getTranslations("Inventory")
    const warehouseName = warehouse?.name || t("globalNetwork");

    // Fetch real products (Global Dictionary) — exclude soft-deleted
    const { data: globalProducts } = await supabase
        .from("products")
        .select("*")
        .neq("status", "deleted")
        .order("created_at", { ascending: false })

    // Fetch Local Stock for this specific Warehouse
    const { data: localStockParams } = await supabase
        .from("warehouse_stock")
        .select("product_id, stock_quantity")
        .eq("warehouse_id", activeWarehouseId || '')

    const localStockMap = new Map((localStockParams || []).map(s => [s.product_id, s.stock_quantity]));

    // Fetch suppliers for filter
    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("id, name")
        .order("name", { ascending: true })

    // Merge global products with local stock
    const products = globalProducts?.map(p => ({
        ...p,
        stock_quantity: localStockMap.get(p.id) || 0 // Local stock overrules global for this view!
    })) || []

    // Stats calculation based on LOCAL STOCK
    const totalSkus = products.length || 0
    const lowStockCount = products.filter(p => p.stock_quantity <= p.low_stock_threshold).length || 0
    const totalValue = products.reduce((acc, p) => acc + (p.stock_quantity * p.cost_price), 0) || 0

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("vault")}</h1>
                    <p className="text-xs text-muted-foreground/60 font-medium mt-1 uppercase tracking-widest underline underline-offset-4 decoration-primary/30">{t("localView")}: {warehouseName}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        <Download className="h-4 w-4 text-primary" /> {t("exportCsv")}
                    </Button>
                    <Button asChild variant="outline" className="border-primary/20 bg-primary/5 text-primary rounded-2xl h-12 px-6 font-black text-xs gap-2 transition-all hover:bg-primary hover:text-background active:scale-95">
                        <Link href="/products/import">
                            <Zap className="h-4 w-4" /> Saisie rapide
                        </Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Link href="/products/new">
                            <Plus className="h-5 w-5 stroke-[3px]" /> {t("addSku")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7 flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all shadow-lg shadow-black/10">
                            <Boxes className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("totalSkus")}</p>
                            <p className="text-3xl font-black tracking-tighter">{totalSkus}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`glass-card group hover:scale-[1.02] transition-all duration-300 border-l-4 ${lowStockCount > 0 ? 'border-l-destructive/50' : 'border-l-primary/50'}`}>
                    <CardContent className="p-7 flex items-center gap-5">
                        <div className={`size-14 rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-black/10 ${lowStockCount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            <AlertCircle className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("stockAlerts")}</p>
                            <p className={`text-3xl font-black tracking-tighter ${lowStockCount > 0 ? 'text-destructive' : ''}`}>{lowStockCount}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7 flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-background transition-all shadow-lg shadow-black/10">
                            <BarChart2 className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("inventoryValue")}</p>
                            <div className="flex items-end gap-3">
                                <h3 className="text-3xl font-black tracking-tighter" suppressHydrationWarning>{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs opacity-40 ml-1">{currency}</span></h3>
                                <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full mb-1 border border-primary/20">{t("verified")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Inventory Board */}
            <ProductsListClient products={products} currency={currency} suppliers={suppliers || []} />

        </div>
    )
}
