import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Package,
    Plus,
    Download,
    MoreVertical,
    AlertCircle,
    Boxes,
    BarChart2,
    ArrowUpRight,
    ListFilter,
    Search
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
                <p className="text-xs font-medium text-muted-foreground/60 max-w-xs text-center">Vous n'avez pas l'autorisation d'accéder à l'inventaire de ce dépôt.</p>
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

    // Fetch real products (Global Dictionary)
    const { data: globalProducts } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

    // Fetch Local Stock for this specific Warehouse
    const { data: localStockParams } = await supabase
        .from("warehouse_stock")
        .select("product_id, stock_quantity")
        .eq("warehouse_id", activeWarehouseId || '')

    const localStockMap = new Map((localStockParams || []).map(s => [s.product_id, s.stock_quantity]));

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
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                        <Button variant="secondary" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black bg-primary text-background uppercase tracking-widest shadow-lg shadow-primary/20">{t("allVault")}</Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("grains")}</Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("legumes")}</Button>
                        <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("oilseeds")}</Button>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border"
                                placeholder={t("search")}
                            />
                        </div>
                        <Button variant="outline" size="icon" className="size-11 rounded-2xl border-primary/10 bg-card/40 transition-all hover:bg-primary/10 hover:text-primary active:scale-95">
                            <ListFilter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                    <Table>
                        <TableHeader className="bg-primary/[0.03]">
                            <TableRow className="border-b border-primary/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("productEntity")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("globalSku")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("classification")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("stockLevel")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right">{t("unitPrice")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">{t("stability")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(!products || products.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-24 text-muted-foreground italic opacity-50">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package className="h-8 w-8" />
                                            <p className="text-xs font-black uppercase tracking-widest">{t("empty")}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product: Product) => {
                                    const isLow = product.stock_quantity <= product.low_stock_threshold;
                                    return (
                                        <TableRow key={product.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                            <TableCell className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-accent/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/5">
                                                        <Package className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors">{product.name}</span>
                                                        <span className="text-[10px] text-muted-foreground/50 font-medium">{t("recorded")} {new Date(product.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono font-bold tracking-tighter opacity-60">
                                                {product.sku || t("unassigned")}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[10px] px-3 py-1 rounded-full bg-accent/50 text-muted-foreground border border-primary/5 font-black uppercase tracking-tighter">
                                                    {product.category || t("general")}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`font-black text-sm tracking-tighter ${isLow ? 'text-destructive decoration-destructive/20' : 'text-foreground'}`}>
                                                        {product.stock_quantity.toLocaleString()} <span className="text-[10px] opacity-60 uppercase">{product.unit || t("unit")}</span>
                                                    </span>
                                                    <div className="w-20 h-1 bg-accent rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isLow ? 'bg-destructive' : 'bg-primary'}`}
                                                            style={{ width: `${Math.min((product.stock_quantity / 1000) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-sm tracking-tighter px-4">
                                                {product.selling_price.toFixed(2)} <span className="text-[10px] opacity-40 ml-0.5">{currency}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] ${isLow ? 'text-destructive bg-destructive/10' : 'text-primary bg-primary/10'} py-1.5 px-3 rounded-xl border ${isLow ? 'border-destructive/20' : 'border-primary/20'}`}>
                                                    <div className={`size-1.5 rounded-full ${isLow ? 'bg-destructive animate-pulse' : 'bg-primary'}`} />
                                                    {isLow ? t("replenish") : t("optimal")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="size-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-primary/20">
                                                        <ArrowUpRight className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="size-9 rounded-xl text-muted-foreground hover:bg-accent transition-all">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>

                    <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{t("matrixOutput")}: {products?.length || 0} {t("productsIdentified")}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs shadow-lg shadow-primary/10">1</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
