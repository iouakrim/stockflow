"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Package,
    Pencil,
    Trash2,
    Search,
    Loader2,
    ChevronDown,
    Check,
} from "lucide-react"
import { Product } from "@/types"
import { useTranslations } from "next-intl"

interface Supplier {
    id: string
    name: string
}

interface ProductsListClientProps {
    products: Product[]
    currency: string
    suppliers: Supplier[]
}

export function ProductsListClient({ products: initialProducts, currency, suppliers }: ProductsListClientProps) {
    const t = useTranslations("Inventory")
    const supabase = createClient()

    const [searchTerm, setSearchTerm] = useState("")
    const [supplierFilter, setSupplierFilter] = useState<string | null>(null)
    const [dropdownSearch, setDropdownSearch] = useState("")
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [products, setProducts] = useState(initialProducts)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [confirmDeleteProduct, setConfirmDeleteProduct] = useState<Product | null>(null)

    const filtered = products.filter(p => {
        const matchSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchSupplier = supplierFilter ? p.supplier_id === supplierFilter : true
        return matchSearch && matchSupplier
    })

    const handleDelete = async (product: Product) => {
        setDeletingId(product.id)
        try {
            const { error } = await supabase
                .from("products")
                .update({ status: 'deleted' })
                .eq("id", product.id)
            if (error) throw error
            setProducts(prev => prev.filter(p => p.id !== product.id))
            toast.success(`"${product.name}" archivé`)
        } catch {
            toast.error("Erreur lors de l'archivage")
        } finally {
            setDeletingId(null)
            setConfirmDeleteProduct(null)
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div className="space-y-3">
                    {/* Search + filter bar */}
                    <div className="flex items-center gap-3">
                        <div className="relative group flex-1 md:max-w-sm">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-card/40 border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/30"
                                placeholder={t("search")}
                            />
                        </div>
                    </div>

                    {/* Supplier quick filters */}
                    {suppliers.length > 0 && (() => {
                        const VISIBLE = 3
                        const showDropdown = suppliers.length > 5
                        const visibleSuppliers = showDropdown ? suppliers.slice(0, VISIBLE) : suppliers
                        const dropdownSuppliers = showDropdown
                            ? suppliers.slice(VISIBLE).filter(s =>
                                s.name.toLowerCase().includes(dropdownSearch.toLowerCase())
                            )
                            : []
                        const activeInDropdown = showDropdown && supplierFilter &&
                            suppliers.slice(VISIBLE).some(s => s.id === supplierFilter)
                        const activeDropdownName = activeInDropdown
                            ? suppliers.find(s => s.id === supplierFilter)?.name
                            : null

                        return (
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Tous */}
                                <button
                                    onClick={() => setSupplierFilter(null)}
                                    className={`h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${supplierFilter === null
                                        ? 'bg-primary text-background border-primary shadow-sm shadow-primary/20'
                                        : 'bg-card/40 text-muted-foreground border-primary/10 hover:border-primary/30 hover:text-primary'
                                        }`}
                                >
                                    {t("allSuppliers")}
                                </button>

                                {/* First 3 (or all if ≤5) pills */}
                                {visibleSuppliers.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSupplierFilter(supplierFilter === s.id ? null : s.id)}
                                        className={`h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${supplierFilter === s.id
                                            ? 'bg-primary text-background border-primary shadow-sm shadow-primary/20'
                                            : 'bg-card/40 text-muted-foreground border-primary/10 hover:border-primary/30 hover:text-primary'
                                            }`}
                                    >
                                        {s.name}
                                    </button>
                                ))}

                                {/* Dropdown for the rest */}
                                {showDropdown && (
                                    <div className="relative">
                                        <button
                                            onClick={() => { setDropdownOpen(o => !o); setDropdownSearch("") }}
                                            className={`h-7 px-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 ${activeInDropdown
                                                ? 'bg-primary text-background border-primary shadow-sm shadow-primary/20'
                                                : 'bg-card/40 text-muted-foreground border-primary/10 hover:border-primary/30 hover:text-primary'
                                                }`}
                                        >
                                            {activeDropdownName ?? t("moreSuppliers", { count: suppliers.length - VISIBLE })}
                                            <ChevronDown className={`h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="absolute top-9 left-0 z-50 w-52 bg-background border border-primary/10 rounded-2xl shadow-2xl shadow-black/20 p-2 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                                {/* Search inside dropdown */}
                                                <div className="relative mb-1">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                    <input
                                                        autoFocus
                                                        value={dropdownSearch}
                                                        onChange={e => setDropdownSearch(e.target.value)}
                                                        placeholder={t("searchSuppliers")}
                                                        className="w-full pl-8 pr-3 py-1.5 text-[11px] font-medium bg-card/40 border border-primary/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                                                    />
                                                </div>
                                                {dropdownSuppliers.length === 0 ? (
                                                    <p className="text-[10px] text-muted-foreground text-center py-2 font-bold">{t("noResults")}</p>
                                                ) : (
                                                    dropdownSuppliers.map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => {
                                                                setSupplierFilter(supplierFilter === s.id ? null : s.id)
                                                                setDropdownOpen(false)
                                                            }}
                                                            className={`w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all ${supplierFilter === s.id
                                                                ? 'bg-primary/10 text-primary'
                                                                : 'hover:bg-primary/5 text-foreground'
                                                                }`}
                                                        >
                                                            {s.name}
                                                            {supplierFilter === s.id && <Check className="h-3 w-3" />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })()}
                </div>

                {/* Table */}
                <div className="rounded-[2.5rem] border border-primary/10 bg-card/30 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/10">
                    <Table>
                        <TableHeader className="bg-primary/[0.03]">
                            <TableRow className="border-b border-primary/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 px-8">{t("productEntity")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("globalSku")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("classification")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5">{t("stockLevel")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right">{t("unitPrice")}</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] py-5 text-right px-8">{t("actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-24 text-muted-foreground italic opacity-50">
                                        <div className="flex flex-col items-center gap-3">
                                            <Package className="h-8 w-8" />
                                            <p className="text-xs font-black uppercase tracking-widest">
                                                {searchTerm ? "Aucun résultat" : t("empty")}
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((product: Product) => {
                                    const isLow = product.stock_quantity <= product.low_stock_threshold
                                    const isDeleting = deletingId === product.id
                                    return (
                                        <TableRow key={product.id} className={`border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
                                            <TableCell className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-accent/50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform border border-primary/5">
                                                        {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Package className="h-5 w-5" />}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-black text-sm tracking-tight truncate group-hover:text-primary transition-colors">{product.name}</span>
                                                        <span className="text-[10px] text-muted-foreground/50 font-medium">{t("recorded")} {new Date(product.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground font-mono font-bold tracking-tighter opacity-60">
                                                {product.sku || t("unassigned")}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[10px] px-3 py-1 rounded-full bg-accent/50 text-muted-foreground border border-primary/5 font-black uppercase tracking-tighter">
                                                    {product.category || t("general")}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className={`font-black text-sm tracking-tighter ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                                                        {product.stock_quantity.toLocaleString()} <span className="text-[10px] opacity-60 uppercase">{product.unit || t("unit")}</span>
                                                    </span>
                                                    <div className="w-20 h-1 bg-accent rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isLow ? 'bg-destructive' : 'bg-primary'}`}
                                                            style={{ width: `${Math.min((product.stock_quantity / 1000) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-sm tracking-tighter px-4">
                                                {product.selling_price.toFixed(2)} <span className="text-[10px] opacity-40 ml-0.5">{currency}</span>
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-9 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                                    >
                                                        <Link href={`/products/${product.id}/edit`}>
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                                        onClick={() => setConfirmDeleteProduct(product)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
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
                            {t("matrixOutput")}: {filtered.length}{filtered.length !== products.length ? ` / ${products.length}` : ''} {t("productsIdentified")}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-xl border-primary/10 bg-primary/10 text-primary font-black text-xs shadow-lg shadow-primary/10">1</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!confirmDeleteProduct} onOpenChange={(open) => !open && setConfirmDeleteProduct(null)}>
                <DialogContent className="rounded-3xl border-primary/10 max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="font-black uppercase tracking-tight">Supprimer ce produit ?</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            <span className="font-black text-foreground">&ldquo;{confirmDeleteProduct?.name}&rdquo;</span> sera définitivement supprimé du catalogue. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 flex-row justify-end">
                        <Button
                            variant="outline"
                            className="rounded-xl font-bold border-primary/10"
                            onClick={() => setConfirmDeleteProduct(null)}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={() => confirmDeleteProduct && handleDelete(confirmDeleteProduct)}
                            className="rounded-xl font-black bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
