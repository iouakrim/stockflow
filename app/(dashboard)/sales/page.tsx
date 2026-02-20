import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

interface SaleWithCustomer {
    id: string;
    receipt_number: string;
    total: number;
    payment_method: string;
    created_at: string;
    customers: {
        name: string;
    } | { name: string }[] | null;
}
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Plus,
    Search,
    Calendar,
    MoreVertical,
    FileText,
    Receipt,
    History,
    ChevronDown,
    Download,
    CreditCard,
    Banknote
} from "lucide-react"

export default async function SalesHistoryPage() {
    const supabase = createClient()

    const { data: sales } = await supabase
        .from("sales")
        .select(`
            id,
            receipt_number,
            total,
            payment_method,
            created_at,
            customers (
                name
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

    return (
        <div className="flex-1 space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground leading-none text-balance">Transactional Ledger</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            Audited Sales History
                        </span>
                        <span className="text-muted-foreground/40 text-xs font-medium tracking-tight">Monitoring all transactions across {warehouseName}.</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        <Download className="h-4 w-4 text-primary" /> EXPORT REPORTS
                    </Button>
                    <Link href="/sales/new">
                        <Button className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="h-5 w-5 stroke-[3px]" /> NEW TRANSACTION
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filtering Intelligence */}
            <div className="flex flex-col lg:flex-row items-center justify-start gap-6 border-b border-primary/5 pb-4">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-[400px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border shadow-sm uppercase"
                            placeholder="Find receipt, customer or ID..."
                        />
                    </div>
                    <Button variant="outline" className="border-primary/10 bg-card/40 rounded-2xl h-12 px-5 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95 border">
                        <Calendar className="h-4 w-4 text-primary" /> THIS MONTH <ChevronDown className="h-3.5 w-3.5 opacity-40 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Premium Table Implementation */}
            <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <Table>
                    <TableHeader className="bg-primary/[0.03]">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">Audit ID</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Date / Time</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Client Identity</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right">Settlement</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Mechanism</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">Protocol</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">Matrix</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!sales || sales.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-28 text-muted-foreground italic opacity-50">
                                    <div className="flex flex-col items-center gap-4">
                                        <History className="h-10 w-10 opacity-20" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">Transaction Registry Empty</p>
                                            <p className="text-[10px] font-medium tracking-tight">No historical data identified in the current ledger.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sales.map((sale: SaleWithCustomer) => {
                                const customerName = Array.isArray(sale.customers)
                                    ? sale.customers[0]?.name
                                    : sale.customers?.name;
                                return (
                                    <TableRow key={sale.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                        <TableCell className="py-6 px-8 select-all">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-accent/50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/5">
                                                    <Receipt className="h-4 w-4" />
                                                </div>
                                                <span className="font-mono text-[11px] font-black tracking-tight text-muted-foreground/80 group-hover:text-foreground transition-colors uppercase">
                                                    {sale.receipt_number}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell suppressHydrationWarning>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black tracking-tighter">{new Date(sale.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5 whitespace-nowrap">
                                                    {new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/5">
                                                    {customerName ? customerName[0] : 'W'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-black tracking-tight truncate group-hover:text-primary transition-colors">{customerName || "Anonymous Walk-in"}</span>
                                                    <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-[0.1em]">Client Profile</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-base font-black tracking-tighter text-primary">
                                                    ${Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[9px] text-primary/40 font-black uppercase tracking-widest">Captured Balance</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {sale.payment_method === 'cash' ? <Banknote className="h-3.5 w-3.5 text-muted-foreground" /> : <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />}
                                                <span className="px-2 py-0.5 rounded-lg bg-accent/80 text-[10px] font-black uppercase tracking-tighter text-muted-foreground/80">
                                                    {sale.payment_method}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.15em] bg-primary/10 py-1.5 px-4 rounded-xl border border-primary/20">
                                                <div className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#11d473]" />
                                                Processed
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                                <Link href={`/receipt/${sale.id}`} target="_blank">
                                                    <Button variant="ghost" size="sm" className="h-10 gap-2 text-xs font-black uppercase text-primary hover:bg-primary/10 hover:text-primary transition-all border border-primary/10 rounded-xl px-4 shadow-sm opacity-0 group-hover:opacity-100">
                                                        <FileText className="h-4 w-4" /> RECEIPT
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:bg-accent transition-all shrink-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Ledger Index: {sales?.length || 0} Transactions Detected</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs shadow-lg shadow-primary/10">1</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
