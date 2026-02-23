import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronDown,
    Download,
    Layers,
    Building2,
    PackageCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReportsChart } from "./ReportsChart"
import { ReportsPieChart } from "./ReportsPieChart"
import { ReportsBarChart } from "./ReportsBarChart"

export default async function ReportsPage({ searchParams }: { searchParams: { filter?: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { currency } = await getTenantSettings()

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const canViewReports = ['admin', 'super-admin', 'manager'].includes(profile?.role || '')
    if (!canViewReports) {
        redirect("/dashboard")
    }

    const t = await getTranslations("Reports")

    const filter = searchParams?.filter || 'q1-2026';
    let filterLabel = t("q1");
    // For demonstration, these filters change the label, 
    // but in a real scenario, they would affect data queries.
    if (filter === 'this-month') filterLabel = t("thisMonth");
    else if (filter === 'last-year') filterLabel = t("fiscal2025");
    else if (filter === 'all-time') filterLabel = t("allTime");

    // Fetch real stats for reporting
    const { data: products } = await supabase.from("products").select("id, name, stock_quantity, low_stock_threshold, category, cost_price, selling_price, suppliers(name)")
    const { data: sales } = await supabase.from("sales").select("id, total, created_at")
    const { data: customers } = await supabase.from("customers").select("id")

    const totalProducts = products?.length || 0
    const lowStock = products?.filter(p => p.stock_quantity <= p.low_stock_threshold).length || 0
    const totalRevenue = sales?.reduce((acc, s) => acc + Number(s.total), 0) || 0
    const customerCount = customers?.length || 0

    const performanceMetrics = [
        { label: t("grossRevenue"), value: `${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${currency}`, trend: "+12.1%", positive: true },
        { label: t("stockHealth"), value: `${totalProducts > 0 ? Math.round(((totalProducts - lowStock) / totalProducts) * 100) : 0}%`, trend: "-0.5%", positive: false },
        { label: t("verifiedClients"), value: customerCount.toString(), trend: "+4.2%", positive: true },
        { label: t("skuVelocity"), value: totalProducts.toString(), trend: "+3.2%", positive: true },
    ]

    // Real Chart Data: Revenue Velocity (Last 6 Months)
    const monthKeys = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthlyDataMap: Record<string, { revenue: number; profit: number, sortKey: string, name: string }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const name = t(`months.${monthKeys[d.getMonth()]}`);
        const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        monthlyDataMap[sortKey] = { revenue: 0, profit: 0, sortKey, name };
    }

    if (sales) {
        sales.forEach(s => {
            const d = new Date(s.created_at);
            const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (monthlyDataMap[sortKey]) {
                monthlyDataMap[sortKey].revenue += Number(s.total);
                monthlyDataMap[sortKey].profit += Number(s.total) * 0.35; // Estimated 35% Margin for MVP
            }
        });
    }

    const chartData = Object.values(monthlyDataMap)
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
        .map(item => ({
            name: item.name,
            revenue: Math.round(item.revenue),
            profit: Math.round(item.profit)
        }));

    // Real Chart Data: Stock Weighted
    const categoryMap: Record<string, number> = {};
    let totalStockValue = 0;

    if (products) {
        products.forEach(p => {
            const cat = p.category || t("uncategorized");
            const val = (p.stock_quantity || 0) * (p.cost_price || 0);
            if (!categoryMap[cat]) categoryMap[cat] = 0;
            categoryMap[cat] += val;
            totalStockValue += val;
        });
    }

    const colors = ["hsl(var(--primary))", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#06b6d4"];
    let pieData = Object.keys(categoryMap)
        .filter(k => categoryMap[k] > 0)
        .sort((a, b) => categoryMap[b] - categoryMap[a])
        .slice(0, 4) // Top 4 categories
        .map((k, idx) => ({
            name: k,
            value: Number(((categoryMap[k] / totalStockValue) * 100).toFixed(1)),
            color: colors[idx % colors.length]
        }));

    if (pieData.length === 0) {
        pieData = [{ name: t("noStock"), value: 100, color: "#cbd5e1" }];
    }

    // Real Data: Supplier Exposure
    const supplierMap: Record<string, number> = {};
    if (products) {
        products.forEach(p => {
            // Supabase returns related objects or arrays, depending on the schema
            const supplierObj = p.suppliers as any;
            const supplierName = supplierObj?.name || t("unknownSupplier");
            const val = (p.stock_quantity || 0) * (p.cost_price || 0);
            if (!supplierMap[supplierName]) supplierMap[supplierName] = 0;
            supplierMap[supplierName] += val;
        });
    }

    const supplierData = Object.keys(supplierMap)
        .map(name => ({ name: name.length > 12 ? name.substring(0, 12) + '...' : name, value: Math.round(supplierMap[name]) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5 suppliers

    // Real Data: Top Products by Profit Potential
    const productProfitData = (products || [])
        .map(p => ({
            name: p.name?.length > 12 ? p.name.substring(0, 12) + '...' : p.name || t("unknown"),
            value: Math.round(((p.selling_price || 0) - (p.cost_price || 0)) * (p.stock_quantity || 0)) || 0
        }))
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // top 5 products by potential profit in stock

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("title")}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95 group">
                                <Calendar className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" /> {filterLabel} <ChevronDown className="h-3.5 w-3.5 opacity-40 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/reports?filter=this-month">{t("thisMonth")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/reports?filter=q1-2026">{t("q1")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/reports?filter=last-year">{t("fiscal2025")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="text-xs font-bold py-2.5 cursor-pointer">
                                <Link href="/reports?filter=all-time">{t("allTime")}</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Download className="h-5 w-5 stroke-[3px]" /> {t("generatePdf")}
                    </Button>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((metric, i) => (
                    <Card key={i} className="glass-card group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em]">{metric.label}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${metric.positive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                    {metric.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {metric.trend}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tighter">{metric.value}</h3>
                            <div className="mt-3 w-full h-1 bg-accent rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${metric.positive ? 'bg-primary' : 'bg-destructive'} opacity-40`}
                                    style={{ width: `${60 + (i * 10)}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Advanced Growth Chart */}
                <Card className="lg:col-span-2 glass-card overflow-hidden">
                    <CardHeader className="border-b border-primary/5 p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <TrendingUp className="h-5 w-5 text-primary" /> {t("revenueVelocity")}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">{t("revenueVelocitySubtitle")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase text-muted-foreground hover:bg-primary/10">{t("linear")}</Button>
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">{t("exponential")}</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-6">
                        <ReportsChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Distribution Overview */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="border-b border-primary/5 p-7">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary" /> {t("stockWeighted")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">{t("resourceAllocation")}</p>
                    </CardHeader>
                    <CardContent className="p-7 space-y-6">
                        <ReportsPieChart data={pieData} />

                        <div className="space-y-5">
                            {pieData.map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                                        <span className="text-muted-foreground/80">{item.name}</span>
                                        <span>{item.value}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-accent/50 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full opacity-80" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Analytics Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Supplier Exposure Chart */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="border-b border-primary/5 p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-primary" /> {t("supplierExposure")}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">{t("stockValuationPerVendor")}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                        <ReportsBarChart data={supplierData} color="hsl(var(--primary))" />
                    </CardContent>
                </Card>

                {/* Profit Potential Chart */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="border-b border-primary/5 p-7">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <PackageCheck className="h-5 w-5 text-blue-500" /> {t("marginLeaders")}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">{t("topProductsMargin")}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                        <ReportsBarChart data={productProfitData} color="#3b82f6" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
