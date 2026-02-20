"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Boxes,
    Lock,
    Mail,
    ArrowRight,
    ShieldCheck,
    Loader2
} from "lucide-react"
import Link from "next/link"

import { signInUser } from "./actions"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await signInUser({ email, password })
            if (result.error) {
                setError(result.error)
                setIsLoading(false)
            } else {
                window.location.href = "/dashboard"
            }
        } catch {
            setError("Authentication failed. Please check your credentials.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#102219] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] size-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] size-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in duration-500">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="size-16 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mb-6 group cursor-pointer hover:rotate-12 transition-transform">
                        <Boxes className="h-8 w-8 text-[#102219]" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">StockFlow <span className="text-primary font-black">Pro</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">Logistics Intelligence Suite</p>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border-primary/10 shadow-2xl bg-[#102219]/40 backdrop-blur-2xl">
                    <div className="space-y-2 mb-8 text-center">
                        <h2 className="text-2xl font-black tracking-tight text-white">Welcome Back</h2>
                        <p className="text-sm font-medium text-white/40 leading-relaxed">System authentication required to access the warehouse matrix.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in">
                            Access Denied: {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Access Identifier</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    placeholder="operator@stockflow.pro"
                                    className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                    required
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-focus-within:text-primary transition-colors">Security Key</label>
                                <Link href="/forgot-password" title="Lost Protocol? Recovery required." className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors">Lost Protocol?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                    required
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-14 text-xs tracking-widest uppercase shadow-xl shadow-primary/20 gap-3 relative overflow-hidden group active:scale-95 transition-all"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Secure Login <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 w-full justify-center">
                            <ShieldCheck className="h-4 w-4 text-primary opacity-60" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">End-to-End Encrypted Node</span>
                        </div>

                        <div className="space-y-4 text-center">
                            <p className="text-[10px] font-bold text-white/20">
                                New to the system? <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors uppercase tracking-widest font-black ml-1">Onboard Facility</Link>
                            </p>
                            <p className="text-[10px] font-bold text-white/10">
                                Authorized Personnel Only. <Link href="/" className="text-white/20 hover:text-white transition-colors underline underline-offset-4">Return to Landing</Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Footer Info */}
                <div className="mt-12 flex items-center justify-between px-6 opacity-30">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60">© 2026 StockFlow Matrix</p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Privacy</Link>
                        <Link href="#" className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
