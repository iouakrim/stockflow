"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Plus,
    Search,
    FileText,
    Receipt,
    History,
    CreditCard,
    Banknote,
    Truck,
    Info,
    Package
} from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"

interface SaleWithCustomer {
    id: string;
    receipt_number: string;
    total: number;
    payment_method: string;
    discount?: number;
    created_at: string;
    customers: {
        name: string;
    } | { name: string }[] | null;
    sale_items?: {
        quantity: number;
        unit_price: number;
        total_price: number;
        products: {
            name: string;
        } | { name: string }[] | null;
    }[];
}

import { useLocale } from "next-intl"

interface SalesClientProps {
    initialSales: SaleWithCustomer[];
    warehouseName: string;
}

export function SalesClient({ initialSales, warehouseName }: SalesClientProps) {
    const t = useTranslations("Ledger")
    const { currency } = useSettings()
    const locale = useLocale()

    const [searchTerm, setSearchTerm] = useState("")
    const [timeFilter, setTimeFilter] = useState("all") // 'all', 'today', 'month'
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 15

    const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null)
    const [previewDetailsSale, setPreviewDetailsSale] = useState<SaleWithCustomer | null>(null)
    const [previewReceiptTitle, setPreviewReceiptTitle] = useState<string>("")

    const filteredSales = useMemo(() => {
        let filtered = initialSales

        // Time Filtering
        const now = new Date()
        if (timeFilter === 'today') {
            filtered = filtered.filter(s => {
                const d = new Date(s.created_at)
                return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })
        } else if (timeFilter === 'month') {
            filtered = filtered.filter(s => {
                const d = new Date(s.created_at)
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
            })
        }

        // Search Filtering
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase()
            filtered = filtered.filter(s => {
                const customerName = (Array.isArray(s.customers) ? s.customers[0]?.name : s.customers?.name) || t("anonymous")
                return (
                    s.receipt_number.toLowerCase().includes(lowerSearch) ||
                    customerName.toLowerCase().includes(lowerSearch) ||
                    s.payment_method.toLowerCase().includes(lowerSearch) ||
                    s.id.toLowerCase().includes(lowerSearch) ||
                    s.total.toString().includes(lowerSearch)
                )
            })
        }

        return filtered
    }, [initialSales, searchTerm, timeFilter, t])

    const totalPages = Math.ceil(filteredSales.length / itemsPerPage)
    const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none text-balance">
                        {t("transactionalLedger")}
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2 flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-primary/40" />
                        {warehouseName}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button asChild variant="outline" className="border-primary/20 bg-primary/5 backdrop-blur rounded-2xl h-12 px-6 font-black tracking-widest text-xs gap-2 transition-all hover:bg-primary/10 active:scale-95 text-primary shadow-sm uppercase">
                        <Link href="/sales/reports">
                            <FileText className="h-4 w-4" /> {t("dailyZReport")}
                        </Link>
                    </Button>
                    <Button asChild className="bg-primary hover:bg-primary/90 text-[#102219] font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        <Link href="/sales/new">
                            <Plus className="h-5 w-5 stroke-[3px]" /> {t("newTransaction")}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Filtering Intelligence */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-primary/5 pb-2">
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-[400px] group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value)
                                setCurrentPage(1)
                            }}
                            className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 h-12 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border shadow-sm uppercase font-bold text-primary"
                            placeholder={t("searchPlaceholder")}
                        />
                    </div>
                    {/* Time Filters */}
                    <div className="flex bg-card/40 p-1 rounded-2xl border border-primary/5">
                        <button
                            onClick={() => { setTimeFilter('all'); setCurrentPage(1); }}
                            className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'all' ? 'bg-primary text-background shadow-md' : 'text-muted-foreground hover:text-primary'}`}
                        >
                            {t("all")}
                        </button>
                        <button
                            onClick={() => { setTimeFilter('today'); setCurrentPage(1); }}
                            className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'today' ? 'bg-primary text-background shadow-md' : 'text-muted-foreground hover:text-primary'}`}
                        >
                            {t("today")}
                        </button>
                        <button
                            onClick={() => { setTimeFilter('month'); setCurrentPage(1); }}
                            className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === 'month' ? 'bg-primary text-background shadow-md' : 'text-muted-foreground hover:text-primary'}`}
                        >
                            {t("thisMonth")}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50 px-4">
                    {filteredSales.length} {t("transactionsFound")}
                </div>
            </div>

            {/* Premium Table Implementation */}
            <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <Table>
                    <TableHeader className="bg-primary/[0.03]">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("auditId")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("dateTime")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("clientIdentity")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right flex-1">{t("settlement")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">{t("mechanism")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">{t("protocol")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("matrix")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(!paginatedSales || paginatedSales.length === 0) ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-28 text-muted-foreground italic opacity-50">
                                    <div className="flex flex-col items-center gap-4">
                                        <History className="h-10 w-10 opacity-20" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-black uppercase tracking-[0.2em]">{t("emptyRegistry")}</p>
                                            <p className="text-[10px] font-medium tracking-tight">{t("noHistoricalData")}</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedSales.map((sale: SaleWithCustomer) => {
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
                                                <span className="text-sm font-black tracking-tighter" suppressHydrationWarning>{new Date(sale.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mt-0.5 whitespace-nowrap" suppressHydrationWarning>
                                                    {new Date(sale.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/5 shrink-0">
                                                    {customerName ? customerName[0] : 'W'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-black tracking-tight truncate group-hover:text-primary transition-colors">{customerName || t("anonymous")}</span>
                                                    <span className="text-[10px] text-muted-foreground/50 font-medium uppercase tracking-[0.1em]">{t("clientProfile")}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-base font-black tracking-tighter text-primary">
                                                    <span suppressHydrationWarning>{Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> <span className="text-[10px] ml-1 opacity-50">{currency}</span>
                                                </span>
                                                {sale.discount && sale.discount > 0 ? (
                                                    <span className="text-[9px] text-red-500/80 font-black uppercase tracking-widest flex items-center gap-1">
                                                        -{sale.discount.toFixed(2)} <span className="text-[8px] opacity-70">{currency}</span> ({t("discount")})
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] text-primary/40 font-black uppercase tracking-widest">{t("capturedBalance")}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-accent/80 border border-primary/5">
                                                {sale.payment_method === 'cash' ? <Banknote className="h-3.5 w-3.5 text-emerald-600" /> : <CreditCard className="h-3.5 w-3.5 text-blue-600" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    {t(sale.payment_method)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center justify-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.15em] bg-primary/10 py-1.5 px-3 rounded-xl border border-primary/20">
                                                <div className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                                                {t("processed")}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={t("pickupPreview")}
                                                    className="size-9 rounded-xl text-primary hover:bg-primary/10 hover:text-primary transition-all shrink-0 border border-primary/20 bg-primary/5"
                                                    onClick={() => {
                                                        setPreviewReceiptUrl(`/receipt/${sale.id}?type=pickup`)
                                                        setPreviewReceiptTitle(t("pickupPreview"))
                                                    }}
                                                >
                                                    <Truck className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={t("receiptPreview")}
                                                    className="size-9 rounded-xl text-primary hover:bg-primary/10 hover:text-primary transition-all shrink-0 border border-primary/10 bg-primary/5"
                                                    onClick={() => {
                                                        setPreviewReceiptUrl(`/receipt/${sale.id}`)
                                                        setPreviewReceiptTitle(t("receiptPreview"))
                                                    }}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title={t("viewFullDetails")}
                                                    className="size-9 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all shrink-0 border border-transparent"
                                                    onClick={() => {
                                                        setPreviewDetailsSale(sale)
                                                        setPreviewReceiptTitle(t("detailsPreview"))
                                                    }}
                                                >
                                                    <Info className="h-4 w-4" />
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
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                        {t("ledgerIndex", { currentPage, totalPages: totalPages || 1 })}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`h-9 w-9 p-0 rounded-xl font-black text-xs shadow-sm transition-all ${currentPage === i + 1 ? 'border-primary/50 bg-primary text-background' : 'border-primary/10 bg-card hover:bg-primary/5 hover:text-primary text-muted-foreground'}`}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Details & Preview Sheet */}
            <Sheet open={!!previewReceiptUrl || !!previewDetailsSale} onOpenChange={(open) => {
                if (!open) {
                    setPreviewReceiptUrl(null)
                    setPreviewDetailsSale(null)
                }
            }}>
                <SheetContent side="right" className="w-[450px] sm:w-[500px] border-l-primary/10 bg-background/95 backdrop-blur-xl p-0 flex flex-col shadow-2xl">
                    <SheetHeader className="p-6 border-b border-primary/10 bg-card/50">
                        <SheetTitle className="text-lg font-black tracking-tighter uppercase text-primary">
                            {previewReceiptTitle}
                        </SheetTitle>
                        <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">
                            {previewReceiptUrl ? t("previewMode") : t("detailedDataView")}
                        </p>

                        {previewReceiptUrl && (
                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={() => {
                                        if (previewReceiptUrl) {
                                            const printUrl = previewReceiptUrl.includes('?') ? `${previewReceiptUrl}&print=true` : `${previewReceiptUrl}?print=true`;
                                            window.open(printUrl, '_blank')
                                        }
                                    }}
                                    className="flex-1 h-12 bg-primary text-background font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 rounded-2xl"
                                >
                                    {t("printNow")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (previewReceiptUrl) window.open(previewReceiptUrl, '_blank')
                                    }}
                                    className="flex-1 h-12 border-primary/20 hover:bg-primary/5 font-black uppercase tracking-[0.2em] text-primary transition-all active:scale-95 rounded-2xl shadow-sm"
                                >
                                    {t("viewFull")}
                                </Button>
                            </div>
                        )}

                        {previewDetailsSale && (
                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={() => {
                                        setPreviewDetailsSale(null)
                                        setPreviewReceiptUrl(`/receipt/${previewDetailsSale.id}`)
                                        setPreviewReceiptTitle(t("receiptPreview"))
                                    }}
                                    className="flex-1 h-12 bg-primary text-background font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 rounded-2xl"
                                >
                                    <FileText className="h-4 w-4 mr-2" /> {t("receipt")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setPreviewDetailsSale(null)
                                        setPreviewReceiptUrl(`/receipt/${previewDetailsSale.id}?type=pickup`)
                                        setPreviewReceiptTitle(t("pickupPreview"))
                                    }}
                                    className="flex-1 h-12 border-primary/20 hover:bg-primary/5 font-black uppercase tracking-[0.2em] text-emerald-600 border-emerald-500/20 bg-emerald-500/5 transition-all active:scale-95 rounded-2xl shadow-sm"
                                >
                                    <Truck className="h-4 w-4 mr-2" /> {t("pickupTicket")}
                                </Button>
                            </div>
                        )}
                    </SheetHeader>

                    <div className="flex-1 w-full relative overflow-y-auto custom-scrollbar">
                        {previewReceiptUrl && (
                            <iframe
                                src={previewReceiptUrl}
                                className="absolute inset-0 w-full h-full border-0 bg-accent/30"
                                title="Receipt Preview"
                            />
                        )}
                        {previewDetailsSale && (
                            <div className="p-6 space-y-8 animate-in mt-2 fade-in slide-in-from-bottom-4 duration-500">
                                {/* Details Header Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-primary/[0.03] border-primary/10 border p-4 rounded-3xl flex flex-col gap-1 items-center justify-center text-center">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{t("totalValue")}</span>
                                        <span className="text-2xl font-black tracking-tighter text-primary">
                                            <span suppressHydrationWarning>{Number(previewDetailsSale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> <span className="text-sm ml-1 opacity-50">{currency}</span>
                                        </span>
                                    </div>
                                    <div className="bg-primary/[0.03] border-primary/10 border p-4 rounded-3xl flex flex-col gap-1 items-center justify-center text-center">
                                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{t("status")}</span>
                                        <div className="inline-flex items-center justify-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.15em] bg-primary/10 py-1.5 px-3 rounded-xl border border-primary/20 mt-1">
                                            <div className="size-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
                                            {t("processed")}
                                        </div>
                                    </div>
                                </div>

                                {/* Client Info */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/50">{t("clientIdentity")}</h3>
                                    <div className="flex items-center gap-3 bg-card p-4 rounded-2xl border border-primary/5 shadow-sm">
                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm border border-primary/5 shrink-0">
                                            {(Array.isArray(previewDetailsSale.customers) ? previewDetailsSale.customers[0]?.name : previewDetailsSale.customers?.name)?.[0] || 'W'}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-base font-black tracking-tight truncate">
                                                {(Array.isArray(previewDetailsSale.customers) ? previewDetailsSale.customers[0]?.name : previewDetailsSale.customers?.name) || t("anonymous")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment & Timing Info */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/50">{t("metaInformation")}</h3>
                                    <ul className="bg-card p-5 rounded-3xl border border-primary/5 shadow-sm space-y-4">
                                        <li className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-muted-foreground uppercase text-[10px] tracking-widest">{t("receiptNo")}</span>
                                            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/10">{previewDetailsSale.receipt_number}</span>
                                        </li>
                                        <li className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-muted-foreground uppercase text-[10px] tracking-widest">{t("paymentMethod")}</span>
                                            <span className="uppercase">{t(previewDetailsSale.payment_method)}</span>
                                        </li>
                                        {previewDetailsSale.discount ? (
                                            <li className="flex justify-between items-center text-sm font-bold">
                                                <span className="text-muted-foreground uppercase text-[10px] tracking-widest">{t("discountApplied")}</span>
                                                <span className="text-red-500 uppercase">-{previewDetailsSale.discount.toFixed(2)} <span className="text-[10px] ml-0.5 opacity-50">{currency}</span></span>
                                            </li>
                                        ) : null}
                                        <li className="flex justify-between items-center text-sm font-bold">
                                            <span className="text-muted-foreground uppercase text-[10px] tracking-widest">{t("dateProcessed")}</span>
                                            <span suppressHydrationWarning>
                                                {new Date(previewDetailsSale.created_at).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 pb-8">
                                    <h3 className="text-[10px] font-black tracking-widest uppercase text-muted-foreground/50">{t("purchasedItems")}</h3>
                                    <div className="bg-card rounded-3xl border border-primary/5 shadow-sm divide-y divide-primary/5 overflow-hidden">
                                        {previewDetailsSale.sale_items && previewDetailsSale.sale_items.length > 0 ? (
                                            previewDetailsSale.sale_items.map((item, idx) => {
                                                const productName = Array.isArray(item.products) ? item.products[0]?.name : item.products?.name;
                                                return (
                                                    <div key={idx} className="p-4 flex gap-3 items-center hover:bg-primary/[0.02] transition-colors">
                                                        <div className="size-10 rounded-xl bg-accent/50 flex items-center justify-center shrink-0 border border-primary/5">
                                                            <Package className="h-5 w-5 text-muted-foreground/50" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                            <span className="font-black text-sm uppercase tracking-tight truncate">
                                                                {productName || t("unknownProduct")}
                                                            </span>
                                                            <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase" suppressHydrationWarning>
                                                                {item.quantity} × {Number(item.unit_price).toFixed(2)} <span className="text-[8px] ml-0.5 opacity-50">{currency}</span>
                                                            </span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="font-black text-primary" suppressHydrationWarning>{Number(item.total_price).toFixed(2)} <span className="text-[10px] ml-1 opacity-50">{currency}</span></span>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="p-8 text-center text-muted-foreground text-xs uppercase font-black tracking-widest opacity-50">
                                                {t("noItemsLogged")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
