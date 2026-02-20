"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { processCreditPayment } from "@/app/(dashboard)/customers/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter
} from "@/components/ui/card"
import {
    CreditCard,
    Banknote,
    Wallet,
    Smartphone,
    CheckCircle2,
    AlertCircle,
    FileText
} from "lucide-react"

export function CustomerPaymentForm({ customer }: { customer: any }) {
    const [amount, setAmount] = useState<string>("")
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'mobile_money'>('cash')
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!amount || Number(amount) <= 0) return alert("Please enter a valid amount")

        setIsSubmitting(true)
        try {
            const res = await processCreditPayment(
                customer.id,
                Number(amount),
                paymentMethod,
                notes
            )

            if (res.success) {
                setAmount("")
                setNotes("")
                router.refresh()
            } else {
                alert("Payment recording failed: " + res.error)
            }
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card className="border-primary/10 bg-card/40 backdrop-blur rounded-3xl overflow-hidden shadow-xl shadow-primary/5">
            <CardHeader className="bg-primary/5 border-b border-primary/5 pb-6">
                <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" /> Record Credit Payment
                </CardTitle>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">
                    Recording a payment for <span className="text-primary">{customer.name}</span>
                </p>
            </CardHeader>
            <form onSubmit={handlePayment}>
                <CardContent className="p-8 space-y-8">
                    {/* Amount Input */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Payment Amount ($)</Label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary group-focus-within:scale-110 transition-transform">$</span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="h-20 text-4xl font-black pl-12 bg-accent/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-primary text-primary transition-all pr-8"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Payment Method</Label>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { id: 'cash', icon: Banknote, label: 'Cash' },
                                { id: 'bank_transfer', icon: CreditCard, label: 'Bank' },
                                { id: 'mobile_money', icon: Smartphone, label: 'Mobile' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method.id as any)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === method.id
                                            ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                                            : 'border-primary/5 bg-accent/50 text-muted-foreground hover:border-primary/20 hover:bg-accent'
                                        }`}
                                >
                                    <method.icon className={`h-6 w-6 ${paymentMethod === method.id ? 'animate-bounce' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{method.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Optional Notes */}
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Transaction Notes (Optional)</Label>
                        <div className="relative group">
                            <FileText className="absolute left-4 top-4 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <textarea
                                placeholder="Reference number, check ID, or source of payment..."
                                className="w-full h-24 bg-accent/50 border-none rounded-2xl p-4 pl-10 text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 resize-none"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-8 pt-0">
                    <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 gap-3 transform active:scale-[0.98] transition-all"
                        disabled={isSubmitting || !amount}
                    >
                        {isSubmitting ? (
                            "Processing Payment..."
                        ) : (
                            <>
                                <CheckCircle2 className="h-5 w-5" /> Record Payment
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
