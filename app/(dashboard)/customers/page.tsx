import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Users,
    UserPlus,
    Search,
    Download,
    Filter,
    MoreVertical,
    Wallet,
    CreditCard,
    ArrowRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default async function CustomersPage() {
    const supabase = createClient()

    const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .order("name")

    const totalOutstanding = customers?.reduce((acc, c) => acc + Number(c.credit_balance), 0) || 0
    const activeCount = customers?.length || 0
    const overdueCount = customers?.filter(c => Number(c.credit_balance) > 0).length || 0

    return (
        <div className="flex-1 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Customer Directory</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage client accounts, credit lines, and payment history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card rounded-xl text-xs font-bold gap-2 h-10">
                        <Download className="h-4 w-4" /> Export List
                    </Button>
                    <Link href="/customers/new">
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 rounded-xl gap-2 h-10">
                            <UserPlus className="h-4 w-4" /> Add New Customer
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-primary/10 bg-card/50 backdrop-blur rounded-2xl overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Outstanding Credit</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-black">${totalOutstanding.toFixed(2)}</h3>
                            <span className="text-destructive text-xs font-bold bg-destructive/10 px-2 py-0.5 rounded-full mb-1">Debt</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/50 backdrop-blur rounded-2xl overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Active Customers</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-black">{activeCount}</h3>
                            <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full mb-1">+3.2%</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-primary/10 bg-card/50 backdrop-blur rounded-2xl overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Accounts with Debt</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-black">{overdueCount}</h3>
                            <span className="text-muted-foreground text-xs font-bold bg-muted px-2 py-0.5 rounded-full mb-1">Stable</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/30 p-4 rounded-2xl border border-primary/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        className="w-full bg-accent/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Search by name, email, or phone..."
                        type="text"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
                    <Button variant="secondary" size="sm" className="rounded-full text-xs font-bold bg-primary text-primary-foreground h-8 px-4">All Customers</Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold text-muted-foreground hover:text-primary h-8 px-4">Overdue</Button>
                    <Button variant="ghost" size="sm" className="rounded-full text-xs font-bold text-muted-foreground hover:text-primary h-8 px-4">Balanced</Button>
                    <div className="w-px h-4 bg-primary/20 mx-2" />
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs font-medium border-primary/10 h-8">
                        <Filter className="h-3.5 w-3.5" /> More Filters
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-2xl border border-primary/10 bg-card/50 backdrop-blur overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-primary/5">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 pl-6">Customer Profile</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Contact Info</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Credit Balance</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4">Status</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-4 text-right pr-6">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!customers || customers.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                    No customers found.
                                    {error && <span className="block text-destructive text-sm mt-2">{error.message}</span>}
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow key={customer.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                                    <TableCell className="py-4 pl-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-accent flex items-center justify-center text-primary font-black border border-primary/10">
                                                {customer.name[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <Link href={`/customers/${customer.id}`} className="text-sm font-bold hover:text-primary transition-colors">
                                                    {customer.name}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter mt-0.5">ID: {customer.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm text-foreground/80">{customer.email || "No email"}</span>
                                            <span className="text-xs text-muted-foreground">{customer.phone || "-"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-black ${Number(customer.credit_balance) > 0 ? 'text-destructive' : 'text-primary'}`}>
                                                ${Number(customer.credit_balance).toFixed(2)}
                                            </span>
                                            {Number(customer.credit_balance) > 0 && (
                                                <span className="text-[10px] text-destructive/60 font-medium">Payment Due</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${Number(customer.credit_balance) > 0 ? 'text-destructive bg-destructive/10' : 'text-primary bg-primary/10'} py-1 px-2 rounded-lg w-fit`}>
                                            <div className={`size-1.5 rounded-full ${Number(customer.credit_balance) > 0 ? 'bg-destructive animate-pulse' : 'bg-primary'}`} />
                                            {Number(customer.credit_balance) > 0 ? 'Has Debt' : 'Clear'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/customers/${customer.id}`}>
                                                <Button variant="ghost" size="sm" className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-primary/10 h-8">
                                                    VIEW ACCOUNT <ArrowRight className="ml-1 h-3 w-3" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="px-6 py-4 bg-primary/5 border-t border-primary/5 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-bold">Showing {customers?.length || 0} of {activeCount} results</span>
                    <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-primary/10">1</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
