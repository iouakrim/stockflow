"use client"

import { Boxes, ShieldAlert, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen bg-[#102219] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 premium-grid opacity-20 pointer-events-none" />

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

                <div className="glass-card p-10 rounded-[2.5rem] border-red-500/10 shadow-2xl bg-[#102219]/40 backdrop-blur-2xl text-center">
                    <div className="size-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20 shadow-2xl shadow-red-500/10">
                        <ShieldAlert className="size-10" />
                    </div>

                    <h2 className="text-2xl font-black tracking-tight text-white mb-4 uppercase italic">Security Protocol Failed</h2>

                    <p className="text-sm font-medium text-white/40 leading-relaxed mb-10">
                        The authentication code or recovery link has expired or is no longer valid. For security reasons, these links are only active for a short period.
                    </p>

                    <div className="space-y-4">
                        <Button
                            asChild
                            className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-2xl h-14 text-xs tracking-widest uppercase shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Link href="/forgot-password">Request New Protocol</Link>
                        </Button>

                        <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors group pt-4">
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Back to Authentication
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[10px] font-bold text-white/10 mt-10 uppercase tracking-[0.2em]">
                    System Error Code: AUTH_SYNC_EXPIRED
                </p>
            </div>
        </div>
    )
}
