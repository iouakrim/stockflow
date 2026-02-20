"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Boxes,
    Upload,
    Palette,
    FileText,
    ArrowRight,
    CheckCircle2,
    Building2,
    Globe,
    Check,
    CloudUpload,
    ImageIcon,
    Plus
} from "lucide-react"
import Link from "next/link"

import { updateOnboardingData } from "./actions"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form States
    const [tenantName, setTenantName] = useState("")
    const [taxId, setTaxId] = useState("")
    const [currency, setCurrency] = useState("USD")
    const [reportingPeriod, setReportingPeriod] = useState("Monthly")
    const [brandColor, setBrandColor] = useState("#0fbd66")

    const handleNext = async () => {
        if (step < 3) {
            setStep(step + 1)
        } else {
            setIsSubmitting(true)
            setError(null)
            try {
                const result = await updateOnboardingData({
                    tenantName,
                    taxId,
                    currency,
                    reportingPeriod,
                    brandColor
                })

                if (result.error) {
                    setError(result.error)
                    setIsSubmitting(false)
                } else {
                    window.location.href = "/dashboard"
                }
            } catch (err) {
                setError("An unexpected error occurred. Please try again.")
                setIsSubmitting(false)
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#102219] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />
            <div className="absolute top-[-20%] right-[-10%] size-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10">
                {/* Header Profile */}
                <div className="flex items-center justify-between mb-12 animate-in fade-in duration-700">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-black text-primary">JD</div>
                        <div>
                            <p className="text-sm font-black text-white">John Doe</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Administrator Node</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                            <Boxes className="size-6 text-[#102219]" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">StockFlow <span className="text-primary">Pro</span></span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in zoom-in">
                        System Error: {error}
                    </div>
                )}

                <div className="glass-card rounded-[3rem] border-primary/10 overflow-hidden bg-[#102219]/40 backdrop-blur-2xl shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                        {/* Sidebar Progress */}
                        <div className="lg:col-span-4 bg-black/20 p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/5 space-y-10">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight text-white leading-tight">System Initialization</h2>
                                <p className="text-xs font-medium text-white/30 uppercase tracking-widest">Protocol Setup Phase</p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { s: 1, label: "Business Identity", icon: Building2 },
                                    { s: 2, label: "Brand Customization", icon: Palette },
                                    { s: 3, label: "Logistics Parameters", icon: Globe }
                                ].map((item) => (
                                    <div key={item.s} className={`flex items-center gap-4 transition-all duration-500 ${step >= item.s ? 'opacity-100' : 'opacity-30'}`}>
                                        <div className={`size-10 rounded-2xl flex items-center justify-center border transition-all ${step === item.s ? 'bg-primary border-primary text-[#102219] shadow-lg shadow-primary/20 scale-110' : step > item.s ? 'bg-primary/20 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white'}`}>
                                            {step > item.s ? <Check className="size-5 stroke-[3px]" /> : <item.icon className="size-5" />}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${step === item.s ? 'text-primary' : 'text-white'}`}>{item.label}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10">
                                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="size-4 text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Encrypted Setup</span>
                                    </div>
                                    <p className="text-[10px] text-white/30 font-medium leading-relaxed">Your warehouse configuration data is being synchronized with the primary StockFlow cluster.</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-8 p-10 lg:p-16">
                            {step === 1 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight text-white">Business Identity</h3>
                                        <p className="text-white/40 font-medium">Configure your primary logistics entity details.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Company Legal Name</label>
                                            <input
                                                className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 px-6 text-sm font-bold text-white focus:border-primary/50 outline-none border transition-all"
                                                placeholder="Midwest Agricultural Grains LLC"
                                                value={tenantName}
                                                onChange={(e) => setTenantName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Tax Identification / VAT</label>
                                            <input
                                                className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 px-6 text-sm font-bold text-white focus:border-primary/50 outline-none border transition-all"
                                                placeholder="IE-90022311-B"
                                                value={taxId}
                                                onChange={(e) => setTaxId(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Base Currency</label>
                                                <select
                                                    className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 px-6 text-sm font-bold text-white focus:border-primary/50 outline-none border transition-all appearance-none cursor-pointer"
                                                    value={currency}
                                                    onChange={(e) => setCurrency(e.target.value)}
                                                >
                                                    <option value="USD">USD - United States Dollar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                    <option value="MAD">MAD - Moroccan Dirham</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Reporting Period</label>
                                                <select
                                                    className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 px-6 text-sm font-bold text-white focus:border-primary/50 outline-none border transition-all appearance-none cursor-pointer"
                                                    value={reportingPeriod}
                                                    onChange={(e) => setReportingPeriod(e.target.value)}
                                                >
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Quarterly">Quarterly</option>
                                                    <option value="Annual">Annual</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight text-white">Brand Customization</h3>
                                        <p className="text-white/40 font-medium">Initialize your visual signature for reports and terminal receipts.</p>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Primary Brand Accent</label>
                                            <div className="flex gap-4">
                                                {["#0fbd66", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"].map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => setBrandColor(c)}
                                                        className={`size-12 rounded-2xl transition-all border-2 ${brandColor === c ? 'scale-110 border-white shadow-xl' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                                <div className="size-12 rounded-2xl bg-[#102219] border border-white/10 flex items-center justify-center cursor-pointer text-white/40 hover:text-white hover:border-white/30 transition-all">
                                                    <Plus className="size-4" />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-white/20 font-medium leading-relaxed italic">info: This color will be used for buttons, highlights, and generated PDF reports.</p>
                                        </div>

                                        <div className="p-10 rounded-[2.5rem] border border-white/5 bg-black/20 text-center space-y-6 group cursor-pointer hover:border-primary/20 transition-all">
                                            <div className="size-20 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                                                <CloudUpload className="size-8 text-white/20 group-hover:text-primary transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-sm font-black text-white">Upload Company Symbol</p>
                                                <p className="text-[10px] text-white/30 font-medium">SVG or high-res PNG (256x256 min recommended)</p>
                                            </div>
                                            <input type="file" className="hidden" id="logo-upload" />
                                            <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-10 px-6">
                                                Choose File
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black tracking-tight text-white">Logistics Verification</h3>
                                        <p className="text-white/40 font-medium">Confirming environmental and operational metrics.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-6">
                                            <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <CheckCircle2 className="size-8 stroke-[2px]" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-lg">System Audit Ready</h4>
                                                <p className="text-xs text-white/40 font-medium leading-relaxed mt-1">
                                                    All corporate identifiers and visual nodes have been successfully mapped to your instance.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 rounded-3xl border border-white/5 bg-black/10 space-y-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">Data Integrity</span>
                                                <p className="text-xs font-bold text-white/60">Automated Audit Logs Enabled</p>
                                            </div>
                                            <div className="p-6 rounded-3xl border border-white/5 bg-black/10 space-y-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/60">Security</span>
                                                <p className="text-xs font-bold text-white/60">256-bit Node Encryption</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => step > 1 && setStep(step - 1)}
                                    className={`text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors ${step === 1 ? 'invisible' : ''}`}
                                    disabled={isSubmitting}
                                >
                                    Previous Phase
                                </button>
                                <Button
                                    onClick={handleNext}
                                    disabled={isSubmitting || (step === 1 && !tenantName)}
                                    className="bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-16 px-12 text-xs tracking-widest uppercase shadow-2xl shadow-primary/20 gap-3 group active:scale-95 transition-all"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                        <>
                                            {step === 3 ? "Initialize Protocol" : "Next Configuration"}
                                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 text-center animate-in fade-in duration-1000 delay-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">© 2026 StockFlow Matrix • Global Instance v4.0.2</p>
                </div>
            </div>
        </div>
    )
}

