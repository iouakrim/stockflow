import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Boxes, CircleCheckBig, MoveRight } from "lucide-react"

export default async function ReceiptPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

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
                products ( name, barcode )
            )
        `)
        .eq("id", params.id)
        .single()

    if (!sale) notFound()

    const companyName = sale.tenants?.name || "StockFlow Pro"

    return (
        <div className="bg-[#f0f0f0] text-black font-sans min-h-screen p-8 flex justify-center print:bg-white print:p-0">
            {/* Standard 80mm thermal receipt width is max 300px */}
            <div className="w-[80mm] max-w-[320px] bg-white shadow-2xl p-6 border-t-[8px] border-black receipt-container print:shadow-none print:border-none print:max-w-none print:w-[80mm]">

                {/* Header Section */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <div className="bg-black text-white p-2 rounded-lg">
                            <Boxes className="size-6" />
                        </div>
                    </div>
                    <h1 className="font-black text-xl uppercase tracking-widest mb-1">{companyName}</h1>

                    <div className="text-[10px] font-medium leading-relaxed text-gray-800 border-y border-dashed border-gray-300 py-3 mb-4 mt-4">
                        <p>123 Commerce Avenue, Block 4</p>
                        <p>Central Logistics District</p>
                        <p>Tax ID: SF-9283-441-A</p>
                    </div>
                </div>

                {/* Sub-Header / Info Section */}
                <div className="text-[11px] grid grid-cols-2 gap-y-2 mb-6 text-gray-800 font-medium">
                    <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">Issue Date</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleDateString()}</div>

                    <div className="text-gray-500 uppercase tracking-wider text-[9px] font-bold">Issue Time</div>
                    <div className="text-right" suppressHydrationWarning>{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>

                <div className="bg-gray-100 p-3 rounded-lg text-center mb-6">
                    <span className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Receipt Number</span>
                    <span className="font-mono text-sm font-black tracking-widest">{sale.receipt_number}</span>
                </div>

                {/* Items Table Section */}
                <div className="mb-6">
                    <div className="font-black text-[9px] uppercase tracking-[0.2em] border-b-2 border-black pb-2 mb-3 flex justify-between">
                        <span>Items Purchased</span>
                        <span>Amount</span>
                    </div>

                    <div className="space-y-4">
                        {(sale.sale_items || []).map((item: any) => (
                            <div key={item.id} className="text-xs">
                                <div className="font-bold text-black uppercase">{item.products?.name || "Unknown Product"}</div>
                                <div className="flex justify-between items-end mt-1 font-medium text-gray-600 border-b border-dashed border-gray-200 pb-2">
                                    <div className="text-[10px]">
                                        <span className="font-mono bg-black text-white px-1 py-0.5 rounded mr-1">
                                            {item.quantity > 100 ? `${(item.quantity / 1000).toFixed(2)} T` : `${item.quantity} KG`}
                                        </span>
                                        <span className="opacity-50">x</span> <span className="font-mono">${Number(item.unit_price).toFixed(2)}</span>
                                        {item.products?.barcode && <div className="text-[8px] text-gray-400 font-mono mt-1">#{item.products.barcode}</div>}
                                    </div>
                                    <div className="font-black text-black font-mono">
                                        ${Number(item.total_price).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="space-y-2 text-xs font-medium border-t-2 border-black pt-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-mono">${Number(sale.subtotal || sale.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Tax (Included)</span>
                        <span className="font-mono">$0.00</span>
                    </div>
                    {sale.discount > 0 && (
                        <div className="flex justify-between text-red-600">
                            <span>Discount</span>
                            <span className="font-mono">-${Number(sale.discount).toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-black pt-2 pb-1 border-b-2 border-black border-double">
                        <span className="uppercase tracking-widest text-[11px]">Grand Total</span>
                        <span className="font-mono">${Number(sale.total).toFixed(2)}</span>
                    </div>
                </div>

                {/* Footer Section */}
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
            </div>
        </div>
    )
}
