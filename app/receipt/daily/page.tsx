import { createClient, getTenantSettings } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { FileSpreadsheet } from "lucide-react"
import { PrintActions } from "../[id]/PrintActions"

// Ensure route is completely dynamic because it depends on current time
export const dynamic = "force-dynamic"

export default async function DailyReceiptPage() {
    const supabase = createClient()
    const { currency } = await getTenantSettings()

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    // Fetch warehouse info
    const { data: warehouse } = await supabase
        .from("warehouses")
        .select("name")
        .limit(1)
        .maybeSingle()

    const t = await getTranslations("Receipt")

    const companyName = warehouse?.name || "StockFlow Pro"

    // Fetch today's sales with nested items
    const { data: sales } = await supabase
        .from("sales")
        .select(`
            id,
            receipt_number,
            total,
            payment_method,
            discount,
            created_at,
            sale_items (
                quantity, 
                unit_price, 
                total_price,
                products ( name, unit )
            )
        `)
        .gte("created_at", startOfDay)
        .lt("created_at", endOfDay)
        .order("created_at", { ascending: true })

    // Aggregations
    let totalRevenue = 0
    let totalDiscounts = 0
    let cashTotal = 0
    let cardTotal = 0

    // Total sold products
    const productTotals: Record<string, { quantity: number, total: number, unit: string }> = {}

    if (sales) {
        for (const sale of sales) {
            totalRevenue += Number(sale.total)
            if (sale.discount) totalDiscounts += Number(sale.discount)

            if (sale.payment_method === 'cash') cashTotal += Number(sale.total)
            else if (sale.payment_method === 'card') cardTotal += Number(sale.total)

            if (sale.sale_items) {
                for (const item of sale.sale_items) {
                    // Extract product data safely
                    const productName = Array.isArray(item.products)
                        ? item.products[0]?.name
                        : item.products?.name || t("unknownProduct")
                    const productUnit = Array.isArray(item.products)
                        ? item.products[0]?.unit
                        : item.products?.unit || "UN"

                    if (!productTotals[productName]) {
                        productTotals[productName] = { quantity: 0, total: 0, unit: productUnit }
                    }
                    productTotals[productName].quantity += Number(item.quantity)
                    productTotals[productName].total += Number(item.total_price)
                }
            }
        }
    }

    const sortedProducts = Object.entries(productTotals).sort((a, b) => b[1].total - a[1].total)

    return (
        <div className="bg-[#f0f0f0] text-black font-sans min-h-screen p-8 flex justify-center print:bg-white print:p-0">
            <PrintActions />

            <div className="w-[80mm] max-w-[320px] bg-white shadow-2xl px-4 py-6 border-t-[8px] border-black receipt-container print:shadow-none print:border-none print:max-w-none print:w-[80mm] print:px-2 print:py-4">

                {/* Header Section */}
                <div className="text-center mb-3">
                    <div className="flex justify-center mb-2">
                        <div className="bg-black text-white p-1.5 rounded-lg">
                            <FileSpreadsheet className="size-5" />
                        </div>
                    </div>
                    <h1 className="font-black text-lg uppercase tracking-widest leading-none">
                        {t("zReport")}
                    </h1>
                    <h2 className="font-bold text-xs uppercase tracking-widest mt-1 text-gray-500">
                        {companyName}
                    </h2>

                    <div className="text-[9px] font-medium leading-tight text-gray-800 border-y border-dashed border-gray-300 py-1.5 mb-2 mt-2 bg-gray-50 uppercase tracking-widest">
                        <p>{t("endOfDayTotals")}</p>
                    </div>
                </div>

                {/* Info Section */}
                <div className="text-[10px] grid grid-cols-2 gap-y-1 mb-3 text-gray-800 font-medium">
                    <div className="text-gray-500 uppercase tracking-wider text-[8px] font-bold">{t("date")}</div>
                    <div className="text-right" suppressHydrationWarning>{now.toLocaleDateString()}</div>

                    <div className="text-gray-500 uppercase tracking-wider text-[8px] font-bold">{t("time")}</div>
                    <div className="text-right" suppressHydrationWarning>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>

                    <div className="text-gray-500 uppercase tracking-wider text-[8px] font-bold">{t("transactions")}</div>
                    <div className="text-right font-mono font-black">{sales?.length || 0}</div>
                </div>

                {/* Summary Table */}
                <div className="mb-3">
                    <div className="font-black text-[9px] uppercase tracking-[0.2em] border-b-2 border-black pb-1 mb-2">
                        {t("financialSummary")}
                    </div>

                    <div className="space-y-1 pb-2 border-b border-dashed border-gray-300">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold uppercase text-gray-800 text-[10px]">{t("totalRevenue")}</span>
                            <span className="font-mono font-black">{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[9px] opacity-70 ml-0.5">{currency}</span></span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="font-medium uppercase text-gray-600 pl-1 border-l border-gray-300">{t("totalCash")}</span>
                            <span className="font-mono font-bold">{cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[8px] opacity-70 ml-0.5">{currency}</span></span>
                        </div>
                        <div className="flex justify-between items-center text-[9px]">
                            <span className="font-medium uppercase text-gray-600 pl-1 border-l border-gray-300">{t("totalCard")}</span>
                            <span className="font-mono font-bold">{cardTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[8px] opacity-70 ml-0.5">{currency}</span></span>
                        </div>
                        {totalDiscounts > 0 && (
                            <div className="flex justify-between items-center text-[9px] mt-1 text-black">
                                <span className="font-bold uppercase tracking-wider pl-1 py-0.5 border-l border-black">
                                    {t("discounts")}
                                </span>
                                <span className="font-mono font-bold">-{totalDiscounts.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[8px] opacity-70 ml-0.5">{currency}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Sold Breakdown */}
                <div className="mb-4">
                    <div className="font-black text-[8px] uppercase tracking-[0.2em] border-b-2 border-black pb-1 mb-1.5 flex justify-between">
                        <span>{t("itemsSold")}</span>
                        <span>{t("totalQty")}</span>
                    </div>

                    {sortedProducts.length === 0 ? (
                        <div className="text-center text-[9px] font-medium text-gray-400 py-2 italic uppercase tracking-widest">
                            {t("noSalesRecorded")}
                        </div>
                    ) : (
                        <div className="space-y-0.5 mt-1">
                            {sortedProducts.map(([name, data]) => (
                                <div key={name} className="flex justify-between items-start text-[9px] border-b border-dashed border-gray-200 pb-0.5 pt-0.5">
                                    <div className="font-bold uppercase flex-1 pr-2 line-clamp-1 leading-tight">
                                        {name}
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="font-mono font-bold text-gray-500 text-[8px]">
                                            {data.quantity > 500 && data.unit !== 'UN' ? `${(data.quantity / 1000).toFixed(2)} ${t("tons")}` : `${data.quantity} ${data.unit === 'UN' ? t("units") : t("kilograms")}`}
                                        </div>
                                        <div className="font-mono font-bold w-[45px] text-right">{data.total.toLocaleString(undefined, { minimumFractionDigits: 0 })} <span className="text-[7px] opacity-70 ml-0.5">{currency}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="mt-4 text-center">
                    <p className="font-black tracking-[0.2em] text-[8px] uppercase">{t("endOfDayAudit")}</p>
                    <div className="flex justify-center mt-2">
                        <svg className="w-20 h-8 opacity-90" viewBox="0 0 100 40">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <rect
                                    key={i}
                                    x={i * 3 + (Math.random() > 0.5 ? 1 : 0)}
                                    y={0}
                                    width={Math.random() > 0.5 ? 2 : 1.5}
                                    height={40}
                                    fill="black"
                                />
                            ))}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
