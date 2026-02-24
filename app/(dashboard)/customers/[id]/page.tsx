import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CustomerTransactionsTable } from "../CustomerTransactionsTable"
import { DebtRepaymentModal } from "@/components/customers/DebtRepaymentModal"
import {
    ArrowLeft,
    Phone,
    History,
    Wallet
} from "lucide-react"

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { currency } = await getTenantSettings()

    // Fetch customer details
    const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!customer) notFound()

    // Fetch payment history
    const { data: payments } = await supabase
        .from("credit_payments")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })

    // Fetch purchase history (Sales)
    const { data: sales } = await supabase
        .from("sales")
        .select(`
            id,
            total,
            payment_method,
            receipt_number,
            created_at,
            sale_items (
                id,
                quantity,
                unit_price,
                total_price,
                products (name, unit)
            )
        `)
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })

    const totalPurchases = (sales || []).reduce((acc, sale) => acc + Number(sale.total), 0)
    const hasDebt = Number(customer.credit_balance) > 0
    const t = await getTranslations("Customers")

    // Merge and sort all transactions
    const allTransactions = [
        ...(sales || []).map(s => ({ ...s, type: 'sale' })),
        ...(payments || []).map(p => ({ ...p, type: 'payment', total: p.amount, receipt_number: t("paymentSettle") }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return (
        <div className="flex-1 space-y-8 max-w-6xl mx-auto">
            {/* Header & Back Button */}
            <div className="flex flex-col gap-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href="/customers">
                            <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/10 hover:text-primary size-12">
                                <ArrowLeft className="h-6 w-6" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h1 className="text-4xl font-black tracking-tight">{customer.name}</h1>
                                <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${hasDebt ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                    {hasDebt ? t("hasDebt") : t("clearAccount")}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground">
                                <p className="text-[11px] uppercase tracking-[0.2em] font-black opacity-60">{t("customerId")}: {customer.id.slice(0, 8)}</p>
                                {customer.phone && (
                                    <>
                                        <span className="opacity-20">•</span>
                                        <p className="text-[11px] uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                            <Phone className="size-3.5 text-primary" /> {customer.phone}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {hasDebt && (
                        <DebtRepaymentModal
                            customer={customer}
                            currency={currency}
                            labels={{
                                recordPayment: t("recordPayment"),
                                amountToPay: t("amountToPay"),
                                fullPayment: t("fullPayment"),
                                halfPayment: t("halfPayment"),
                                paymentSuccess: t("paymentSuccess"),
                                printPaymentReceipt: t("printPaymentReceipt"),
                                print: t("print")
                            }}
                        />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-card/30 backdrop-blur rounded-2xl border border-primary/5 p-4 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1 opacity-60">{t("totalPurchases")}</p>
                            <div className="flex items-end gap-1.5">
                                <h3 className="text-2xl font-black tracking-tighter text-foreground">
                                    {totalPurchases.toFixed(2)}
                                </h3>
                                <span className="text-[9px] font-black mb-0.5 opacity-30 lowercase">{currency}</span>
                            </div>
                        </div>
                        <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                            <History className="size-5 opacity-40" />
                        </div>
                    </div>

                    <div className="bg-card/50 backdrop-blur rounded-2xl border border-primary/10 p-4 shadow-md shadow-primary/5 flex items-center justify-between relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1 opacity-60">{t("outstandingBalance")}</p>
                            <div className="flex items-end gap-1.5">
                                <h3 className={`text-3xl font-black tracking-tighter ${hasDebt ? 'text-destructive' : 'text-primary'}`}>
                                    {Number(customer.credit_balance).toFixed(2)}
                                </h3>
                                <span className="text-[10px] font-black mb-0.5 opacity-30 lowercase">{currency}</span>
                            </div>
                        </div>
                        <div className={`size-10 rounded-xl flex items-center justify-center ${hasDebt ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'} relative z-10`}>
                            <Wallet className="size-5 opacity-60" />
                        </div>
                        {hasDebt && <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-destructive/10 transition-colors animate-pulse"></div>}
                    </div>
                </div>
            </div>

            {/* Unified Transactions Table */}
            <Card className="border-primary/10 bg-card/40 backdrop-blur rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="border-b border-primary/5 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <History className="h-5 w-5 text-primary" /> {t("transactionHistory")}
                        </CardTitle>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{allTransactions.length} {t("records")}</span>
                    </div>
                </CardHeader>
                <CustomerTransactionsTable
                    transactions={allTransactions}
                    currency={currency}
                    labels={{
                        date: t("date"),
                        reference: t("reference"),
                        type: t("type"),
                        amount: t("amount"),
                        paymentSettle: t("paymentSettle"),
                        noActivity: t("noActivity"),
                        saleDetails: t("saleDetails"),
                        transactionTotal: t("transactionTotal"),
                        items: t("items"),
                        totalAmount: t("totalAmount")
                    }}
                />
            </Card>
        </div>
    )
}
