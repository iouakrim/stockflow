"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useTranslations, useLocale } from "next-intl"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    RefreshCcw,
    Search,
    AlertCircle,
    Package
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function MovementsClient({ activeWarehouseId }: { activeWarehouseId?: string }) {
    const supabase = createClient()
    const [movements, setMovements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const locale = useLocale()
    const t = useTranslations("Inventory")

    useEffect(() => {
        fetchMovements()
    }, [activeWarehouseId])

    const fetchMovements = async () => {
        setIsLoading(true)
        try {
            let query = supabase.from('stock_movements').select(`
                id, type, quantity, notes, created_at, reference_id,
                products:product_id (name, sku),
                profiles:created_by (full_name)
            `).order('created_at', { ascending: false }).limit(50)

            if (activeWarehouseId) {
                query = query.eq('warehouse_id', activeWarehouseId)
            }

            const { data, error } = await query
            if (error) throw error
            setMovements(data || [])
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const filteredMovements = movements.filter(m => {
        if (!searchTerm) return true
        const search = searchTerm.toLowerCase()
        const prodName = m.products?.name?.toLowerCase() || ""
        const sku = m.products?.sku?.toLowerCase() || ""
        const actionText = m.notes?.toLowerCase() || ""
        return prodName.includes(search) || sku.includes(search) || actionText.includes(search)
    })

    const getMovementIcon = (type: string) => {
        switch (type) {
            case 'in': return <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            case 'out': return <ArrowDownRight className="h-4 w-4 text-red-500" />
            case 'sale': return <Package className="h-4 w-4 text-primary" />
            case 'adjustment': return <RefreshCcw className="h-4 w-4 text-amber-500" />
            case 'return': return <AlertCircle className="h-4 w-4 text-purple-500" />
            default: return <Activity className="h-4 w-4 text-muted-foreground" />
        }
    }

    const getMovementColor = (type: string) => {
        switch (type) {
            case 'in': return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case 'out': return "bg-red-500/10 text-red-500 border-red-500/20"
            case 'sale': return "bg-primary/10 text-primary border-primary/20"
            case 'adjustment': return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            case 'return': return "bg-purple-500/10 text-purple-500 border-purple-500/20"
            default: return "bg-primary/5 text-muted-foreground border-primary/10"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-card/40 border-primary/10 rounded-2xl pl-11 pr-4 h-12 text-sm font-medium focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30 border shadow-sm uppercase font-bold text-primary"
                        placeholder={t("searchMovements")}
                    />
                </div>
                <Button variant="outline" onClick={fetchMovements} className="border-primary/10 bg-card/40 backdrop-blur rounded-2xl h-12 w-12 p-0 font-bold transition-all hover:bg-primary/5 hover:border-primary/30 active:scale-95 shadow-sm text-primary">
                    <RefreshCcw className="h-5 w-5" />
                </Button>
            </div>

            <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <Table>
                    <TableHeader className="bg-primary/[0.03]">
                        <TableRow className="border-b border-primary/5 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("auditId")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("productSku")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("type")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-center">{t("quantity")}</TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("details")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i} className="border-b border-primary/5">
                                    <TableCell colSpan={5} className="py-6 px-8">
                                        <div className="h-4 bg-primary/5 rounded animate-pulse w-full"></div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : filteredMovements.length > 0 ? (
                            filteredMovements.map((move: any) => (
                                <TableRow key={move.id} className="border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group">
                                    <TableCell className="py-4 px-8">
                                        <span className="font-mono text-[10px] text-muted-foreground bg-primary/5 px-2 py-1 flex rounded-md border border-primary/10 max-w-[80px] break-all">#{move.id.slice(0, 8)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-black text-sm uppercase tracking-tight text-foreground/90">{move.products?.name || t("deletedProduct")}</span>
                                            <span className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">{move.products?.sku || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[10px] uppercase font-black tracking-widest ${getMovementColor(move.type)}`}>
                                            {getMovementIcon(move.type)} {move.type}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`text-base font-black tracking-tighter ${move.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-muted-foreground/80 font-medium truncate max-w-[200px]">{move.notes || t("noNote")}</span>
                                            <span className="text-[9px] text-primary/40 font-black uppercase tracking-widest mt-1" suppressHydrationWarning>
                                                {new Date(move.created_at).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })} • {move.profiles?.full_name || t("system")}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center">
                                    <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">{t("noMovementsFound")}</span>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
