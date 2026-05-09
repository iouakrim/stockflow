"use client"

import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useCartStore } from "./CartStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Zap } from "lucide-react"
import { toast } from "sonner"

interface POSCheckoutPanelProps {
    handleCheckout: () => void;
    isProcessing: boolean;
    showSuccess: boolean;
    discountAmount: number;
    subtotal: number;
    grandTotal: number;
    paymentMode: 'cash' | 'credit';
    setPaymentMode: (mode: 'cash' | 'credit') => void;
    selectedCustomerId: string;
    setIsCustomerOpen: (open: boolean) => void;
    showDiscount: boolean;
    setShowDiscount: (open: boolean) => void;
}

export function POSCheckoutPanel({
    handleCheckout,
    isProcessing,
    showSuccess,
    discountAmount,
    subtotal,
    grandTotal,
    paymentMode,
    setPaymentMode,
    selectedCustomerId,
    setIsCustomerOpen,
    showDiscount,
    setShowDiscount
}: POSCheckoutPanelProps) {
    const { items, discount, discountType, setDiscount } = useCartStore()
    const { currency } = useSettings()
    const t = useTranslations("POS")

    return (
        <div className="pt-4 border-t border-primary/10 space-y-4">
            {/* Smart Discount Toggle */}
            <div className="space-y-2">
                <button
                    onClick={() => setShowDiscount(!showDiscount)}
                    className={`w-full h-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-between px-4 ${discount > 0
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                        : showDiscount
                            ? 'bg-primary/10 border-primary/30 text-primary'
                            : 'bg-card/40 border-primary/10 text-muted-foreground hover:border-primary/30 hover:text-primary'
                        }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="text-sm">%</span>
                        {t("applyDiscount")}
                    </span>
                    <span className="flex items-center gap-2">
                        {discount > 0 && (
                            <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-500/20 rounded-lg">
                                -{discountAmount.toFixed(2)} {currency}
                            </span>
                        )}
                        <span className={`transition-transform duration-200 ${showDiscount ? 'rotate-180' : ''}`}>▾</span>
                    </span>
                </button>

                {showDiscount && (
                    <div className="bg-primary/[0.02] p-4 rounded-3xl border border-primary/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("applyDiscount")}</span>
                            {discount > 0 && (
                                <button
                                    onClick={() => { setDiscount(0, 'percentage'); }}
                                    className="text-[9px] font-bold text-destructive hover:underline uppercase tracking-widest"
                                >
                                    {t("clear")}
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {[5, 10, 15].map((pct) => (
                                <button
                                    key={pct}
                                    onClick={() => setDiscount(pct, 'percentage')}
                                    className={`flex-1 h-9 rounded-xl text-xs font-black transition-all border ${discount === pct && discountType === 'percentage'
                                        ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                                        : 'bg-background text-muted-foreground border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                                        }`}
                                >
                                    -{pct}%
                                </button>
                            ))}
                            <div className="relative flex-1">
                                <Input
                                    type="number"
                                    placeholder="$$"
                                    className={`h-9 rounded-xl text-xs font-black px-2 pr-6 text-right transition-all border ${discount > 0 && discountType === 'fixed'
                                        ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                                        : 'border-primary/10 hover:border-primary/30'
                                        }`}
                                    value={discountType === 'fixed' && discount > 0 ? discount : ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0
                                        setDiscount(val, 'fixed')
                                    }}
                                />
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-muted-foreground pointer-events-none">{currency}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-primary/[0.02] p-3 rounded-3xl border border-primary/5">
                <div className="flex gap-2">
                    <button
                        onClick={() => setPaymentMode('cash')}
                        className={`flex-1 h-10 rounded-xl text-[10px] font-black transition-all border uppercase tracking-wider ${paymentMode === 'cash'
                            ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                            : 'bg-background text-muted-foreground border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                            }`}
                    >
                        {t("paid")}
                    </button>
                    <button
                        onClick={() => {
                            if (selectedCustomerId === 'walk-in') {
                                setIsCustomerOpen(true)
                                toast.error("Veuillez sélectionner un client pour le crédit")
                            } else {
                                setPaymentMode('credit')
                            }
                        }}
                        className={`flex-1 h-10 rounded-xl text-[10px] font-black transition-all border uppercase tracking-wider ${paymentMode === 'credit'
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                            : 'bg-background text-muted-foreground border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                            }`}
                    >
                        {t("credit")}
                    </button>
                </div>
            </div>

            <div className="bg-primary/[0.03] p-4 rounded-3xl border border-primary/10 space-y-2 shadow-inner">
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-2 pb-2 border-b border-primary/5">
                        <span className="uppercase tracking-widest">{t("subtotal")}</span>
                        <span className="line-through opacity-50">{subtotal.toFixed(2)} <span className="text-[9px] ml-0.5">{currency}</span></span>
                    </div>
                )}
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-500 mb-2 pb-2 border-b border-primary/5">
                        <span className="uppercase tracking-widest">{t("discount")}</span>
                        <span>-{discountAmount.toFixed(2)} <span className="text-[9px] ml-0.5">{currency}</span></span>
                    </div>
                )}
                <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase text-primary tracking-[0.2em] mb-1">{t("total")}</span>
                    <span className="text-3xl font-black tracking-tighter text-foreground leading-none">{grandTotal.toFixed(2)} <span className="text-sm font-black ml-1 opacity-40">{currency}</span></span>
                </div>
            </div>

            <Button
                onClick={handleCheckout}
                disabled={items.length === 0 || isProcessing}
                className={`w-full h-14 rounded-2xl shadow-xl font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${showSuccess ? 'bg-green-500 hover:bg-green-500' : 'bg-primary hover:bg-primary/90 text-background'}`}
            >
                {showSuccess ? (
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" /> {t("completed")}
                    </div>
                ) : isProcessing ? (
                    <div className="flex items-center gap-3">
                        <span className="size-4 border-2 border-background/20 border-t-background rounded-full animate-spin" /> {t("processing")}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 fill-current" /> {t("checkout")}
                    </div>
                )}
            </Button>
        </div>
    )
}
