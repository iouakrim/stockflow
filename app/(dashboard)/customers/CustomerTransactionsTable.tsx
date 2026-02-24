"use client"

import { useState } from "react"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { ArrowUpCircle, ArrowDownCircle, Package, ReceiptText, ChevronRight, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SaleItem {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: {
        name: string;
        unit?: string;
    };
}

interface Transaction {
    id: string;
    created_at: string;
    receipt_number: string;
    type: 'payment' | 'sale';
    total: number;
    payment_method?: string;
    notes?: string;
    sale_items?: SaleItem[];
}

interface Labels {
    date: string;
    reference: string;
    type: string;
    amount: string;
    noActivity: string;
    paymentSettle: string;
    saleDetails: string;
    transactionTotal: string;
    items: string;
    totalAmount: string;
    paymentReceived: string;
    cash: string;
    notes: string;
    printReceipt: string;
}

import { useLocale } from "next-intl"

export function CustomerTransactionsTable({ transactions, currency, labels }: { transactions: Transaction[], currency: string, labels: Labels }) {
    const [selectedSale, setSelectedSale] = useState<Transaction | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const locale = useLocale()

    const handleRowClick = (tx: Transaction) => {
        setSelectedSale(tx)
        setIsOpen(true)
    }

    return (
        <>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-primary/5 hover:bg-transparent">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 pl-8">{labels.date}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">{labels.reference}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">{labels.type}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-5 text-right pr-8">{labels.amount}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic uppercase tracking-widest text-xs opacity-40">
                                    {labels.noActivity}
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map((tx: Transaction) => (
                                <TableRow
                                    key={tx.id}
                                    onClick={() => handleRowClick(tx)}
                                    className={`border-b border-primary/5 transition-colors group cursor-pointer hover:bg-primary/[0.03] ${tx.type === 'payment' ? 'bg-emerald-500/[0.02]' : ''}`}
                                >
                                    <TableCell className="py-5 pl-8" suppressHydrationWarning>
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded-lg flex items-center justify-center ${tx.type === 'payment' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                                {tx.type === 'payment' ? <ArrowUpCircle className="size-4" /> : <ArrowDownCircle className="size-4" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase">{new Date(tx.created_at).toLocaleDateString(locale)}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground opacity-60">{new Date(tx.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-xs font-black uppercase tracking-tighter">{tx.receipt_number}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase ${tx.type === 'payment'
                                            ? 'bg-emerald-500/10 text-emerald-600'
                                            : tx.payment_method === 'credit'
                                                ? 'bg-orange-500/10 text-orange-600'
                                                : 'bg-primary/10 text-primary'
                                            }`}>
                                            {tx.type === 'payment' ? labels.paymentSettle : tx.payment_method}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-5 text-right pr-8">
                                        <div className="flex items-center justify-end gap-3 min-w-[120px]">
                                            <div className={`text-sm font-black tracking-tighter tabular-nums ${tx.type === 'payment' ? 'text-emerald-600' : tx.payment_method === 'credit' ? 'text-orange-600' : 'text-foreground'}`}>
                                                {tx.type === 'payment' ? '+' : tx.payment_method === 'credit' ? '-' : ''}{Number(tx.total).toFixed(2)}
                                            </div>
                                            <span className="text-[10px] font-black opacity-30 w-8 text-left uppercase">{currency}</span>
                                            {tx.type === 'sale' ? (
                                                <ChevronRight className="size-4 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 ml-1" />
                                            ) : (
                                                <div className="size-4 ml-1" />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="sm:max-w-md border-primary/10 glass-card">
                    {selectedSale && (
                        <div className="h-full flex flex-col py-6">
                            <SheetHeader className="pb-6 border-b border-primary/5 space-y-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <ReceiptText className="size-6" />
                                </div>
                                <div>
                                    <SheetTitle className="text-2xl font-black uppercase tracking-tight">{selectedSale.receipt_number}</SheetTitle>
                                    <SheetDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">
                                        {labels.saleDetails} • {new Date(selectedSale.created_at).toLocaleDateString(locale)}
                                    </SheetDescription>
                                </div>
                            </SheetHeader>

                            <ScrollArea className="flex-1 my-6 pr-4">
                                <div className="space-y-4">
                                    {selectedSale.type === 'payment' ? (
                                        <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                                                    <ArrowUpCircle className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-70">{labels.paymentSettle}</p>
                                                    <p className="text-sm font-black uppercase tracking-tight">{labels.cash}</p>
                                                </div>
                                            </div>
                                            {selectedSale.notes && (
                                                <div className="pt-4 border-t border-dashed border-emerald-500/20">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{labels.notes}</p>
                                                    <p className="text-xs font-bold italic opacity-70">&quot;{selectedSale.notes}&quot;</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        selectedSale.sale_items?.map((item: SaleItem) => (
                                            <div key={item.id} className="group p-4 rounded-2xl bg-primary/[0.02] border border-primary/5 hover:border-primary/10 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{item.products?.name}</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-xs font-black tracking-tighter tabular-nums">{Number(item.total_price).toFixed(2)}</span>
                                                        <span className="text-[8px] font-black opacity-40 uppercase">{currency}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                                    <span className="flex items-center gap-1.5"><Package className="size-2.5" /> {item.quantity} {item.products?.unit?.toUpperCase() || 'UNIT'}</span>
                                                    <span>×</span>
                                                    <span className="flex items-baseline gap-0.5">
                                                        {Number(item.unit_price).toFixed(2)}
                                                        <span className="text-[7px] uppercase">{currency}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="mt-auto pt-6 border-t border-primary/5 space-y-4">
                                <div className="flex justify-between items-center text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                                    <span>{labels.transactionTotal}</span>
                                    <span>{selectedSale.sale_items?.length || 0} {labels.items}</span>
                                </div>
                                {selectedSale.type !== 'payment' && (
                                    <div className="flex justify-between items-end bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">{labels.totalAmount}</span>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-4xl font-black tracking-tighter leading-none tabular-nums">{Number(selectedSale.total).toFixed(2)}</span>
                                            <span className="text-sm font-black opacity-30 uppercase">{currency}</span>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    onClick={() => {
                                        const url = selectedSale.type === 'payment'
                                            ? `/receipt/payment/${selectedSale.id}`
                                            : `/receipt/${selectedSale.id}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="w-full h-14 rounded-2xl bg-black hover:bg-black/90 text-white font-black tracking-widest uppercase gap-3 shadow-xl shadow-black/10"
                                >
                                    <Printer className="size-5" /> {labels.printReceipt}
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
