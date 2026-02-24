"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Trash2,
    Zap,
    CheckCircle2,
    XCircle,
    Loader2,
    RefreshCw,
    AlertCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Supplier { id: string; name: string }

interface DraftRow {
    _id: string
    name: string
    category: string
    unit: string
    cost_price: string
    selling_price: string
    supplier_id: string
}

interface ImportResult {
    success: number
    errors: { row: number; reason: string }[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
    "Aliments Volailles", "Aliments Bovins", "Aliments Ovins",
    "Aliments Caprins", "Aliments Équins", "Aliments Lapins",
    "Aliments Porcins", "Compléments Minéraux", "Vitamines & Additifs",
    "Produits Vétérinaires", "Emballages & Accessoires", "Autres",
]

const UNITS = [
    { value: "KG", label: "KG — Kilogramme" },
    { value: "UN", label: "UN — Unité" },
    { value: "L", label: "L — Litre" },
    { value: "M", label: "M — Mètre" },
]

const DRAFT_KEY = "stockflow_bulk_draft"

const emptyRow = (): DraftRow => ({
    _id: crypto.randomUUID(),
    name: "",
    category: "",
    unit: "KG",
    cost_price: "",
    selling_price: "",
    supplier_id: "",
})

const createRows = (n: number): DraftRow[] => Array.from({ length: n }, emptyRow)

// ─── Row validation ───────────────────────────────────────────────────────────
// (Moved inside component to access translations)

function isRowEmpty(row: DraftRow) {
    return !row.name.trim() && !row.cost_price && !row.selling_price
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BulkEntryClient({
    tenantId,
    suppliers,
}: {
    tenantId: string
    suppliers: Supplier[]
}) {
    const t = useTranslations("BulkImport")
    const router = useRouter()
    const supabase = createClient()
    const [rows, setRows] = useState<DraftRow[]>(() => createRows(8))
    const [isImporting, setIsImporting] = useState(false)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [draftRestored, setDraftRestored] = useState(false)
    const tableRef = useRef<HTMLTableElement>(null)

    // ── Row validation (moved inside to use 't') ──────────────────────────────
    const getRowErrors = useCallback((row: DraftRow) => {
        const errors: Record<string, string> = {}
        if (!row.name.trim() || row.name.trim().length < 2) errors.name = t("validation.nameRequired")
        if (row.cost_price !== "" && isNaN(parseFloat(row.cost_price))) errors.cost_price = t("validation.invalidNumber")
        if (parseFloat(row.cost_price) < 0) errors.cost_price = t("validation.positiveNumber")
        if (row.selling_price !== "" && isNaN(parseFloat(row.selling_price))) errors.selling_price = t("validation.invalidNumber")
        if (parseFloat(row.selling_price) < 0) errors.selling_price = t("validation.positiveNumber")
        if (!row.unit) errors.unit = t("validation.required")
        return errors
    }, [t])

    // Restore draft from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY)
            if (saved) {
                const parsed: DraftRow[] = JSON.parse(saved)
                if (parsed.length > 0) {
                    setRows(parsed)
                    setDraftRestored(true)
                }
            }
        } catch { /* ignore */ }
    }, [])

    // Auto-save draft
    useEffect(() => {
        const hasContent = rows.some(r => !isRowEmpty(r))
        if (hasContent) {
            try { localStorage.setItem(DRAFT_KEY, JSON.stringify(rows)) }
            catch { /* ignore */ }
        }
    }, [rows])

    // ── Row operations ──────────────────────────────────────────────────────

    const addRows = (n: number) => setRows(prev => [...prev, ...createRows(n)])

    const removeRow = (id: string) =>
        setRows(prev => prev.length > 1 ? prev.filter(r => r._id !== id) : prev)

    const clearAll = () => {
        setRows(createRows(8))
        setResult(null)
        try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
    }

    const updateCell = useCallback((id: string, field: keyof DraftRow, value: string) => {
        setRows(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r))
    }, [])

    // ── Keyboard navigation ────────────────────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>, rowIdx: number, colIdx: number) => {
        const COLS = 6
        if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault()
            const nextCol = colIdx + 1
            const nextRow = rowIdx + (nextCol >= COLS ? 1 : 0)
            const nextColIdx = nextCol % COLS
            if (nextRow >= rows.length) addRows(1)
            requestAnimationFrame(() => {
                const sel = `[data-row="${nextRow}"][data-col="${nextColIdx}"]`
                const el = tableRef.current?.querySelector<HTMLElement>(sel)
                el?.focus()
            })
        }
        if (e.key === "Enter") {
            e.preventDefault()
            if (rowIdx === rows.length - 1) addRows(1)
            requestAnimationFrame(() => {
                const sel = `[data-row="${rowIdx + 1}"][data-col="0"]`
                const el = tableRef.current?.querySelector<HTMLElement>(sel)
                el?.focus()
            })
        }
    }

    // ── Validation summary ─────────────────────────────────────────────────

    const nonEmptyRows = rows.filter(r => !isRowEmpty(r))
    const validRows = nonEmptyRows.filter(r => Object.keys(getRowErrors(r)).length === 0)

    // ── Import ──────────────────────────────────────────────────────────────

    const handleImport = async () => {
        if (validRows.length === 0) return
        setIsImporting(true)
        setResult(null)

        const payload = validRows.map(r => ({
            tenant_id: tenantId,
            name: r.name.trim(),
            category: r.category || null,
            unit: r.unit,
            cost_price: parseFloat(r.cost_price) || 0,
            selling_price: parseFloat(r.selling_price) || 0,
            supplier_id: r.supplier_id || null,
            status: "active",
        }))

        const errors: ImportResult["errors"] = []
        let successCount = 0

        // Batch of 50 to avoid payload limits
        const BATCH = 50
        for (let i = 0; i < payload.length; i += BATCH) {
            const batch = payload.slice(i, i + BATCH)
            const { error } = await supabase.from("products").insert(batch)
            if (error) {
                batch.forEach((_, idx) =>
                    errors.push({ row: i + idx + 1, reason: error.message })
                )
            } else {
                successCount += batch.length
            }
        }

        setResult({ success: successCount, errors })
        setIsImporting(false)

        if (successCount > 0) {
            toast.success(t("importSuccess", { count: successCount }))
            try { localStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
            if (errors.length === 0) {
                setTimeout(() => router.push("/products"), 1500)
            }
        }
        if (errors.length > 0) {
            toast.error(t("importFailed", { count: errors.length }))
        }
    }

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* Draft restored banner */}
            {draftRestored && !result && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {t("draftRestored")}
                    <button onClick={clearAll} className="ml-auto underline underline-offset-2 hover:text-amber-700">
                        {t("clear")}
                    </button>
                </div>
            )}

            {/* Result banner */}
            {result && (
                <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border text-sm font-bold ${result.errors.length === 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
                    : 'bg-destructive/10 border-destructive/20 text-destructive'
                    }`}>
                    {result.errors.length === 0
                        ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    }
                    <div>
                        <p>{t("resultsSummary", { count: result.success })}</p>
                        {result.errors.length > 0 && (
                            <ul className="mt-1 text-xs font-medium space-y-0.5 opacity-80">
                                {result.errors.slice(0, 5).map((e, i) => (
                                    <li key={i}>{t("lineError", { row: e.row, reason: e.reason })}</li>
                                ))}
                                {result.errors.length > 5 && <li>{t("others", { count: result.errors.length - 5 })}</li>}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRows(5)}
                        className="h-9 rounded-xl border-primary/10 bg-card/40 font-black text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                    >
                        <Plus className="h-3.5 w-3.5" /> {t("addLines", { count: 5 })}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addRows(20)}
                        className="h-9 rounded-xl border-primary/10 bg-card/40 font-black text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
                    >
                        <Plus className="h-3.5 w-3.5" /> {t("addLines", { count: 20 })}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="h-9 rounded-xl font-black text-xs text-muted-foreground gap-1.5 hover:text-destructive"
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> {t("reset")}
                    </Button>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-card/40 border border-primary/10 px-3 py-1.5 rounded-xl">
                        <span className="text-primary">{validRows.length}</span>
                        {nonEmptyRows.length > validRows.length && (
                            <span className="text-destructive"> / {nonEmptyRows.length}</span>
                        )} {t("validRows", { valid: "" })}
                    </div>
                    <Button
                        onClick={handleImport}
                        disabled={validRows.length === 0 || isImporting}
                        className="h-9 rounded-xl font-black text-xs gap-2 bg-primary hover:bg-primary/90 text-background shadow-lg shadow-primary/20 active:scale-95 transition-all"
                    >
                        {isImporting
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("importing")}</>
                            : <><Zap className="h-3.5 w-3.5" /> {t("importAction", { count: validRows.length > 0 ? validRows.length : "" })}</>
                        }
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="rounded-[2rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                <div className="overflow-x-auto">
                    <table ref={tableRef} className="w-full text-sm border-collapse">
                        <thead className="bg-primary/[0.03] border-b border-primary/5">
                            <tr>
                                <th className="py-4 pl-6 pr-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left w-8">{t("columnHash")}</th>
                                <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left min-w-[220px]">
                                    {t("columnName")} <span className="text-red-400">{t("required")}</span>
                                </th>
                                <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left min-w-[180px]">{t("columnCategory")}</th>
                                <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left w-28">{t("columnUnit")}</th>
                                <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left w-32">
                                    {t("columnCostPrice")} <span className="text-red-400">{t("required")}</span>
                                </th>
                                <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left w-32">
                                    {t("columnSellingPrice")} <span className="text-red-400">{t("required")}</span>
                                </th>
                                {suppliers.length > 0 && (
                                    <th className="py-4 px-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-left min-w-[160px]">{t("columnSupplier")}</th>
                                )}
                                <th className="py-4 px-3 w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIdx) => {
                                const errors = isRowEmpty(row) ? {} : getRowErrors(row)
                                const isEmpty = isRowEmpty(row)
                                return (
                                    <tr
                                        key={row._id}
                                        className={`border-b border-primary/5 last:border-0 transition-colors ${isEmpty ? 'opacity-50' : ''
                                            } ${Object.keys(errors).length > 0 && !isEmpty ? 'bg-red-500/[0.02]' : 'hover:bg-primary/[0.01]'}`}
                                    >
                                        <td className="pl-6 pr-2 py-2 text-[10px] text-muted-foreground/30 font-black">{rowIdx + 1}</td>

                                        {/* Name */}
                                        <td className="px-2 py-2">
                                            <input
                                                data-row={rowIdx}
                                                data-col={0}
                                                value={row.name}
                                                onChange={e => updateCell(row._id, "name", e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, rowIdx, 0)}
                                                placeholder={t("placeholderName")}
                                                className={`w-full h-8 px-3 rounded-lg bg-transparent border font-medium text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-muted-foreground/20
                                                    ${errors.name && !isEmpty
                                                        ? 'border-red-400/60 bg-red-500/5 focus:ring-red-400 text-red-500'
                                                        : 'border-primary/10 focus:ring-primary focus:border-primary/30 focus:bg-card/60'
                                                    }`}
                                            />
                                        </td>

                                        {/* Category */}
                                        <td className="px-2 py-2">
                                            <select
                                                data-row={rowIdx}
                                                data-col={1}
                                                value={row.category}
                                                onChange={e => updateCell(row._id, "category", e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, rowIdx, 1)}
                                                className="w-full h-8 px-2 rounded-lg bg-transparent border border-primary/10 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/30 focus:bg-card/60 transition-all text-muted-foreground"
                                            >
                                                <option value="">{t("selectCategory")}</option>
                                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </td>

                                        {/* Unit */}
                                        <td className="px-2 py-2">
                                            <select
                                                data-row={rowIdx}
                                                data-col={2}
                                                value={row.unit}
                                                onChange={e => updateCell(row._id, "unit", e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, rowIdx, 2)}
                                                className={`w-full h-8 px-2 rounded-lg bg-transparent border font-bold text-sm focus:outline-none focus:ring-1 transition-all
                                                    ${errors.unit && !isEmpty
                                                        ? 'border-red-400/60 bg-red-500/5 focus:ring-red-400'
                                                        : 'border-primary/10 focus:ring-primary focus:border-primary/30 focus:bg-card/60'
                                                    }`}
                                            >
                                                {UNITS.map(u => <option key={u.value} value={u.value}>{u.value}</option>)}
                                            </select>
                                        </td>

                                        {/* Cost price */}
                                        <td className="px-2 py-2">
                                            <input
                                                data-row={rowIdx}
                                                data-col={3}
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={row.cost_price}
                                                onChange={e => updateCell(row._id, "cost_price", e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, rowIdx, 3)}
                                                placeholder={t("placeholderPrice")}
                                                className={`w-full h-8 px-3 rounded-lg bg-transparent border font-mono font-bold text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-muted-foreground/20 text-amber-500
                                                        ${errors.cost_price && !isEmpty
                                                        ? 'border-red-400/60 bg-red-500/5 focus:ring-red-400'
                                                        : 'border-primary/10 focus:ring-amber-400 focus:border-amber-400/40 focus:bg-amber-500/5'
                                                    }`}
                                            />
                                        </td>

                                        {/* Selling price */}
                                        <td className="px-2 py-2">
                                            <input
                                                data-row={rowIdx}
                                                data-col={4}
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={row.selling_price}
                                                onChange={e => updateCell(row._id, "selling_price", e.target.value)}
                                                onKeyDown={e => handleKeyDown(e, rowIdx, 4)}
                                                placeholder={t("placeholderPrice")}
                                                className={`w-full h-8 px-3 rounded-lg bg-transparent border font-mono font-bold text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-muted-foreground/20 text-emerald-500
                                                        ${errors.selling_price && !isEmpty
                                                        ? 'border-red-400/60 bg-red-500/5 focus:ring-red-400'
                                                        : 'border-primary/10 focus:ring-emerald-400 focus:border-emerald-400/40 focus:bg-emerald-500/5'
                                                    }`}
                                            />
                                        </td>

                                        {/* Supplier */}
                                        {suppliers.length > 0 && (
                                            <td className="px-2 py-2">
                                                <select
                                                    data-row={rowIdx}
                                                    data-col={5}
                                                    value={row.supplier_id}
                                                    onChange={e => updateCell(row._id, "supplier_id", e.target.value)}
                                                    onKeyDown={e => handleKeyDown(e, rowIdx, 5)}
                                                    className="w-full h-8 px-2 rounded-lg bg-transparent border border-primary/10 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/30 focus:bg-card/60 transition-all text-muted-foreground"
                                                >
                                                    <option value="">{t("selectSupplier")}</option>
                                                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                                </select>
                                            </td>
                                        )}

                                        {/* Delete */}
                                        <td className="px-2 py-2">
                                            <button
                                                onClick={() => removeRow(row._id)}
                                                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer hint */}
                <div className="px-6 py-3 border-t border-primary/5 bg-primary/[0.02] flex items-center gap-3">
                    <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                        {t("hint")}
                    </p>
                    <div className="ml-auto text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                        {t("rowCount", { count: rows.length })}
                    </div>
                </div>
            </div>
        </div>
    )
}
