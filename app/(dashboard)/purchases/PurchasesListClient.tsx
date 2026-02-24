"use client"

import React, { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useSettings } from "@/components/providers/SettingsProvider"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Search,
    Truck,
    Plus,
    FileText,
    ArrowUpRight,
    Package
} from "lucide-react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { toast } from "sonner"

interface PurchaseItem {
    quantity: number;
    unit_cost: number;
    total_cost: number;
    products: { name: string; sku: string } | null;
}

interface Purchase {
    id: string;
    created_at: string;
    reference_number: string | null;
    total_amount: number;
    notes: string | null;
    suppliers: { name: string } | null;
    profiles: { full_name: string } | null;
    purchase_items: PurchaseItem[];
}

export function PurchasesListClient({ warehouseId }: { warehouseId: string }) {
    const supabase = createClient()
    const locale = useLocale()
    const { currency } = useSettings()

    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    const fetchPurchases = useCallback(async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('purchases')
                .select(`
                    id, created_at, reference_number, total_amount, notes,
                    suppliers (name),
                    profiles (full_name),
                    purchase_items (
                        quantity, unit_cost, total_cost,
                        products (name, sku)
                    )
                `)
                .eq('warehouse_id', warehouseId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPurchases((data as Purchase[]) || [])
        } catch (error) {
            console.error('Error fetching purchases:', error)
            toast.error(error.message || "Impossible de charger les arrivages")
        } finally {
            setIsLoading(false)
        }
    }, [supabase, warehouseId])

    useEffect(() => {
        if (warehouseId) {
            fetchPurchases()
        }
    }, [warehouseId, fetchPurchases])

    const filteredPurchases = purchases.filter(p =>
        (p.reference_number?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (p.suppliers?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex-1 space-y-6 animate-in fade-in duration-700 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none flex items-center gap-3">
                        <Truck className="h-8 w-8 text-primary" /> Historique des Arrivages
                    </h1>
                    <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest mt-2 px-1">
                        Consulter les réceptions de marchandises
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button asChild className="bg-primary hover:bg-primary/90 text-background font-black shadow-xl shadow-primary/20 rounded-2xl gap-2 h-12 px-8 transition-all active:scale-95">
                        <Link href="/purchases/new">
                            <Plus className="h-5 w-5 stroke-[3px]" /> Nouvel Arrivage
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="bg-card/40 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-6 lg:p-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                        <Input
                            type="text"
                            placeholder="Rechercher Fournisseur ou BL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-background/50 border-primary/10 rounded-2xl pl-12 pr-4 h-14 text-sm font-bold focus:ring-1 focus:ring-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-primary/10 overflow-hidden bg-background/50">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            <TableRow className="border-b border-primary/10 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-6">ID / Date</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">Fournisseur & Réf</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">Opérateur</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-6">Total HT</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-primary/5">
                                        <TableCell colSpan={4} className="py-6 px-6">
                                            <div className="h-4 bg-primary/5 rounded animate-pulse w-full"></div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filteredPurchases.length > 0 ? (
                                filteredPurchases.map((p: Purchase) => (
                                    <React.Fragment key={p.id}>
                                        <TableRow
                                            key={p.id}
                                            className={`border-b border-primary/5 transition-colors cursor-pointer ${expandedRow === p.id ? 'bg-primary/5' : 'hover:bg-primary/[0.02]'}`}
                                            onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                                        >
                                            <TableCell className="py-5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 w-fit mb-1">
                                                        #{p.id.slice(0, 8)}
                                                    </span>
                                                    <span className="text-xs font-bold text-muted-foreground/80" suppressHydrationWarning>
                                                        {new Date(p.created_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-sm uppercase tracking-tight text-foreground/90">
                                                        {p.suppliers?.name || "Fournisseur Inconnu"}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                        <FileText className="h-3 w-3" /> {p.reference_number || "Sans Référence"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 bg-background px-3 py-1.5 rounded-xl border border-primary/5 inline-flex items-center gap-1.5">
                                                    {p.profiles?.full_name || "Système"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-black tracking-tighter text-foreground">
                                                        {currency}{Number(p.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-[9px] text-primary/50 font-black uppercase tracking-widest flex items-center gap-1 mt-1 group-hover:text-primary transition-colors">
                                                        {expandedRow === p.id ? "Masquer détails" : "Voir détails"} <ArrowUpRight className={`h-3 w-3 transition-transform ${expandedRow === p.id ? 'rotate-180' : ''}`} />
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Expanded Details Row */}
                                        {expandedRow === p.id && (
                                            <TableRow className="bg-primary/[0.02] border-b border-primary/10 hover:bg-primary/[0.02]">
                                                <TableCell colSpan={4} className="p-0">
                                                    <div className="p-6 border-l-4 border-l-primary animate-in fade-in slide-in-from-top-2">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                                            <Package className="h-4 w-4" /> Détail des articles reçus
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {p.purchase_items?.map((item: PurchaseItem, idx: number) => (
                                                                <div key={idx} className="bg-background border border-primary/10 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                                                    <div>
                                                                        <p className="font-black text-xs truncate max-w-[150px]" title={item.products?.name}>{item.products?.name}</p>
                                                                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Qté: {item.quantity} x {currency}{item.unit_cost}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-black text-primary text-sm">{currency}{item.total_cost}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {p.notes && (
                                                            <div className="mt-4 p-3 bg-background rounded-xl border border-primary/5 text-xs text-muted-foreground italic font-medium">
                                                                Note : {p.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="py-16 text-center">
                                        <Truck className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                                        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Aucun Arrivage Trouvé</p>
                                        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">Les réceptions apparaîtront ici</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
} 
