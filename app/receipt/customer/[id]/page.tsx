import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { Wallet, CheckCircle2, History, FileText } from "lucide-react"
import { PrintActions } from "../../[id]/PrintActions"

export default async function CustomerStatementPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { currency } = await getTenantSettings()

    // Fetch customer details
    const { data: customer } = await supabase
        .from("customers")
        .select(`
            *,
            tenants ( name )
        `)
        .eq("id", params.id)
        .single()

    if (!customer) notFound()

    // Fetch recent transactions (last 10)
    const { data: sales } = await supabase
        .from("sales")
        .select("id, total, created_at, receipt_number")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(10)

    const { data: payments } = await supabase
        .from("credit_payments")
        .select("id, amount, created_at, notes, payment_method")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(10)

    const allTransactions = [
        ...(sales || []).map(s => ({ ...s, type: 'sale', amount: s.total })),
        ...(payments || []).map(p => ({ ...p, type: 'payment', amount: p.amount, receipt_number: 'Paiement' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

    const t = await getTranslations("Receipt")
    const ct = await getTranslations("Customers")

    const companyName = customer.tenants?.name || "StockFlow Pro"

    return (
        <div className="bg-[#f0f0f0] text-black font-sans min-h-screen p-8 flex justify-center print:bg-white print:p-0">
            <PrintActions />
            <div className="w-[80mm] max-w-[320px] bg-white shadow-2xl p-6 border-t-[8px] border-black receipt-container print:shadow-none print:border-none print:max-w-none print:w-[80mm]">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-black text-white p-3 rounded-2xl shadow-lg shadow-black/10">
                            <FileText className="size-8" />
                        </div>
                    </div>
                    <h1 className="font-black text-xl uppercase tracking-widest mb-1">
                        {ct("outstandingBalance") || "Relevé de Compte"}
                    </h1>
                    <h2 className="font-black text-xs uppercase tracking-widest text-gray-500">{companyName}</h2>
                </div>

                {/* Info Section */}
                <div className="text-[11px] grid grid-cols-2 gap-y-2 mb-8 text-gray-800 font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">{t("date") || "Date"}</div>
                    <div className="text-right font-black" suppressHydrationWarning>{new Date().toLocaleDateString()}</div>

                    <div className="col-span-2 border-t border-gray-200/50 my-1"></div>

                    <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">{ct("customer") || "Client"}</div>
                    <div className="text-right font-black uppercase text-[10px]">{customer.name}</div>

                    {customer.phone && (
                        <>
                            <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">Tel</div>
                            <div className="text-right font-black">{customer.phone}</div>
                        </>
                    )}
                </div>

                {/* Balance Section */}
                <div className="border-y-2 border-black py-4 text-center mb-8">
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{ct("outstandingBalance") || "Dette Restante"}</span>
                    <div className="text-2xl font-black tracking-tighter">
                        {Number(customer.credit_balance).toFixed(2)}
                        <span className="text-lg opacity-60 ml-2 uppercase font-black">{currency}</span>
                    </div>
                </div>

                {/* History Section */}
                <div className="mb-8">
                    <div className="font-black text-[9px] uppercase tracking-[0.2em] border-b-2 border-black pb-2 mb-3">
                        {ct("transactionHistory") || "Dernières Activités"}
                    </div>
                    <div className="space-y-3">
                        {allTransactions.map((tx, i) => (
                            <div key={tx.id + i} className="flex justify-between items-start text-[10px] border-b border-dashed border-gray-100 pb-2">
                                <div>
                                    <div className="font-black uppercase tracking-tight">{tx.receipt_number}</div>
                                    <div className="text-[8px] text-gray-400 font-bold">{new Date(tx.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className={`font-black tracking-tighter ${tx.type === 'payment' ? 'text-gray-600' : 'text-gray-900'}`}>
                                    {tx.type === 'payment' ? '-' : '+'}{Number(tx.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center pt-6 border-t border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t("thankYou") || "Merci pour votre fidélité"}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">{t("poweredBy") || "Powered by StockFlow Pro"}</p>
                </div>
            </div>
        </div>
    )
}
