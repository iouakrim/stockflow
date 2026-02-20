"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Boxes,
    Building2,
    Mail,
    ArrowRight,
    ChevronRight,
    MapPin,
    User,
    ShieldCheck,
    Globe
} from "lucide-react"
import Link from "next/link"

import { signUpUser } from "./actions"
import { Loader2, Lock } from "lucide-react"

export default function SignupPage() {
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form States
    const [facilityName, setFacilityName] = useState("")
    const [address, setAddress] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (step === 1) {
            setStep(2)
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const result = await signUpUser({
                facilityName,
                address,
                fullName,
                email
            })

            if (result.error) {
                setError(result.error)
                setIsSubmitting(false)
            } else {
                window.location.href = "/onboarding"
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.")
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#102219] flex flex-col lg:flex-row relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />

            {/* Left Side: Branding & Social Proof */}
            <div className="hidden lg:flex flex-1 flex-col p-16 relative z-10 bg-black/20 backdrop-blur-3xl border-r border-white/5">
                <div className="flex items-center gap-3 mb-20 animate-in fade-in slide-in-from-left duration-700">
                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                        <Boxes className="size-7 text-[#102219]" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter uppercase italic">StockFlow <span className="text-primary">Pro</span></span>
                </div>

                <div className="flex-1 space-y-12 flex flex-col justify-center max-w-lg">
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                        <h1 className="text-5xl font-black tracking-tighter leading-[0.95]">Scale your <span className="text-primary italic">Agri-Logistics</span> operations.</h1>
                        <p className="text-white/40 text-lg font-medium leading-relaxed">The modern standard for bulk agricultural inventory management. Join over 450+ facilities worldwide.</p>
                    </div>

                    <div className="glass-card p-10 rounded-[2.5rem] bg-primary/5 border-primary/10 relative animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
                        <div className="absolute -top-6 -left-6 bg-primary/20 border border-primary/20 p-3 rounded-full">
                            <ShieldCheck className="size-6 text-primary" />
                        </div>
                        <p className="text-white/60 font-medium italic leading-relaxed text-lg">
                            "StockFlow Pro transformed how we manage our grain silos. The transition was seamless and the real-time tracking is a game changer for our dispatch team."
                        </p>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="size-12 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center font-black text-primary">MT</div>
                            <div>
                                <p className="text-sm font-black text-white">Marcus T.</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Operations Manager, Midwest Grains</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto flex items-center gap-10 opacity-30">
                    <div className="flex items-center gap-2"><Globe className="size-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Global Network</span></div>
                    <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">© 2026 Matrix Technologies</div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col p-8 lg:p-20 relative z-10">
                <div className="flex lg:hidden items-center justify-between mb-12">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                            <Boxes className="size-5 text-[#102219]" />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase italic">StockFlow <span className="text-primary">Pro</span></span>
                    </div>
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-primary">Login Access</Link>
                </div>

                <div className="hidden lg:flex justify-end items-center gap-4 mb-20 animate-in fade-in duration-500">
                    <span className="text-xs font-bold text-white/30 tracking-tight">Already have an account?</span>
                    <Link href="/login">
                        <Button variant="outline" className="rounded-xl border-primary/10 bg-white/5 hover:bg-primary/5 text-primary font-black text-[10px] tracking-widest uppercase h-10 px-6">Login Access</Button>
                    </Link>
                </div>

                <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
                    <div className="space-y-2 mb-10">
                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4">
                            <div className="h-[2px] w-8 bg-primary rounded-full" /> Initial Configuration
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white leading-none">Create Your Warehouse <span className="text-white/40 italic">Account</span></h2>
                        <p className="text-white/40 font-medium pt-2">Phase {step} of 2: Corporate Entity Profiling</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in zoom-in">
                            System Error: {error}
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Facility Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Midwest Terminal C"
                                            className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                            required
                                            value={facilityName}
                                            onChange={(e) => setFacilityName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Geographic Coordinate / Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="122 Logistics Ave, IA 50309"
                                            className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                            required
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Primary Administrator</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Access Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="admin@midwestgrains.com"
                                            className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Security Key</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="password"
                                            placeholder="••••••••••••"
                                            className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-6 space-y-6">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-16 text-xs tracking-widest uppercase shadow-2xl shadow-primary/20 gap-3 group active:scale-95 transition-all"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    <>
                                        {step === 1 ? (
                                            <>Configuration Progress <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" /></>
                                        ) : (
                                            <>Initialize Deployment <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </>
                                )}
                            </Button>

                            {step === 2 && !isSubmitting && (
                                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">
                                    Back to Corporate Profile
                                </button>
                            )}

                            <p className="text-center text-[10px] font-medium text-white/30 leading-relaxed px-10">
                                By continuing, you agree to StockFlow Pro's <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and <Link href="#" className="underline hover:text-primary">Privacy Protocol</Link>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

