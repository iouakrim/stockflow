"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, ShieldCheck, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { updatePassword } from "./actions"
import Link from "next/link"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const result = await updatePassword(password)
            if (result.error) {
                setError(result.error)
            } else {
                setIsSuccess(true)
            }
        } catch (err) {
            setError(`Update failed. Please try again. ${err}`)
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
                <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary mb-8 border border-primary/20 shadow-2xl shadow-primary/10">
                    <CheckCircle2 className="size-10" />
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-white mb-4 text-center">Security Protocol Updated</h2>
                <p className="text-sm font-medium text-white/40 leading-relaxed max-w-sm text-center mb-10">
                    Your new access identifier has been verified and synchronized. You may now return to the dashboard.
                </p>
                <Link href="/dashboard">
                    <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-14 px-10 transition-all">
                        ENTER DASHBOARD <ArrowRight className="size-5" />
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-md mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-3 mb-10 text-center">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                    <ShieldCheck className="size-7" />
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Protocol Reset</h2>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest px-4">Initialize new security key for your account node.</p>
            </div>

            <div className="glass-card p-10 rounded-[2.5rem] border-primary/10 bg-[#102219]/40 backdrop-blur-2xl">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in">
                        System Error: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">New Security Key</label>
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

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Verify Security Key</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                className="w-full bg-[#102219] border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            <>Confirm Synchronization <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
