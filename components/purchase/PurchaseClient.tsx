"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useSettings } from "@/components/providers/SettingsProvider"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Search,
    Plus,
    Minus,
    Trash2,
    Truck,
    Building2,
    CheckCircle2,
    ArrowLeft,
    Box,
    Package
} from "lucide-react"

interface Product {
    id: string;
    name: string;
    barcode?: string;
    sku?: string;
    cost_price: number;
    supplier_id?: string;
}

interface Supplier {
    id: string;
    name: string;
}

interface CartItem {
    product_id: string;
    name: string;
    unit_cost: number;
    quantity: number;
}

interface PurchaseClientProps {
    products: Product[];
    suppliers: Supplier[];
    warehouseId: string;
    warehouseName: string;
}

export function PurchaseClient({ products, suppliers, warehouseId, warehouseName }: PurchaseClientProps) {
    const { currency } = useSettings()
    const router = useRouter()
    const supabase = createClient()

    const [searchTerm, setSearchTerm] = useState("")
    const [cart, setCart] = useState<CartItem[]>([])
    const [supplierId, setSupplierId] = useState<string>("")
    const [referenceNumber, setReferenceNumber] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Filter products
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return []
        const lowerSearch = searchTerm.toLowerCase()
        return products.filter((p: Product) =>
            p.name.toLowerCase().includes(lowerSearch) ||
            (p.barcode && p.barcode.toLowerCase().includes(lowerSearch)) ||
            (p.sku && p.sku.toLowerCase().includes(lowerSearch))
        ).slice(0, 10) // show top 10
    }, [products, searchTerm])

    // Math
    const calculateTotals = () => {
        const subtotal = cart.reduce((acc, item) => acc + (item.unit_cost * item.quantity), 0)
        return { total: subtotal }
    }

    const { total } = calculateTotals()

    // Handlers
    const addToCart = (product: Product) => {
        const existing = cart.find(i => i.product_id === product.id)
        if (existing) {
            setCart(cart.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                unit_cost: product.cost_price,
                quantity: 1
            }])
        }
        setSearchTerm("") // clear search after adding
    }

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.product_id === id) {
                const newQ = item.quantity + delta
                return newQ > 0 ? { ...item, quantity: newQ } : item
            }
            return item
        }))
    }

    const updateUnitCost = (id: string, newCost: string) => {
        const val = parseFloat(newCost)
        setCart(cart.map(item => {
            if (item.product_id === id) {
                return { ...item, unit_cost: isNaN(val) ? 0 : val }
            }
            return item
        }))
    }

    const handleCheckout = async () => {
        if (cart.length === 0) {
            toast.error("Veuillez ajouter des articles avant de valider.")
            return
        }

        setIsSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()

            const itemsPayload = cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                unit_cost: item.unit_cost,
                total_cost: item.unit_cost * item.quantity
            }))

            const { error } = await supabase.rpc('process_purchase', {
                p_tenant_id: profile?.tenant_id,
                p_warehouse_id: warehouseId,
                p_supplier_id: supplierId || null,
                p_received_by: user?.id,
                p_reference_number: referenceNumber || null,
                p_items: itemsPayload,
                p_notes: 'Réception via Interface Arrivage'
            })

            if (error) throw error

            toast.success("Arrivage enregistré avec succès !")
            setCart([])
            setReferenceNumber("")
            setSupplierId("")

        } catch (error) {
            console.error(error)
            toast.error(error.message || "Erreur lors de la réception.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" className="h-8 mb-2 text-xs font-black uppercase text-muted-foreground hover:text-primary pl-0" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                    </Button>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
                        <Truck className="h-8 w-8 text-primary" /> Nouvel Arrivage
                    </h1>
                    <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                        Dépôt de réception : <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-md">{warehouseName}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-primary/10 p-6 shadow-xl shadow-black/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Building2 className="h-4 w-4" /> Détails Fournisseur
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest">Fournisseur</label>
                                <select
                                    className="w-full bg-background border border-primary/10 rounded-xl px-4 h-12 text-sm font-bold focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                                    value={supplierId}
                                    onChange={(e) => setSupplierId(e.target.value)}
                                >
                                    <option value="">Sélectionner un fournisseur...</option>
                                    {suppliers.map((s: Supplier) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest">N° de Référence / BL</label>
                                <Input
                                    placeholder="Ex: Facture #12345"
                                    className="h-12 bg-background border border-primary/10 rounded-xl px-4 text-sm font-bold shadow-sm"
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/[0.03] backdrop-blur-md rounded-3xl border border-primary/10 p-6 shadow-xl shadow-black/5 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Total Arrivage HT</h3>
                            <div className="text-4xl font-black tracking-tighter text-foreground mb-6">
                                {total.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xl opacity-30 ml-1 select-none">{currency}</span>
                            </div>
                        </div>

                        <Button
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={handleCheckout}
                            className="w-full h-14 bg-primary hover:bg-primary/90 text-background font-black text-sm uppercase tracking-[0.1em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <span className="animate-pulse flex items-center gap-2"><Box className="h-5 w-5 animate-spin" /> Enregistrement...</span>
                            ) : (
                                <><CheckCircle2 className="h-5 w-5 mr-2" /> Valider l&apos;Arrivage</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Items Card */}
                <div className="md:col-span-2 bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-primary/10 shadow-xl shadow-black/5 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-primary/5 bg-background/50">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Chercher un produit à ajouter..."
                                className="w-full h-14 pl-12 pr-4 bg-background border-primary/20 hover:border-primary/40 focus:border-primary rounded-2xl shadow-sm text-base font-bold transition-all"
                            />

                            {/* Search Results Dropdown */}
                            {searchTerm && (
                                <div className="absolute top-16 left-0 right-0 bg-card border border-primary/10 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((p: Product) => (
                                            <div
                                                key={p.id}
                                                onClick={() => addToCart(p)}
                                                className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-xl cursor-pointer transition-colors group"
                                            >
                                                <div>
                                                    <h4 className="font-black text-sm group-hover:text-primary transition-colors">{p.name}</h4>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.sku || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-mono text-xs text-muted-foreground font-bold">{p.cost_price} <span className="text-[10px] opacity-40">{currency}</span></span>
                                                    <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors">
                                                        <Plus className="h-3 w-3" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            Aucun produit trouvé
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Access to Supplier Products */}
                    {supplierId && (
                        <div className="border-b border-primary/5 bg-primary/[0.02] p-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                                <Package className="h-3 w-3" /> Catalogue Actuel du Fournisseur
                            </h4>
                            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
                                {products.filter((p: Product) => p.supplier_id === supplierId).map((p: Product) => (
                                    <div
                                        key={p.id}
                                        onClick={() => addToCart(p)}
                                        className="shrink-0 w-[160px] bg-card border border-primary/10 hover:border-primary/40 rounded-xl p-3 cursor-pointer group transition-all shadow-sm shadow-black/5"
                                    >
                                        <h5 className="font-black text-xs truncate group-hover:text-primary transition-colors" title={p.name}>{p.name}</h5>
                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-primary/5">
                                            <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase">PU: {p.cost_price} <span className="text-[8px] opacity-40">{currency}</span></span>
                                            <div className="size-5 rounded bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-background transition-colors">
                                                <Plus className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {products.filter((p: Product) => p.supplier_id === supplierId).length === 0 && (
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest py-3 px-2">
                                        Aucun produit lié à ce fournisseur
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/20 relative">
                        {cart.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 opacity-40">
                                <Box className="h-16 w-16 mb-4 text-primary" />
                                <p className="text-xs uppercase font-black tracking-widest text-muted-foreground">La liste de réception est vide</p>
                                <p className="text-[10px] font-bold text-muted-foreground/60 mt-2">Utilisez la barre de recherche ci-dessus pour ajouter des articles.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.product_id} className="bg-card border border-primary/10 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-2 group hover:border-primary/30 transition-colors">
                                    <div className="flex-1 min-w-0 w-full">
                                        <h4 className="font-black text-sm truncate">{item.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Article ajouté</p>
                                    </div>

                                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Quantité Reçue</label>
                                            <div className="flex items-center gap-1 bg-accent/50 rounded-lg p-0.5 border border-primary/10">
                                                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.product_id, -1)} className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground">
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="text-sm font-black w-10 text-center">{item.quantity}</span>
                                                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.product_id, 1)} className="h-8 w-8 rounded-md text-primary hover:bg-primary/10">
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Prix Unitaire HT</label>
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    value={item.unit_cost === 0 ? '' : item.unit_cost}
                                                    onChange={(e) => updateUnitCost(item.product_id, e.target.value)}
                                                    className="h-9 w-24 pl-3 pr-8 text-sm font-bold bg-background border-primary/20 focus:border-primary"
                                                />
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/30 font-bold text-[10px] select-none">{currency}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 items-end min-w-[70px]">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Total HT</label>
                                            <span className="text-sm font-black text-primary">
                                                {(item.unit_cost * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] opacity-40 ml-0.5">{currency}</span>
                                            </span>
                                        </div>

                                        <Button variant="ghost" size="icon" onClick={() => setCart(cart.filter(i => i.product_id !== item.product_id))} className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 ml-2">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
