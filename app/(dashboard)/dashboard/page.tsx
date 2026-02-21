import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

interface RecentSale {
    id: string;
    receipt_number: string;
    total: number;
    created_at: string;
    customers: {
        name: string;
    } | { name: string }[] | null;
}
import {
    TrendingUp,
    AlertTriangle,
    Wallet,
    Plus,
    FileOutput,
    ArrowUpRight,
    Boxes,
    ShoppingCart,
    Calendar,
    ChevronDown,
    Users,
    Activity
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DashboardChart } from "./DashboardChart"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function DashboardPage({ searchParams }: { searchParams: { filter?: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch profile and access
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, warehouse_access")
        .eq("id", user?.id)
        .single()

    const cookieStore = cookies()
    const activeWarehouseId = cookieStore.get('stockflow_active_warehouse')?.value

    const isFullAccess = profile?.role === 'admin' || profile?.role === 'super-admin'

    // Access validation
    if (activeWarehouseId && !isFullAccess) {
        if (!profile?.warehouse_access?.includes(activeWarehouseId)) {
            // Redirect or error
            return <div className="p-20 text-center font-black uppercase text-red-500 tracking-widest italic border-2 border-dashed border-red-500/20 rounded-3xl">Accès Depot Restreint</div>
        }
    }

    const filter = searchParams?.filter || 'today';
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const t = await getTranslations("Dashboard")

    let filterLabel = t("today");
    if (filter === '7d') {
        startDate.setDate(startDate.getDate() - 6);
        filterLabel = t("last7Days");
    } else if (filter === '30d') {
        startDate.setDate(startDate.getDate() - 29);
        filterLabel = t("last30Days");
    } else if (filter === 'all') {
        startDate = new Date(0);
        filterLabel = t("allTime");
    }

    // 1. Filtered Revenue - Localized by Warehouse
    let revenueQuery = supabase.from("sales").select("total").gte("created_at", startDate.toISOString())
    if (activeWarehouseId) {
        revenueQuery = revenueQuery.eq("warehouse_id", activeWarehouseId)
    }
    const { data: salesData } = await revenueQuery

    const totalRevenue = salesData?.reduce((acc, sale) => acc + Number(sale.total), 0) || 0

    // 2. Current Stock - Filtered by Warehouse
    let stockCountQuery = supabase.from("warehouse_stock").select("*", { count: "exact", head: true })
    if (activeWarehouseId) {
        stockCountQuery = stockCountQuery.eq("warehouse_id", activeWarehouseId)
    }
    const { count: productCount } = await stockCountQuery

    // 3. Low Stock Alerts - Filtered by Warehouse
    let lowStockQuery = supabase.from("warehouse_stock").select("id").lte("stock_quantity", 5)
    if (activeWarehouseId) {
        lowStockQuery = lowStockQuery.eq("warehouse_id", activeWarehouseId)
    }
    const { data: lowStockItems } = await lowStockQuery

    const lowStockCount = lowStockItems?.length || 0

    // 4. Outstanding Credits (Remains global/tenant-wide as customers are global)
    const { data: customers } = await supabase
        .from("customers")
        .select("credit_balance")

    const totalCredits = customers?.reduce((acc, c) => acc + Number(c.credit_balance), 0) || 0

    // 5. Recent Activity - Filtered by Warehouse
    let recentSalesQuery = supabase.from("sales").select(`
            id, 
            receipt_number, 
            total, 
            created_at,
            customers ( name )
        `)
    if (activeWarehouseId) {
        recentSalesQuery = recentSalesQuery.eq("warehouse_id", activeWarehouseId)
    }
    const { data: recentSales } = await recentSalesQuery.order("created_at", { ascending: false }).limit(5)

    // 6. Last 7 Days Sales for Chart - Filtered by Warehouse
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let weekSalesQuery = supabase.from("sales").select("total, created_at").gte("created_at", sevenDaysAgo.toISOString())
    if (activeWarehouseId) {
        weekSalesQuery = weekSalesQuery.eq("warehouse_id", activeWarehouseId)
    }
    const { data: weekSales } = await weekSalesQuery.order("created_at", { ascending: true });

    const salesByDay: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dayStr = d.toLocaleDateString('fr-FR', { weekday: 'short' });
        salesByDay[dayStr] = 0;
    }

    if (weekSales) {
        weekSales.forEach((s) => {
            const d = new Date(s.created_at);
            const dayStr = d.toLocaleDateString('fr-FR', { weekday: 'short' });
            if (salesByDay[dayStr] !== undefined) {
                salesByDay[dayStr] += Number(s.total);
            }
        });
    }

    const chartData = Object.keys(salesByDay).map(day => ({
        name: day.charAt(0).toUpperCase() + day.slice(1).replace('.', ''),
        Revenue: salesByDay[day]
    }));

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-12">
            {/* Page Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("title")}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 hover:border-primary/30 active:scale-95 group">
                                <Calendar className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> {filterLabel} <ChevronDown className="h-3.5 w-3.5 opacity-40 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/dashboard?filter=today">{t("today")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/dashboard?filter=7d">{t("last7Days")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/dashboard?filter=30d">{t("last30Days")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/dashboard?filter=all">{t("allTime")}</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Link href="/sales/new">
                            <Plus className="h-5 w-5 stroke-[3px]" /> {t("newTransaction")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* KPI Section with Enhanced Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue Card */}
                <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20 flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3" /> +12.4%
                                </span>
                            </div>
                        </div>
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">{t("revenue")}</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-black tracking-tighter" suppressHydrationWarning>${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            <span className="text-xs font-bold text-primary/40 leading-none">USD</span>
                        </div>
                    </CardContent>
                    <div className="h-1 bg-primary/10 w-full overflow-hidden">
                        <div className="h-full bg-primary w-1/3 rounded-full opacity-60" />
                    </div>
                </Card>

                {/* Stock Card */}
                <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
                                <Boxes className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">{t("liveUnit")}</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">{t("inventoryCount")}</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-black tracking-tighter">{productCount || 0}</h3>
                            <span className="text-xs font-bold text-blue-500/40 leading-none">{t("skus")}</span>
                        </div>
                    </CardContent>
                    <div className="h-1 bg-blue-500/10 w-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3 rounded-full opacity-60" />
                    </div>
                </Card>

                {/* Alerts Card */}
                <Card className={`glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-l-4 ${lowStockCount > 0 ? 'border-l-destructive/50' : 'border-l-primary/50'}`}>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`size-10 rounded-2xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'} transition-all`}>
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-widest ${lowStockCount > 0 ? 'bg-destructive/10 text-destructive border-destructive/20 animate-pulse' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                {lowStockCount > 0 ? t("criticalAlerts") : t("optimal")}
                            </span>
                        </div>
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">{t("criticalAlerts")}</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className={`text-2xl font-black tracking-tighter ${lowStockCount > 0 ? 'text-destructive' : ''}`}>{lowStockCount}</h3>
                            <span className="text-xs font-bold opacity-30 leading-none">{t("items")}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Credit Card */}
                <Card className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 transition-all">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">{t("stable")}</span>
                        </div>
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1.5">{t("outstandingDebt")}</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-black tracking-tighter" suppressHydrationWarning>${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            <span className="text-xs font-bold text-amber-500/40 leading-none">USD</span>
                        </div>
                    </CardContent>
                    <div className="h-1 bg-amber-500/10 w-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[15%] rounded-full opacity-60" />
                    </div>
                </Card>
            </div>

            {/* Visual Analytics Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Visualization */}
                <Card className="lg:col-span-2 glass-card overflow-hidden border-none shadow-none bg-white/[0.02]">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 pb-6 p-7">
                        <div>
                            <CardTitle className="text-xl font-black flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" /> {t("performanceMatrix")}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">{t("revenueTrend")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/50 border border-primary/10">
                                <span className="size-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">{t("liveTraffic")}</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <DashboardChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Pro Activity Center */}
                <Card className="glass-card overflow-hidden border-t-4 border-t-primary/20">
                    <CardHeader className="border-b border-primary/5 pb-5 p-7">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                <Activity className="h-5 w-5 text-primary" /> {t("recentActivity")}
                            </CardTitle>
                            <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase bg-primary/5 text-primary hover:bg-primary/20">
                                <Link href="/sales">
                                    {t("viewAll")} <ArrowUpRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-7 custom-scrollbar max-h-[460px] overflow-y-auto">
                        <div className="relative space-y-6 before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/5">
                            {(!recentSales || recentSales.length === 0) ? (
                                <div className="py-20 text-center flex flex-col items-center gap-4 opacity-30">
                                    <ShoppingCart className="h-10 w-10" />
                                    <p className="text-xs font-black uppercase tracking-widest italic">{t("noTransactionalData")}</p>
                                </div>
                            ) : (
                                recentSales.map((sale: RecentSale) => (
                                    <div key={sale.id} className="relative flex gap-5 group items-start">
                                        <div className="size-9 rounded-xl glass-card flex items-center justify-center text-primary z-10 transition-transform group-hover:scale-110 shadow-lg shadow-black/20 group-hover:border-primary/40 group-hover:text-foreground group-hover:bg-primary">
                                            <ArrowUpRight className="h-4 w-4 stroke-[3px]" />
                                        </div>
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <h4 className="text-sm font-black truncate tracking-tight group-hover:text-primary transition-colors">#{sale.receipt_number}</h4>
                                                <span className="text-[10px] font-black text-primary" suppressHydrationWarning>${Number(sale.total).toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate opacity-70">
                                                {(Array.isArray(sale.customers) ? sale.customers[0]?.name : sale.customers?.name) || t("standardClient")}
                                            </p>
                                            <p className="text-[9px] text-muted-foreground/40 font-black mt-2 uppercase tracking-tighter" suppressHydrationWarning>
                                                {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t("processed")}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
