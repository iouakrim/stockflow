import { createClient } from "@/lib/supabase/server"
import { SalesClient } from "./SalesClient"

export default async function SalesHistoryPage() {
    const supabase = createClient()

    const { data: sales } = await supabase
        .from("sales")
        .select(`
            id,
            receipt_number,
            total,
            payment_method,
            discount,
            created_at,
            customers (
                name
            ),
            sale_items (
                quantity,
                unit_price,
                total_price,
                products (
                    name
                )
            )
        `)
        .order("created_at", { ascending: false })

    // Fetch warehouse info
    const { data: warehouse } = await supabase
        .from("warehouses")
        .select("name")
        .limit(1)
        .maybeSingle();

    const warehouseName = warehouse?.name || "System Ledger";

    return <SalesClient initialSales={sales || []} warehouseName={warehouseName} />
}
