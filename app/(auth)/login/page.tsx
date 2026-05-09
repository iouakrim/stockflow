"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Boxes,
    Lock,
    Mail,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Loader2,
    CheckCircle2
} from "lucide-react"
import Link from "next/link"

import { signInUser, resetPassword } from "./actions"

export default function LoginPage() {
    const [view, setView] = useState<'login' | 'forgot-password'>('login')
    const [isSuccess, setIsSuccess] = useState(false)
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
                setError("Identifiants incorrects. Veuillez réessayer.")
                setIsLoading(false)
            } else {
                window.location.href = "/dashboard"
            }
        } catch {
            setError("Échec de l'authentification. Veuillez vérifier votre connexion.")
            setIsLoading(false)
        }
    }

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const result = await resetPassword(email)
            if (result.error) {
                setError("Échec de l'envoi. Veuillez vérifier l'adresse email.")
                setIsLoading(false)
            } else {
                setIsSuccess(true)
                setIsLoading(false)
            }
        } catch {
            setError("Erreur système. Veuillez réessayer plus tard.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#102219] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[30%] size-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] size-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10 relative z-10 items-stretch">
                {/* Left side: Form */}
                <div className="w-full lg:w-[40%] flex flex-col animate-in slide-in-from-left duration-700">
                    <div className="w-full max-w-[420px] mx-auto flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="size-12 rounded-[1.5rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 mb-4 group cursor-pointer hover:rotate-12 transition-transform">
                            <Boxes className="h-6 w-6 text-[#102219]" />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic text-white">StockFlow <span className="text-primary font-black">Pro</span></h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mt-1">Plateforme de Gestion Intelligente</p>
                    </div>

                    <div className="glass-card p-6 lg:p-8 rounded-[2rem] border-primary/10 shadow-2xl bg-[#102219]/40 backdrop-blur-2xl flex-1 flex flex-col justify-center">
                        {view === 'login' ? (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-1 mb-6 text-center">
                                    <h2 className="text-xl font-black tracking-tight text-white">Connexion</h2>
                                    <p className="text-xs font-medium text-white/40 leading-relaxed">Authentification requise pour accéder à votre espace de travail.</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in">
                                        Accès Refusé : {error}
                                    </div>
                                )}

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-1.5 group">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Adresse Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="contact@entreprise.com"
                                                className="w-full bg-[#102219] border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                                required
                                                value={email}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 group">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 group-focus-within:text-primary transition-colors">Mot de passe</label>
                                            <button type="button" onClick={() => { setView('forgot-password'); setError(null); }} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors">Mot de passe oublié ?</button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="••••••••••••"
                                                className="w-full bg-[#102219] border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                                required
                                                value={password}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-xl h-12 text-xs tracking-widest uppercase shadow-xl shadow-primary/20 gap-3 relative overflow-hidden group active:scale-95 transition-all mt-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Se Connecter <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 w-full justify-center">
                                        <ShieldCheck className="h-3 w-3 text-primary opacity-60" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Connexion Sécurisée</span>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-white/20">
                                            Accès strictement réservé au personnel autorisé.<br />Contactez l'administrateur pour obtenir un accès.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-1 mb-6 text-center">
                                    <h2 className="text-xl font-black tracking-tight text-white">Mot de passe oublié</h2>
                                    <p className="text-xs font-medium text-white/40 leading-relaxed">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in zoom-in">
                                        Erreur : {error}
                                    </div>
                                )}

                                {isSuccess ? (
                                    <div className="space-y-6 animate-in fade-in zoom-in">
                                        <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col items-center text-center gap-3">
                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                            <p className="text-xs font-medium text-primary/80">
                                                Un lien de réinitialisation a été envoyé à <br/><strong className="text-white">{email}</strong>
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => { setView('login'); setIsSuccess(false); setError(null); }}
                                            variant="outline"
                                            className="w-full bg-transparent border-white/10 hover:bg-white/5 text-white font-bold rounded-xl h-12 text-xs tracking-widest uppercase mt-4"
                                        >
                                            <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la connexion
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleResetPassword} className="space-y-4">
                                        <div className="space-y-1.5 group">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 group-focus-within:text-primary transition-colors">Adresse Email</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="email"
                                                    placeholder="contact@entreprise.com"
                                                    className="w-full bg-[#102219] border-white/5 rounded-xl h-12 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-white/10 outline-none border"
                                                    required
                                                    value={email}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2 space-y-3">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-primary hover:bg-primary/90 text-[#102219] font-black rounded-xl h-12 text-xs tracking-widest uppercase shadow-xl shadow-primary/20 gap-3 relative overflow-hidden group active:scale-95 transition-all"
                                            >
                                                {isLoading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Envoyer le lien <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => { setView('login'); setError(null); }}
                                                variant="ghost"
                                                className="w-full hover:bg-white/5 text-white/60 hover:text-white font-bold rounded-xl h-12 text-xs tracking-widest uppercase"
                                            >
                                                Annuler
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                <div className="mt-6 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 w-full justify-center">
                                        <ShieldCheck className="h-3 w-3 text-primary opacity-60" />
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">Connexion Sécurisée</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* System Footer Info */}
                    <div className="mt-6 flex items-center justify-between px-4 opacity-30 mt-auto">
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60">© 2026 StockFlow Pro</p>
                        <div className="flex items-center gap-3">
                            <Link href="#" className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Confidentialité</Link>
                            <Link href="#" className="text-[8px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">CGU</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side: Hero Image */}
            <div className="hidden lg:block lg:w-[60%] relative animate-in slide-in-from-right duration-700 delay-150 fill-mode-both">
                <div className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 border border-primary/10 group transform-gpu" style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102219] via-[#102219]/40 to-transparent z-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-primary/10 mix-blend-overlay z-10 pointer-events-none" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src="/images/login-hero.png" 
                        alt="Logistics Matrix" 
                        className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-[10s] ease-out transform-gpu"
                    />
                    
                    <div className="absolute bottom-12 left-12 z-20 max-w-2xl pointer-events-none">
                        <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 inline-flex items-center gap-3 mb-6 shadow-2xl animate-pulse">
                            <span className="size-2 rounded-full bg-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Serveurs Opérationnels</span>
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
                            Le Futur de la <br/><span className="text-primary italic">Gestion d'Entrepôt.</span>
                        </h2>
                        <p className="text-base text-white/70 font-medium leading-relaxed max-w-md">
                            Connectez vos données, optimisez votre logistique et gardez le contrôle total sur votre chaîne d'approvisionnement grâce à l'intelligence centralisée.
                        </p>
                    </div>
                </div>
            </div>
            </div>
        </div>
    )
}
