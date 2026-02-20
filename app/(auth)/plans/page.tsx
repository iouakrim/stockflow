"use client"

import { Button } from "@/components/ui/button"
import {
    Check,
    Boxes,
    ArrowRight,
    Zap,
    ShieldCheck,
    Warehouse,
    Terminal,
    ShoppingCart
} from "lucide-react"
import Link from "next/link"

export default function PlansPage() {
    const plans = [
        {
            name: "Terminal",
            price: "49",
            desc: "Ideal for single warehouse operations and local grain dispatch.",
            features: ["Up to 5,000 SKUs", "POS Terminal Interface", "Basic Logistics Logs", "Email Support"],
            icon: Terminal,
            popular: false
        },
        {
            name: "Matrix",
            price: "149",
            desc: "For regional logistics hubs requiring real-time multi-node sync.",
            features: ["Unlimited SKUs", "Inventory Forecasting", "Supplier Matrix Access", "24/7 Priority Protocol"],
            icon: ShoppingCart,
            popular: true
        },
        {
            name: "Enterprise",
            price: "Custom",
            desc: "Global agricultural corporations with massive harvest turnover.",
            features: ["Multi-Tenant Clusters", "Custom API Integration", "Dedicated Security Node", "on-Site Training"],
            icon: Warehouse,
            popular: false
        }
    ]

    return (
        <div className="min-h-screen bg-[#102219] text-white selection:bg-primary/30 p-6 lg:p-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] size-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        <span className="size-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Scalable Logistics Infrastructure</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">Subscription <span className="text-primary italic">Plans</span> Selection</h1>
                    <p className="max-w-2xl mx-auto text-white/40 font-medium text-lg leading-relaxed pt-2">
                        Select the operational scale that matches your warehouse capacity. All plans include core StockFlow Pro intelligence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`glass-card p-10 rounded-[3rem] border-primary/10 flex flex-col h-full relative group transition-all duration-500 hover:scale-[1.02] ${plan.popular ? 'bg-primary/5 border-primary/30 shadow-2xl shadow-primary/10' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute top-8 right-8 px-4 py-1.5 rounded-full bg-primary text-[#102219] text-[9px] font-black uppercase tracking-[0.1em]">Most Deployed</div>
                            )}

                            <div className={`size-16 rounded-2xl flex items-center justify-center mb-8 bg-white/5 text-white group-hover:bg-primary group-hover:text-[#102219] transition-all`}>
                                <plan.icon className="size-8" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-2xl font-black tracking-tight">{plan.name} Plan</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black tracking-tighter">${plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-white/30 text-xs font-bold uppercase tracking-widest">/ Node / Mo</span>}
                                </div>
                                <p className="text-white/40 text-sm font-medium leading-relaxed">{plan.desc}</p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, j) => (
                                    <div key={j} className="flex items-center gap-3">
                                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Check className="size-3 text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-white/60">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/dashboard" className="w-full">
                                <Button className={`w-full rounded-2xl h-14 font-black text-[10px] tracking-[0.2em] uppercase shadow-xl transition-all ${plan.popular ? 'bg-primary hover:bg-primary/90 text-[#102219] shadow-primary/20' : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'}`}>
                                    Initialize protocol <ArrowRight className="size-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Footer Quote / Trust */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 opacity-30 border-t border-white/5 pt-10">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Logistics Architecture</p>
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2"><Zap className="size-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Instant Nodes</span></div>
                        <div className="flex items-center gap-2"><ShieldCheck className="size-4" /> <span className="text-[9px] font-black uppercase tracking-widest">Bank-Grade Security</span></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
