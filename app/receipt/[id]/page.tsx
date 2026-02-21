import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Boxes, CircleCheckBig, Truck } from "lucide-react"
import { PrintActions } from "./PrintActions"

export default async function ReceiptPage({ params, searchParams }: { params: { id: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
    const supabase = createClient()
    const isPickup = searchParams?.type === 'pickup'

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
                        {isPickup ? "PICKUP TICKET" : companyName}
                    </h1>
                    {isPickup && <h2 className="font-black text-sm uppercase tracking-widest mt-1 mb-2 text-gray-500">{companyName}</h2>}

                    {!isPickup && (
                        <div className="text-[10px] font-medium leading-relaxed text-gray-800 border-y border-dashed border-gray-300 py-3 mb-4 mt-4">
                            <p>123 Commerce Avenue, Block 4</p>
                            <p>Central Logistics District</p>
                            <p>Tax ID: SF-9283-441-A</p>
                        </div>
                    )}
                </div>

                {/* Sub-Header / Info Section */}
                <div className={`text-[11px] grid grid-cols-2 gap-y-1 ${isPickup ? 'mb-3' : 'mb-6'} text-gray-800 font-medium`}>
                    <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">Issue Date</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>

                    <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">Issue Time</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className={`bg-gray-100 ${isPickup ? 'p-2 mb-3' : 'p-3 mb-6'} rounded-lg text-center`}>
                    <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Receipt Number</span>
                    <span className="font-mono text-sm font-black tracking-widest">{sale.receipt_number}</span>
                </div>

                {/* Items Table Section */}
                <div className={isPickup ? 'mb-3' : 'mb-6'}>
                    <div className={`font-black text-[9px] uppercase tracking-[0.2em] border-b-2 border-black ${isPickup ? 'pb-1 mb-2' : 'pb-2 mb-3'} flex justify-between`}>
                        <span>Items {isPickup ? "to Load" : "Purchased"}</span>
                        {!isPickup && <span>Amount</span>}
                    </div>

                    <div className={isPickup ? 'space-y-1.5' : 'space-y-4'}>
                        {(sale.sale_items || []).map((item: any) => (
                            <div key={item.id} className="text-xs">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-black uppercase pr-4">{item.products?.name || "Unknown Product"}</div>
                                    {isPickup && (
                                        <div className="font-black text-[18px] whitespace-nowrap text-black pr-2">
                                            {item.quantity > 500 && item.products?.unit !== 'UN' ? `${(item.quantity / 1000).toFixed(2)} T` : `${item.quantity} ${item.products?.unit || 'KG'}`}
                                        </div>
                                    )}
                                </div>

                                {!isPickup && (
                                    <div className="flex justify-between items-end mt-1 font-medium text-gray-600 border-b border-dashed border-gray-200 pb-2">
                                        <div className="text-[10px]">
                                            <span className="font-mono font-black text-black mr-1">
                                                {item.quantity > 500 && item.products?.unit !== 'UN' ? `${(item.quantity / 1000).toFixed(2)} T` : `${item.quantity} ${item.products?.unit || 'KG'}`}
                                            </span>
                                            <span className="opacity-50">x</span> <span className="font-mono">${Number(item.unit_price).toFixed(2)}</span>
                                            {item.products?.barcode && <div className="text-[8px] text-gray-400 font-mono mt-1">#{item.products.barcode}</div>}
                                        </div>
                                        <div className="font-black text-black font-mono">
                                            ${Number(item.total_price).toFixed(2)}
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
                                    <span>Subtotal</span>
                                    <span className="font-mono">${Number(sale.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Discount</span>
                                    <span className="font-mono">-${Number(sale.discount).toFixed(2)}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between items-center text-lg font-black pt-2 pb-1 border-b-2 border-black border-double">
                            <span className="uppercase tracking-widest text-[11px]">Total</span>
                            <span className="font-mono">${Number(sale.total).toFixed(2)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="border-t-[3px] border-black pt-2 mb-1 text-center bg-gray-100 p-2 rounded-xl mt-2">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">Total Payload</div>
                        <div className="text-3xl font-black">
                            {(() => {
                                // Calculate total quantity, ignore 'UN' 
                                const totalWeight = (sale.sale_items || []).reduce((acc: number, item: any) => {
                                    if (item.products?.unit !== 'UN') {
                                        return acc + item.quantity;
                                    }
                                    return acc;
                                }, 0);
                                return totalWeight > 0 ? (totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(3)} TONS` : `${totalWeight} KG`) : 'N/A';
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
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Thank You</p>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Powered by StockFlow Pro</p>
                    </div>
                )}
            </div>
        </div>
    )
}
