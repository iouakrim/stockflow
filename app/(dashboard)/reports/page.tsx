import { createClient } from "@/lib/supabase/server"
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    ChevronDown,
    Download,
    FileText,
    Calculator,
    Target,
    Zap,
    Layers,
    ShoppingCart,
    Boxes
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ReportsPage() {
    const supabase = createClient()

    // Mock/Estimated data for advanced reporting visuals
    const performanceMetrics = [
        { label: "Gross Margin", value: "32.4%", trend: "+2.1%", positive: true },
        { label: "Inventory Turnover", value: "4.8x", trend: "-0.5%", positive: false },
        { label: "Customer Acquisition", value: "124", trend: "+12%", positive: true },
        { label: "Operating Costs", value: "$4,200", trend: "+3.2%", positive: false },
    ]

    return (
        <div className="flex-1 space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none">Intelligence Hub</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Analytical Protocol 4.0
                        </span>
                        <span className="text-muted-foreground/40 text-xs font-medium tracking-tight">Decisive logistics and financial insights.</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        <Calendar className="h-4 w-4 text-primary" /> Q1 2026 <ChevronDown className="h-3.5 w-3.5 opacity-40 ml-1" />
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Download className="h-5 w-5 stroke-[3px]" /> GENERATE PDF
                    </Button>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((metric, i) => (
                    <Card key={i} className="glass-card group hover:scale-[1.02] transition-all duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em]">{metric.label}</p>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 ${metric.positive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                    {metric.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {metric.trend}
                                </span>
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter">{metric.value}</h3>
                            <div className="mt-4 w-full h-1 bg-accent rounded-full overflow-hidden">
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
                                    <TrendingUp className="h-5 w-5 text-primary" /> Revenue Velocity
                                </CardTitle>
                                <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">Comparative financial growth • Monthly interval</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase text-muted-foreground hover:bg-primary/10">Linear</Button>
                                <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase bg-primary/10 text-primary border border-primary/20">Exponential</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-12">
                        <div className="h-[350px] w-full relative group">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="blue-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                    <linearGradient id="green-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" stopColor="#11d473" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#11d473" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Professional Vertical Grids */}
                                {[0, 250, 500, 750, 1000].map(x => (
                                    <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="currentColor" strokeOpacity="0.03" strokeDasharray="4 4" />
                                ))}

                                {/* Horizontal Reference Lines */}
                                {[0, 75, 150, 225, 300].map(y => (
                                    <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="currentColor" strokeOpacity="0.05" />
                                ))}

                                {/* Baseline Series (Prior Year) */}
                                <path
                                    d="M0,280 C100,260 200,270 300,240 C400,210 500,230 600,180 C700,200 800,140 900,160 C950,170 1000,120 1000,120 L1000,300 L0,300 Z"
                                    fill="url(#blue-gradient)"
                                />
                                <path
                                    d="M0,280 C100,260 200,270 300,240 C400,210 500,230 600,180 C700,200 800,140 900,160 C950,170 1000,120 1000,120"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="3"
                                    strokeDasharray="5 5"
                                    opacity="0.4"
                                />

                                {/* Growth Series (Current) */}
                                <path
                                    d="M0,240 C100,220 200,210 300,160 C400,110 500,140 600,80 C700,100 800,40 900,60 C950,70 1000,20 1000,20 L1000,300 L0,300 Z"
                                    fill="url(#green-gradient)"
                                />
                                <path
                                    d="M0,240 C100,220 200,210 300,160 C400,110 500,140 600,80 C700,100 800,40 900,60 C950,70 1000,20 1000,20"
                                    fill="none"
                                    stroke="#11d473"
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                />
                            </svg>

                            <div className="flex justify-between mt-8 pr-2">
                                {['OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'].map(m => (
                                    <span key={m} className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{m}</span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Distribution Overview */}
                <Card className="glass-card overflow-hidden">
                    <CardHeader className="border-b border-primary/5 p-7">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary" /> Stock Weighted
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-wider opacity-60">Resource allocation strategy</p>
                    </CardHeader>
                    <CardContent className="p-7 space-y-8">
                        {/* Circular Visualization Concept */}
                        <div className="flex justify-center py-6">
                            <div className="size-48 rounded-full border-[1.5rem] border-primary/10 relative flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-[1.5rem] border-primary border-t-transparent border-r-transparent transform rotate-45" />
                                <div className="text-center group">
                                    <span className="text-3xl font-black tracking-tighter group-hover:scale-110 transition-transform block">72%</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Utilization</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: "Grain Silos", percent: 45, color: "bg-primary" },
                                { label: "Cold Storage", percent: 28, color: "bg-blue-500" },
                                { label: "Logistics Fleet", percent: 12, color: "bg-amber-500" },
                                { label: "Chemical Vaults", percent: 15, color: "bg-purple-500" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                                        <span className="text-muted-foreground/80">{item.label}</span>
                                        <span>{item.percent}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-accent/50 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full opacity-80`} style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tactical Reports List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-primary/5">
                {[
                    { title: "Profitability Manifest", icon: Calculator, desc: "Detailed breakdown of margins per category." },
                    { title: "Deficit Alerts", icon: Zap, desc: "Predictive analysis of potential stock ruptures." },
                    { title: "Compliance Audit", icon: FileText, desc: "Verified records for regulatory bodies." },
                ].map((report, i) => (
                    <Card key={i} className="glass-card hover:bg-primary/5 transition-all cursor-pointer group border-dashed">
                        <CardContent className="p-7 flex items-start gap-5">
                            <div className="size-12 rounded-2xl bg-accent flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                                <report.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-sm tracking-tight group-hover:translate-x-1 transition-transform">{report.title}</h4>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-relaxed">{report.desc}</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
