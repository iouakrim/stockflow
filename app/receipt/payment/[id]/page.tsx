import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { Wallet, CheckCircle2 } from "lucide-react"
import { PrintActions } from "../../[id]/PrintActions"

export default async function PaymentReceiptPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { currency } = await getTenantSettings()

    const { data: payment } = await supabase
        .from("credit_payments")
        .select(`
            *,
            tenants ( name ),
            customers ( name, phone ),
            profiles:received_by ( full_name )
        `)
        .eq("id", params.id)
        .single()

    if (!payment) notFound()
    const t = await getTranslations("Receipt")
    const ct = await getTranslations("Customers")

    const companyName = payment.tenants?.name || "StockFlow Pro"

    return (
        <div className="bg-[#f0f0f0] text-black font-sans min-h-screen p-8 flex justify-center print:bg-white print:p-0">
            <PrintActions />
            <div className="w-[80mm] max-w-[320px] bg-white shadow-2xl p-6 border-t-[8px] border-emerald-500 receipt-container print:shadow-none print:border-none print:max-w-none print:w-[80mm]">

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                            <Wallet className="size-8" />
                        </div>
                    </div>
                    <h1 className="font-black text-xl uppercase tracking-widest mb-1">
                        {t("paymentReceipt") || "Reçu de Paiement"}
                    </h1>
                    <h2 className="font-black text-xs uppercase tracking-widest text-emerald-600">{companyName}</h2>
                </div>

                {/* Info Section */}
                <div className="text-[11px] grid grid-cols-2 gap-y-2 mb-8 text-gray-800 font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">{t("date") || "Date"}</div>
                    <div className="text-right font-black" suppressHydrationWarning>{new Date(payment.created_at).toLocaleDateString()}</div>

                    <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">{t("time") || "Heure"}</div>
                    <div className="text-right font-black" suppressHydrationWarning>{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                    <div className="col-span-2 border-t border-gray-200/50 my-1"></div>

                    <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">{ct("customer") || "Client"}</div>
                    <div className="text-right font-black uppercase text-[10px]">{payment.customers?.name}</div>

                    {payment.customers?.phone && (
                        <>
                            <div className="text-gray-400 uppercase tracking-wider text-[9px] font-bold">Tel</div>
                            <div className="text-right font-black">{payment.customers?.phone}</div>
                        </>
                    )}
                </div>

                {/* Amount Section */}
                <div className="bg-emerald-500 text-white p-6 rounded-3xl text-center mb-8 shadow-xl shadow-emerald-500/20">
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">{ct("amountToPay") || "Montant Reçu"}</span>
                    <div className="text-4xl font-black tracking-tighter">
                        {Number(payment.amount).toFixed(2)}
                        <span className="text-sm opacity-60 ml-1 lowercase font-bold">{currency}</span>
                    </div>
                </div>

                {/* Payment Detail */}
                <div className="space-y-4 mb-10 px-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">{t("method") || "Mode"}</span>
                        <span className="font-black uppercase tracking-tighter bg-gray-100 px-3 py-1 rounded-lg">{payment.payment_method}</span>
                    </div>
                    {payment.notes && (
                        <div className="pt-4 border-t border-dashed border-gray-200">
                            <span className="block text-gray-400 font-bold uppercase tracking-widest text-[9px] mb-2">{t("notes") || "Notes"}</span>
                            <p className="text-xs font-black italic text-gray-600 leading-relaxed">"{payment.notes}"</p>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="text-center pt-6 border-t border-gray-100">
                    <div className="flex justify-center mb-4">
                        <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="size-6" />
                        </div>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t("thankYou") || "Merci pour votre confiance"}</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">{t("poweredBy") || "Powered by StockFlow Pro"}</p>

                    {/* Barcode Mockup */}
                    <div className="flex justify-center mt-6 opacity-30">
                        <div className="h-6 w-3/4 flex gap-[1px]">
                            {[...Array(40)].map((_, i) => (
                                <div key={i} className={`h-full bg-black ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
