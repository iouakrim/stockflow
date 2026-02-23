"use client"

import { useState } from "react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, Printer, CheckCircle2, Loader2, Wallet, X } from "lucide-react"
import { processCreditPayment } from "@/app/(dashboard)/customers/actions"
import { toast } from "sonner"

interface DebtRepaymentModalProps {
    customer: {
        id: string;
        name: string;
        credit_balance: number;
    };
    currency: string;
    labels: any;
}

export function DebtRepaymentModal({ customer, currency, labels }: DebtRepaymentModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [amount, setAmount] = useState<string>("")
    const [notes, setNotes] = useState<string>("")
    const [isSuccess, setIsSuccess] = useState(false)
    const [paymentId, setPaymentId] = useState<string | null>(null)

    const handleSettle = async () => {
        const val = parseFloat(amount)
        if (isNaN(val) || val <= 0) return

        try {
            setIsProcessing(true)
            const res = await processCreditPayment(customer.id, val, "cash", notes)

            if (res.success) {
                setIsSuccess(true)
                setPaymentId(res.paymentId || null)
                toast.success(labels.paymentSuccess)
            } else {
                toast.error(res.error)
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const reset = () => {
        setIsOpen(false)
        setTimeout(() => {
            setIsSuccess(false)
            setAmount("")
            setNotes("")
            setPaymentId(null)
        }, 300)
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="h-11 px-5 rounded-xl border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 font-black tracking-widest uppercase text-[10px] gap-2 shrink-0 transition-all border-2">
                    <Wallet className="size-3.5" /> {labels.recordPayment}
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md border-l border-primary/10 glass-card p-0 flex flex-col h-full">
                {isSuccess ? (
                    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="size-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8 shadow-inner">
                            <CheckCircle2 className="size-12" />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-3">{labels.paymentSuccess}</h2>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60 mb-10">
                            {parseFloat(amount).toFixed(2)} {currency} enregistré
                        </p>

                        <div className="w-full space-y-4">
                            <Button
                                onClick={() => window.open(`/receipt/payment/${paymentId}`, '_blank')}
                                className="w-full h-16 rounded-2xl bg-black hover:bg-black/90 text-white font-black tracking-widest uppercase shadow-xl shadow-black/10 gap-3 text-sm"
                            >
                                <Printer className="size-5" /> {labels.printPaymentReceipt}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="w-full h-16 rounded-2xl border-2 border-primary/10 font-black tracking-widest uppercase text-xs"
                            >
                                Terminer
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <SheetHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">{customer.name}</span>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full size-7">
                                    <X className="size-3.5" />
                                </Button>
                            </div>
                            <SheetTitle className="text-2xl font-black uppercase tracking-tight">
                                {labels.recordPayment}
                            </SheetTitle>
                        </SheetHeader>

                        <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            {/* Balance Card - More Compact */}
                            <div className="bg-card/50 backdrop-blur rounded-2xl border border-primary/10 p-4 shadow-sm">
                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1 opacity-60">Dette Actuelle</p>
                                <div className="flex items-end gap-1.5">
                                    <h3 className="text-3xl font-black tracking-tighter text-destructive">
                                        {Number(customer.credit_balance).toFixed(2)}
                                    </h3>
                                    <span className="text-[10px] font-black mb-1 opacity-30 lowercase">{currency}</span>
                                </div>
                            </div>

                            {/* Amount Input - Optimized Height */}
                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{labels.amountToPay}</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="h-14 pl-12 text-2xl font-black tracking-tighter bg-card/40 border-primary/10 rounded-2xl focus:ring-primary shadow-inner"
                                        />
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-primary opacity-30" />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setAmount((Number(customer.credit_balance) / 2).toString())}
                                        className="flex-1 h-9 rounded-xl border-dashed border-primary/20 text-[9px] font-black uppercase tracking-widest hover:border-primary/40 hover:bg-primary/5 transition-all"
                                    >
                                        50%
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setAmount(customer.credit_balance.toString())}
                                        className="flex-1 h-9 rounded-xl border-dashed border-emerald-500/20 text-[9px] font-black uppercase tracking-widest hover:border-emerald-500/40 hover:bg-emerald-500/5 text-emerald-600 transition-all font-black"
                                    >
                                        100%
                                    </Button>
                                </div>
                            </div>

                            {/* Payment Info - Slimmer version */}
                            <div className="space-y-4">
                                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                                            <Wallet className="size-4" />
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600 opacity-70">Règlement</p>
                                            <p className="text-xs font-black uppercase tracking-tight">Espèces (Cash)</p>
                                        </div>
                                    </div>
                                    <div className="size-1.5 rounded-full bg-emerald-500"></div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">Notes / Référence</label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Note optionnelle..."
                                        className="bg-card/40 border-primary/10 rounded-xl min-h-[80px] p-3 text-xs font-bold"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-primary/5 bg-primary/[0.01]">
                            <Button
                                onClick={handleSettle}
                                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                                className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-[0.1em] uppercase shadow-xl shadow-emerald-500/20 text-xs active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="size-5 animate-spin" /> : labels.recordPayment}
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
