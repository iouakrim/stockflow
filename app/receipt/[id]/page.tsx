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
        <div className="bg-[#f0f0f0] text-black font-sans min-h-screen p-8 flex justify-center print:bg-white print:p-0">
            <PrintActions />
            {/* Standard 80mm thermal receipt width is max 300px */}
            <div className="w-[80mm] max-w-[320px] bg-white shadow-2xl p-6 border-t-[8px] border-black receipt-container print:shadow-none print:border-none print:max-w-none print:w-[80mm]">

                {/* Header Section */}
                <div className={`text-center ${isPickup ? 'mb-2' : 'mb-6'}`}>
                    <div className={`flex justify-center ${isPickup ? 'mb-2' : 'mb-4'}`}>
                        <div className="bg-black text-white p-2 rounded-lg">
                            {isPickup ? <Truck className="size-6" /> : <Boxes className="size-6" />}
                        </div>
                    </div>
                    <h1 className="font-black text-xl uppercase tracking-widest mb-1">
                        {isPickup ? t("pickupTicket") : companyName}
                    </h1>
                    {isPickup && <h2 className="font-black text-sm uppercase tracking-widest mt-1 mb-2 text-gray-500">{companyName}</h2>}

                    {!isPickup && (
                        <div className="text-[10px] font-medium leading-relaxed text-gray-800 border-y border-dashed border-gray-300 py-3 mb-4 mt-4">
                            <p>{t("address")}</p>
                            <p>{t("district")}</p>
                            <p>{t("taxId")}</p>
                        </div>
                    )}
                </div>

                {/* Sub-Header / Info Section */}
                <div className={`text-[11px] grid grid-cols-2 gap-y-1 ${isPickup ? 'mb-3' : 'mb-6'} text-gray-800 font-medium`}>
                    <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">{t("issueDate")}</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleDateString(locale)}</div>

                    <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">{t("issueTime")}</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className={`bg-gray-100 ${isPickup ? 'p-2 mb-3' : 'p-3 mb-6'} rounded-lg text-center`}>
                    <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{t("receiptNumber")}</span>
                    <span className="font-mono text-sm font-black tracking-widest">{sale.receipt_number}</span>
                </div>

                {/* Items Table Section */}
                <div className={isPickup ? 'mb-3' : 'mb-6'}>
                    <div className={`font-black text-[9px] uppercase tracking-[0.2em] border-b-2 border-black ${isPickup ? 'pb-1 mb-2' : 'pb-2 mb-3'} flex justify-between`}>
                        <span>{isPickup ? t("itemsToLoad") : t("itemsPurchased")}</span>
                        {!isPickup && <span>{t("amount")}</span>}
                    </div>

                    <div className={isPickup ? 'space-y-1.5' : 'space-y-4'}>
                        {(sale.sale_items || []).map((item: { id: string; quantity: number; unit_price: number; total_price: number; products: { name: string; barcode: string | null; unit: string } | null }) => (
                            <div key={item.id} className="text-xs">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-black uppercase pr-4">{item.products?.name || t("unknownProduct")}</div>
                                    {isPickup && (
                                        <div className="font-black text-[18px] whitespace-nowrap text-black pr-2">
                                            {item.quantity > 500 && item.products?.unit !== 'UN' ? `${(item.quantity / 1000).toFixed(2)} ${t("tons")}` : `${item.quantity} ${item.products?.unit === 'UN' ? t("units") : t("kilograms")}`}
                                        </div>
                                    )}
                                </div>

                                {!isPickup && (
                                    <div className="flex justify-between items-end mt-1 font-medium text-gray-600 border-b border-dashed border-gray-200 pb-2">
                                        <div className="text-[10px]">
                                            <span className="font-mono font-black text-black mr-1">
                                                {item.quantity > 500 && item.products?.unit !== 'UN' ? `${(item.quantity / 1000).toFixed(2)} ${t("tons")}` : `${item.quantity} ${item.products?.unit === 'UN' ? t("units") : t("kilograms")}`}
                                            </span>
                                            <span className="opacity-50">x</span> <span className="font-mono">{Number(item.unit_price).toFixed(2)} <span className="text-[9px] opacity-70">{currency}</span></span>
                                            {item.products?.barcode && <div className="text-[8px] text-gray-400 font-mono mt-1">#{item.products.barcode}</div>}
                                        </div>
                                        <div className="font-black text-black font-mono">
                                            {Number(item.total_price).toFixed(2)} <span className="text-[10px] opacity-70 ml-0.5">{currency}</span>
                                        </div>
                                    </div>
                                )}
                                {isPickup && <div className="border-b border-dashed border-gray-200 pb-1 mt-1"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                {!isPickup ? (
                    <div className="space-y-2 text-xs font-medium border-t-2 border-black pt-3 mb-6">
                        {sale.discount > 0 && (
                            <>
                                <div className="flex justify-between text-gray-600">
                                    <span>{t("subtotal")}</span>
                                    <span className="font-mono">{Number(sale.subtotal).toFixed(2)} <span className="text-[9px] opacity-70 ml-0.5">{currency}</span></span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>{t("discount")}</span>
                                    <span className="font-mono">-{Number(sale.discount).toFixed(2)} <span className="text-[9px] opacity-70 ml-0.5">{currency}</span></span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center text-lg font-black pt-2 pb-1 border-b-2 border-black border-double">
                            <span className="uppercase tracking-widest text-[11px]">{t("total")}</span>
                            <span className="font-mono">{Number(sale.total).toFixed(2)} <span className="text-xs opacity-50 ml-1">{currency}</span></span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{t("paymentMethod")}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest border border-black px-2 py-0.5 rounded">
                                {sale.payment_method === 'credit' ? t("credit") : t("cash")}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="border-t-[3px] border-black pt-2 mb-1 text-center bg-gray-100 p-2 rounded-xl mt-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">{t("totalPayload")}</div>
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
                    <div className="text-center pt-4">
                        {/* Barcode Mockup */}
                        <div className="flex justify-center mb-4">
                            <div className="h-10 w-full max-w-[200px] flex gap-[2px]">
                                {[...Array(40)].map((_, i) => (
                                    <div key={i} className={`h-full bg-black ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'}`} />
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">{t("thankYou")}</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">{t("poweredBy")}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
