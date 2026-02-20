"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Boxes,
    Mail,
    ArrowLeft,
    ShieldAlert,
    CheckCircle2,
    RefreshCw,
    Loader2
} from "lucide-react"
import Link from "next/link"

import { resetPassword } from "./actions"

export default function ForgotPasswordPage() {
    const [isSent, setIsSent] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await resetPassword(email)
            if (result.error) {
                setError(result.error)
                setIsLoading(false)
            } else {
                setIsLoading(false)
                setIsSent(true)
            }
        } catch (err) {
            setError("Request failed. Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#102219] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />
            <div className="absolute top-[-10%] left-[-10%] size-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="mb-10 flex justify-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary group-hover:text-[#102219] transition-all">
                            <Boxes className="size-6" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic text-white flex items-center gap-2">
                            StockFlow <span className="text-primary">Pro</span>
                        </span>
                    </Link>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border-primary/10 shadow-2xl bg-[#102219]/40 backdrop-blur-2xl">
                    {!isSent ? (
                        <div className="animate-in fade-in duration-500">
                            <div className="space-y-3 mb-10 text-center">
                                <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto mb-6">
                                    <ShieldAlert className="size-7" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight text-white">Security Recovery</h2>
                                <p className="text-sm font-medium text-white/40 leading-relaxed px-4">Enter your registered email and we'll send a system recovery protocol link.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in">
                                    Recovery Error: {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Registered Access Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            placeholder="operator@stockflow.pro"
                                            className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-14 text-xs tracking-widest uppercase shadow-xl shadow-primary/20 gap-3 group active:scale-95 transition-all"
                                >
                                    {isLoading ? (
                                        <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                        <>Request Recovery <RefreshCw className="size-4 group-hover:rotate-180 transition-transform duration-500" /></>
                                    )}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20 shadow-2xl shadow-primary/10">
                                <CheckCircle2 className="size-10" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-white mb-4">Protocol Sent</h2>
                            <p className="text-sm font-medium text-white/40 leading-relaxed mb-10">
                                A recovery link has been dispatched to your terminal. Check the inbox associated with your identifier.
                            </p>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-primary/10 bg-primary/5 hover:bg-primary/10 text-primary font-black rounded-2xl h-14 text-[10px] tracking-[0.2em] uppercase"
                            >
                                <Link href="/login">Return to Active Terminal</Link>
                            </Button>
                        </div>
                    )}

                    <div className="mt-10 pt-10 border-t border-white/5">
                        <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors group">
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Back to Authentication
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
