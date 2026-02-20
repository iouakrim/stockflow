import { createClient } from "@/lib/supabase/server"

interface Payment {
    id: string;
    amount: number;
    payment_method: string;
    notes: string | null;
    created_at: string;
}
import { notFound } from "next/navigation"
import { CustomerPaymentForm } from "@/components/customers/CustomerPaymentForm"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    History,
    CheckCircle2
} from "lucide-react"

export default async function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    // Fetch customer details
    const { data: customer } = await supabase
        .from("customers")
        .select("*")
        .eq("id", params.id)
        .single()

    if (!customer) notFound()

    // Fetch payment history
    const { data: payments } = await supabase
        .from("credit_payments")
        .select("*")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })

    const hasDebt = Number(customer.credit_balance) > 0

    return (
        <div className="flex-1 space-y-8 max-w-6xl mx-auto">
            {/* Header & Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/customers">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-black tracking-tight">{customer.name}</h1>
                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${hasDebt ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                                {hasDebt ? 'Has Debt' : 'Clear Account'}
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-bold">Customer ID: {customer.id.slice(0, 8)}</p>
                    </div>
                </div>

                <Card className="border-primary/10 bg-card/50 backdrop-blur rounded-2xl overflow-hidden shadow-lg shadow-primary/5 min-w-[240px]">
                    <CardContent className="p-6 text-right">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Outstanding Balance</p>
                        <h3 className={`text-3xl font-black ${hasDebt ? 'text-destructive' : 'text-primary'}`}>
                            ${Number(customer.credit_balance).toFixed(2)}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Profile */}
                <Card className="lg:col-span-1 border-primary/10 bg-card/40 backdrop-blur rounded-3xl overflow-hidden shadow-sm">
                    <CardHeader className="border-b border-primary/5 pb-4">
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" /> Profile Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-start gap-4 transition-colors group">
                            <div className="size-10 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Email Address</p>
                                <p className="text-sm font-bold truncate">{customer.email || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 transition-colors group">
                            <div className="size-10 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Phone Number</p>
                                <p className="text-sm font-bold truncate">{customer.phone || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 transition-colors group">
                            <div className="size-10 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Full Address</p>
                                <p className="text-sm font-bold leading-relaxed">{customer.address || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Middle/Right Column: Payment Actions & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Payment Form Segment */}
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {hasDebt ? (
                            <CustomerPaymentForm customer={customer} />
                        ) : (
                            <Card className="bg-primary/5 border-primary/10 border-dashed rounded-3xl">
                                <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                                    <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <CheckCircle2 className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-lg font-black uppercase tracking-tight">Account is balanced</h4>
                                        <p className="text-sm text-muted-foreground">No outstanding debt for this customer at this moment.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* History Table */}
                    <Card className="border-primary/10 bg-card/40 backdrop-blur rounded-3xl overflow-hidden shadow-sm">
                        <CardHeader className="border-b border-primary/5 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <History className="h-5 w-5 text-primary" /> Payment History
                                </CardTitle>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{payments?.length || 0} Transactions</span>
                            </div>
                        </CardHeader>
                        <Table>
                            <TableHeader className="bg-primary/5 hover:bg-transparent">
                                <TableRow className="border-b border-primary/5 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 pl-6">Date</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Amount</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Method</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right pr-6">Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!payments || payments.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                                            No payment history recorded.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.map((p: Payment) => (
                                        <TableRow key={p.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                                            <TableCell className="py-4 pl-6 text-xs font-bold text-muted-foreground uppercase" suppressHydrationWarning>
                                                {new Date(p.created_at).toLocaleDateString()}
                                                <span className="block text-[10px] font-normal lowercase tracking-normal mt-0.5 opacity-60" suppressHydrationWarning>
                                                    {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-black text-primary text-sm">${Number(p.amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-accent font-black uppercase tracking-tighter">
                                                    {p.payment_method.replace("_", " ")}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 text-xs text-muted-foreground italic">{p.notes || "-"}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    )
}
