import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"
import { Customer } from "@/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    UserPlus,
    Search,
    Download,
    MoreVertical,
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

    const t = await getTranslations("Customers")

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">{t("title")}</h1>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 px-6 font-bold text-xs gap-2 transition-all hover:bg-primary/5 active:scale-95">
                        <Download className="h-4 w-4 text-primary" /> {t("exportList")}
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Link href="/customers/new">
                            <UserPlus className="h-5 w-5 stroke-[3px]" /> {t("newRecord")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7">
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("totalOutstandingCredit")}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-black tracking-tighter" suppressHydrationWarning>${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                            <span className="text-destructive text-[9px] font-black uppercase tracking-widest bg-destructive/10 px-2 py-0.5 rounded-full mb-1 border border-destructive/20">{t("liability")}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7">
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("activeCustomers")}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-black tracking-tighter">{activeCount}</h3>
                            <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full mb-1 border border-primary/20">{t("verified")}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card group hover:scale-[1.02] transition-all duration-300">
                    <CardContent className="p-7">
                        <p className="text-muted-foreground/60 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{t("accountsWithDebt")}</p>
                        <div className="flex items-end gap-3">
                            <h3 className="text-3xl font-black tracking-tighter">{overdueCount}</h3>
                            <span className="text-amber-500 text-[9px] font-black uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full mb-1 border border-amber-500/20">{t("monitoring")}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar w-full lg:w-auto">
                    <Button variant="secondary" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black bg-primary text-background uppercase tracking-widest shadow-lg shadow-primary/20">{t("allDirectory")}</Button>
                    <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("debtorsOnly")}</Button>
                    <Button variant="ghost" size="sm" className="rounded-2xl h-10 px-6 text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all">{t("vipAccounts")}</Button>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border"
                            placeholder={t("search")}
                        />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <Table>
                    <TableHeader className="bg-primary/[0.03]">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("clientEntity")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("communicationNodes")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right">{t("settlementIndex")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">{t("protocol")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("matrix")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!customers || customers.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground italic">
                                    {t("noCustomers")}
                                    {error && <span className="block text-destructive text-sm mt-2">{error.message}</span>}
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer: Customer) => (
                                <TableRow key={customer.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                    <TableCell className="py-6 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all border border-primary/10 shadow-sm font-black text-sm uppercase">
                                                {customer.name[0]}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <Link href={`/customers/${customer.id}`} className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                                                    {customer.name}
                                                </Link>
                                                <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-tighter">ID: {customer.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col min-w-[200px]">
                                            <span className="text-sm font-black tracking-tighter">{customer.email || "---"}</span>
                                            <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5">{customer.phone || t("protocol")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-4">
                                        <div className="flex flex-col">
                                            <span className={`text-base font-black tracking-tighter ${Number(customer.credit_balance) > 0 ? 'text-destructive' : 'text-primary'}`} suppressHydrationWarning>
                                                ${Number(customer.credit_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5">{t("capturedBalance")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] ${Number(customer.credit_balance) > 0 ? 'text-destructive bg-destructive/10 border-destructive/20' : 'text-primary bg-primary/10 border-primary/20'} py-1.5 px-3 rounded-xl border`}>
                                            <div className={`size-1.5 rounded-full ${Number(customer.credit_balance) > 0 ? 'bg-destructive animate-pulse' : 'bg-primary'}`} />
                                            {Number(customer.credit_balance) > 0 ? t("outstanding") : t("cleared")}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex items-center justify-end gap-3 translate-x-1 group-hover:translate-x-0 transition-transform">
                                            <Button asChild variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20 border border-primary/10">
                                                <Link href={`/customers/${customer.id}`}>
                                                    {t("ledger")} <ArrowRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-10 rounded-xl text-muted-foreground hover:bg-accent transition-all shrink-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="px-8 py-5 border-t border-primary/5 bg-primary/[0.02] flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">{t("directoryMatrix", { count: customers?.length || 0 })}</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs shadow-lg shadow-primary/10">1</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
