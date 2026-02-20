import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function ReceiptPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    // Fetch sale with nested items and customer
    const { data: sale } = await supabase
        .from("sales")
        .select(`
      *,
      customers ( name ),
      profiles!sales_cashier_id_fkey ( full_name ),
      sale_items (
        id, quantity, unit_price, total_price,
        products ( name, barcode )
      )
    `)
        .eq("id", params.id)
        .single()

    if (!sale) notFound()

    return (
        <div className="bg-white text-black text-sm font-sans min-h-screen p-4 flex justify-center">
            {/* 80mm width standard is typically ~300px max in standard css pixels */}
            <div
                className="w-[80mm] min-w-[300px] border p-4 shadow-sm bg-white receipt-container print:shadow-none print:border-none print:p-0"
            >
                <div className="text-center mb-6">
                    <h1 className="font-bold text-xl uppercase tracking-wider mb-1">StockFlow Pro</h1>
                    <p className="text-xs text-gray-600">Premium SaaS Store</p>
                    <p className="text-xs text-gray-600">123 Commerce St, City</p>
                    <div className="mt-4 border-b border-dashed border-gray-400 pb-2 flex justify-between text-xs">
                        <span suppressHydrationWarning>Date: {new Date(sale.created_at).toLocaleDateString()}</span>
                        <span suppressHydrationWarning>{new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="mt-2 text-xs text-left">
                        <span className="font-bold block">Receipt No:</span>
                        {sale.receipt_number}
                    </div>
                </div>

                {/* Invoice details */}
                <div className="mb-4 text-xs space-y-1 text-left">
                    {sale.customers && (
                        <div><span className="font-semibold">Customer:</span> {sale.customers.name}</div>
                    )}
                    <div><span className="font-semibold">Cashier:</span> {sale.profiles?.full_name || 'Admin'}</div>
                    <div><span className="font-semibold">Payment:</span> <span className="uppercase">{sale.payment_method.replace('_', ' ')}</span></div>
                </div>

                {/* Items Table */}
                <table className="w-full text-xs text-left border-collapse mb-4 mt-2 border-t border-b border-gray-900 border-dashed">
                    <thead>
                        <tr className="border-b border-dashed border-gray-400">
                            <th className="py-2">Item</th>
                            <th className="py-2 text-center">Qty</th>
                            <th className="py-2 text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(sale.sale_items || []).map((item: { id: string, products: { name: string, barcode: string }, quantity: number, total_price: number }) => (
                            <tr key={item.id}>
                                <td className="py-2 break-all pr-2 truncate max-w-[120px]">
                                    {item.products.name}
                                    <div className="text-[10px] text-gray-500 mt-0.5">{item.products.barcode}</div>
                                </td>
                                <td className="py-2 text-center whitespace-nowrap">{item.quantity}</td>
                                <td className="py-2 text-right whitespace-nowrap">${item.total_price.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="space-y-1 mb-8 text-sm text-right flex flex-col items-end">
                    <div className="flex justify-between w-full font-bold text-base mt-2 pt-2 border-t border-dashed border-gray-900">
                        <span>TOTAL</span>
                        <span>${sale.total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="text-center text-xs mt-8 pb-4">
                    <p className="font-bold mb-1">Thank you for your business!</p>
                    <p className="text-gray-500 text-[10px]">Powered by StockFlow Pro</p>
                </div>
            </div>
        </div>
    )
}
