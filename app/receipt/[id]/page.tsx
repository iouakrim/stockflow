import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations, getLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { Boxes, Truck } from "lucide-react"
import { PrintActions } from "./PrintActions"

export default async function ReceiptPage({ params, searchParams }: { params: { id: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
    const supabase = createClient()
    const isPickup = searchParams?.type === 'pickup'
    const { currency } = await getTenantSettings()
    const locale = await getLocale()

    // Fetch sale with nested items and customer
    const { data: sale } = await supabase
        .from("sales")
        .select(`
            *,
            tenants ( name ),
            customers ( name, phone ),
            profiles!sales_cashier_id_fkey ( full_name ),
            sale_items (
                id, 
                quantity, 
                unit_price, 
                total_price,
                products ( name, barcode, unit )
            )
        `)
        .eq("id", params.id)
        .single()

    if (!sale) notFound()
    const t = await getTranslations("Receipt")

    const companyName = sale.tenants?.name || "StockFlow Pro"

    return (
        <div className="bg-[#f0f0f0] text-black font-sans min-h-screen p-8 flex justify-center print:bg-white print:p-0 print:min-h-0 print:h-auto">
            <style type="text/css" media="print">
                {`
                    @page { 
                        margin: 0; 
                        size: 80mm auto;
                    }
                    html, body {
                        height: auto;
                        min-height: 0;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                `}
            </style>
            <PrintActions />
            {/* Standard 80mm thermal receipt width is max 300px */}
            <div className="w-[80mm] mx-auto bg-white shadow-2xl p-4 border-t-[8px] border-black receipt-container print:shadow-none print:border-none print:w-full print:max-w-full print:px-8 print:py-2 print:h-auto box-border print:mx-auto">

                {/* Header Section */}
                <div className={`text-center ${isPickup ? 'mb-1' : 'mb-3'}`}>
                    <div className={`flex justify-center ${isPickup ? 'mb-1' : 'mb-2'}`}>
                        <div className="bg-black text-white p-2 rounded-lg">
                            {isPickup ? <Truck className="size-8" /> : <Boxes className="size-8" />}
                        </div>
                    </div>
                    <h1 className="font-black text-xl uppercase tracking-widest leading-tight mt-1">
                        {isPickup ? t("pickupTicket") : companyName}
                    </h1>
                    {isPickup && <h2 className="font-black text-sm uppercase tracking-widest mt-1 mb-1 text-black">{companyName}</h2>}

                    {!isPickup && (
                        <div className="text-[10px] font-bold leading-tight text-black border-y border-dashed border-black py-1.5 mb-2 mt-2">
                            <p>{t("address")}</p>
                            <p>{t("district")}</p>
                            <p>{t("taxId")}</p>
                        </div>
                    )}
                </div>

                {/* Sub-Header / Info Section */}
                <div className={`text-[11px] grid grid-cols-2 gap-y-0.5 ${isPickup ? 'mb-2' : 'mb-3'} text-black font-bold`}>
                    <div className="text-black uppercase tracking-wider text-[10px] font-black">{t("issueDate")}</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleDateString(locale)}</div>

                    <div className="text-black uppercase tracking-wider text-[10px] font-black">{t("issueTime")}</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</div>

                    {sale.customers?.name && (
                        <>
                            <div className="text-black uppercase tracking-wider text-[10px] font-black mt-1">CLIENT</div>
                            <div className="text-right truncate max-w-full uppercase mt-1">{sale.customers.name}</div>
                        </>
                    )}
                </div>

                <div className={`border border-black border-dashed ${isPickup ? 'p-2 mb-2' : 'p-3 mb-3'} rounded-xl text-center`}>
                    <span className="block text-[11px] text-black font-black uppercase tracking-[0.3em] mb-1">{t("receiptNumber")}</span>
                    <span className="font-mono text-2xl font-black tracking-widest block">{sale.receipt_number?.replace('RCP-', '') || sale.receipt_number}</span>
                </div>

                {/* Items Table Section */}
                <div className={isPickup ? 'mb-2' : 'mb-3'}>
                    <div className={`font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-black ${isPickup ? 'pb-1 mb-1' : 'pb-1 mb-2'} flex justify-between`}>
                        <span>{isPickup ? t("itemsToLoad") : t("itemsPurchased")}</span>
                        {!isPickup && <span>{t("amount")}</span>}
                    </div>

                    <div className={isPickup ? 'space-y-1' : 'space-y-2'}>
                        {(sale.sale_items || []).map((item: { id: string; quantity: number; unit_price: number; total_price: number; products: { name: string; barcode: string | null; unit: string } | null }) => (
                            <div key={item.id} className="text-sm">
                                <div className="flex justify-between items-start leading-tight">
                                    <div className="font-black text-black uppercase pr-2 text-[11px]">{item.products?.name || t("unknownProduct")}</div>
                                    {isPickup && (
                                        <div className="font-black text-[18px] whitespace-nowrap text-black pr-2">
                                            {item.quantity > 500 && item.products?.unit !== 'UN' ? `${(item.quantity / 1000).toFixed(2)} ${t("tons")}` : `${item.quantity} ${item.products?.unit === 'UN' ? t("units") : t("kilograms")}`}
                                        </div>
                                    )}
                                </div>

                                {!isPickup && (
                                    <div className="flex justify-between items-end mt-0.5 font-black text-black border-b border-dashed border-black pb-1.5">
                                        <div className="text-xs">
                                            <span className="font-mono font-black text-black mr-1">
                                                {item.quantity > 500 && item.products?.unit !== 'UN' ? `${(item.quantity / 1000).toFixed(2)} ${t("tons")}` : `${item.quantity} ${item.products?.unit === 'UN' ? t("units") : t("kilograms")}`}
                                            </span>
                                            <span className="font-black mx-0.5">x</span>
                                            <span className="font-mono">{Number(item.unit_price).toFixed(2)} <span className="text-[10px]">{currency}</span></span>
                                            {item.products?.barcode && <div className="text-[9px] text-black font-mono mt-0.5">#{item.products.barcode}</div>}
                                        </div>
                                        <div className="font-black text-black font-mono text-sm leading-none">
                                            {Number(item.total_price).toFixed(2)} <span className="text-[10px] ml-0.5">{currency}</span>
                                        </div>
                                    </div>
                                )}
                                {isPickup && <div className="border-b border-dashed border-black pb-1 mt-0.5"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                {!isPickup ? (
                    <div className="space-y-1 text-sm font-black border-t-2 border-black pt-2 mb-3">
                        {sale.discount > 0 && (
                            <>
                                <div className="flex justify-between text-black">
                                    <span>{t("subtotal")}</span>
                                    <span className="font-mono">{Number(sale.subtotal).toFixed(2)} <span className="text-[10px] ml-0.5">{currency}</span></span>
                                </div>
                                <div className="flex justify-between text-black">
                                    <span>{t("discount")}</span>
                                    <span className="font-mono">-{Number(sale.discount).toFixed(2)} <span className="text-[10px] ml-0.5">{currency}</span></span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-end text-2xl font-black pt-1 pb-1 border-b-2 border-black border-double leading-none mt-1">
                            <span className="uppercase tracking-widest text-xs mb-0.5">{t("total")}</span>
                            <span className="font-mono">{Number(sale.total).toFixed(2)} <span className="text-sm ml-1">{currency}</span></span>
                        </div>
                        <div className="flex justify-between items-center pt-1 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">{t("paymentMethod")}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest border border-black px-2 py-0.5 rounded">
                                {sale.payment_method === 'credit' ? t("credit") : t("cash")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="border-t-[3px] border-black pt-2 mb-1 text-center border-b-2 pb-2 mt-2">
                        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-black mb-0.5">{t("totalPayload")}</div>
                        <div className="text-3xl font-black">
                            {(() => {
                                // Calculate total quantity, ignore 'UN' 
                                const totalWeight = (sale.sale_items || []).reduce((acc: number, item: { quantity: number; products: { unit: string } | null }) => {
                                    if (item.products?.unit !== 'UN') {
                                        return acc + item.quantity;
                                    }
                                    return acc;
                                }, 0);
                                return totalWeight > 0 ? (totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(3)} ${t("tons")}` : `${totalWeight} ${t("kilograms")}`) : 'N/A';
                            })()}
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                {!isPickup && (
                    <div className="text-center pt-2">
                        {/* Barcode Mockup */}
                        <div className="flex justify-center mb-2">
                            <div className="h-8 w-full max-w-[180px] flex gap-[2px]">
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className={`h-full bg-black ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t("thankYou")}</p>
                        <p className="text-[9px] text-black font-bold uppercase tracking-widest">{t("poweredBy")}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
