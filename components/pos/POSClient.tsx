"use client"

import { useState, useMemo } from "react"
import { Product } from "@/types"
import { useCartStore } from "./CartStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import {
    Minus,
    Plus,
    Search,
    Trash2,
    ShoppingCart,
    User,
    CheckCircle2,
    CreditCard,
    Banknote,
    Smartphone,
    ChevronRight,
    Printer,
    ChevronDown,
    Package,
    Terminal,
    ScanBarcode,
    ListFilter,
    Boxes
} from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { processSaleCheckout } from "@/app/(dashboard)/sales/actions"
import { useRouter } from "next/navigation"

interface POSClientProps {
    products: Product[]
    customers: { id: string; name: string; phone: string | null }[]
}

export function POSClient({ products, customers }: POSClientProps) {
    const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCartStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in")
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash')
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeCategory, setActiveCategory] = useState("All Categories")
    const router = useRouter()

    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category || "General")))
        return ["All Categories", ...cats]
    }, [products])

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.includes(searchTerm) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = activeCategory === "All Categories" || (p.category || "General") === activeCategory
        return matchesSearch && matchesCategory
    })

    const subtotal = total
    const tax = total * 0.02 // 2% dummy tax
    const grandTotal = subtotal + tax

    const handleCheckout = async () => {
        if (items.length === 0) return

        try {
            setIsProcessing(true)
            const saleItems = items.map(i => ({
                product_id: i.id,
                quantity: i.cartQuantity,
                unit_price: i.selling_price,
                total_price: i.selling_price * i.cartQuantity
            }))

            const customerId = selectedCustomerId === "walk-in" ? null : selectedCustomerId

            const res = await processSaleCheckout(
                saleItems,
                customerId,
                paymentMethod === 'credit' ? 'credit' : (paymentMethod === 'card' ? 'card' : 'cash')
            )

            if (res.success) {
                clearCart()
                router.refresh()
                // In a real app we might redirect to a receipt, but for now just success
                alert(`Sale Processed successfully! Receipt: ${res.saleId}`)
            } else {
                alert("Checkout failed: " + res.error)
            }
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const CartComponent = () => (
        <div className="flex flex-col h-full bg-card/40 backdrop-blur-xl">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Terminal className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black tracking-tight">Terminal Cart</h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Session #8821</p>
                    </div>
                </div>
                <div className="bg-primary px-3 py-1 rounded-full text-[10px] font-black text-background uppercase tracking-widest shadow-lg shadow-primary/20">
                    {items.length} units
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-6 py-24 px-8 border-2 border-dashed border-primary/5 rounded-3xl opacity-40">
                        <div className="size-20 rounded-full bg-accent flex items-center justify-center">
                            <ShoppingCart className="h-10 w-10 opacity-20" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-center leading-relaxed">System Ready <br /> Scanning for inputs...</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="flex gap-4 group bg-accent/40 p-4 rounded-3xl border border-primary/5 hover:border-primary/30 transition-all hover:bg-accent/60">
                            <div className="size-14 rounded-2xl bg-card flex items-center justify-center text-primary font-black text-sm shrink-0 border border-primary/10 shadow-sm relative group-hover:scale-110 transition-transform">
                                {item.name[0]}
                                <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm truncate tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                                <div className="flex items-center justify-between mt-2.5">
                                    <div className="flex items-center gap-3 bg-card rounded-xl p-1 border border-primary/10 shadow-inner">
                                        <button
                                            className="size-7 rounded-lg bg-accent text-muted-foreground flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-30 active:scale-90"
                                            onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                            disabled={item.cartQuantity <= 1}
                                        >
                                            <Minus className="h-3.5 w-3.5 stroke-[3px]" />
                                        </button>
                                        <span className="text-xs font-black min-w-6 text-center">{item.cartQuantity}</span>
                                        <button
                                            className="size-7 rounded-lg bg-accent text-muted-foreground flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors active:scale-90"
                                            onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                                        >
                                            <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black tracking-tight">${(item.selling_price * item.cartQuantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-widest leading-none mt-1">@ ${item.selling_price.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeItem(item.id)}
                                className="text-muted-foreground/40 hover:text-destructive self-start p-1 hover:bg-destructive/10 rounded-lg transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Matrix Summary Panel */}
            <div className="pt-8 mt-6 border-t border-primary/10 space-y-6">
                <div>
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-4 block px-1">Settlement Mechanism</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'cash', icon: Banknote, label: 'Standard Cash' },
                            { id: 'card', icon: Smartphone, label: 'Digital Terminal' },
                            { id: 'credit', icon: CreditCard, label: 'Credit Line' }
                        ].map((method) => (
                            <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] border-2 transition-all group ${paymentMethod === method.id
                                    ? 'border-primary bg-primary/10 text-primary shadow-2xl shadow-primary/10'
                                    : 'border-primary/5 bg-accent/40 text-muted-foreground hover:border-primary/20 hover:bg-accent/60'
                                    }`}
                            >
                                <method.icon className={`h-6 w-6 transition-transform ${paymentMethod === method.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(17,212,115,0.4)]' : ''}`} />
                                <span className="text-[9px] font-black uppercase tracking-tighter text-center leading-tight">{method.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-primary/[0.03] rounded-3xl p-6 border border-primary/5 space-y-3">
                    <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Net Aggregate</span>
                        <span className="text-foreground">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                        <span>Terminal Tax (2%)</span>
                        <span className="text-foreground">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-3xl font-black text-primary border-t-2 border-primary/10 pt-5 mt-2 tracking-tighter">
                        <span className="flex flex-col">
                            TOTAL
                            <span className="text-[10px] font-black text-primary/40 tracking-[0.3em] mt-1 uppercase">Settlement total</span>
                        </span>
                        <span className="shadow-[0_0_30px_rgba(17,212,115,0.1)] transition-all">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <Button
                    className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-background gap-4 transform active:scale-[0.98] transition-all border-b-4 border-b-primary-foreground/20 hover:border-b-0 hover:translate-y-1"
                    disabled={items.length === 0 || isProcessing}
                    onClick={handleCheckout}
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-3">
                            <span className="size-4 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                            PROCESSING...
                        </div>
                    ) : (
                        <>
                            <Printer className="h-6 w-6" /> COMMENCE CHECKOUT
                        </>
                    )}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex-1 flex flex-col lg:flex-row gap-10 overflow-hidden min-h-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Left Column: Intelligence Hub & Catalog */}
            <div className="flex-1 flex flex-col gap-8 overflow-hidden min-h-0">
                {/* Header & Controls Matrix */}
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <ScanBarcode className="h-5 w-5" />
                                </div>
                                <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none">Point of Sale Terminal</h1>
                            </div>
                            <p className="text-muted-foreground/60 text-xs font-bold uppercase tracking-widest pl-11">Terminal ID: <span className="text-foreground">ALPHA-SEC-01</span></p>
                        </div>

                        <div className="flex items-center gap-3 bg-card/40 backdrop-blur p-2 rounded-2xl border border-primary/5 shadow-sm">
                            <Button variant="ghost" size="sm" className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary active:scale-95">Catalog</Button>
                            <Button variant="ghost" size="sm" className="rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary active:scale-95">Shortcuts</Button>
                            <div className="w-px h-5 bg-primary/10 mx-1" />
                            <div className="flex items-center gap-2 pl-2 pr-1">
                                <div className="size-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#11d473]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Active Session</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-primary/10 shadow-2xl shadow-black/5">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] pl-1">Client Authorization</label>
                            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                                <SelectTrigger className="bg-background/80 border-primary/10 rounded-2xl h-14 px-5 shadow-lg shadow-black/5 focus:ring-1 focus:ring-primary border transition-all text-sm font-bold">
                                    <div className="flex items-center gap-4">
                                        <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <SelectValue placeholder="Select authenticated client" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-primary/10 p-2 shadow-2xl">
                                    <SelectItem value="walk-in" className="rounded-xl py-3 font-bold focus:bg-primary/10 focus:text-primary">WALK-IN (Anonymous)</SelectItem>
                                    {customers.map(c => (
                                        <SelectItem key={c.id} value={c.id} className="rounded-xl py-3 font-bold focus:bg-primary/10 focus:text-primary">{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] pl-1">Input Sequence</label>
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
                                <Input
                                    placeholder="Scan barcode or enter nomenclature..."
                                    className="bg-background/80 border-primary/10 rounded-2xl h-14 pl-14 shadow-lg shadow-black/5 focus:ring-1 focus:ring-primary border transition-all text-sm font-bold placeholder:text-muted-foreground/30"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex h-6 items-center px-1.5 rounded-lg bg-accent/50 text-muted-foreground/60 border border-primary/10 text-[10px] font-mono font-black italic">F2</kbd>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Scroll */}
                <div className="flex items-center gap-4 overflow-x-auto pb-4 px-1 no-scrollbar border-b border-primary/10 mb-2">
                    <ListFilter className="h-5 w-5 text-primary shrink-0 opacity-50" />
                    <div className="flex gap-3">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 border ${activeCategory === cat
                                    ? 'bg-primary text-background border-primary shadow-xl shadow-primary/20 scale-105'
                                    : 'bg-card/40 text-muted-foreground border-primary/10 hover:border-primary/40 hover:text-primary'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Interactive Product Vault Grid */}
                <ScrollArea className="flex-1 pr-6 custom-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20 pt-2">
                        {filteredProducts.map(product => {
                            const inStock = product.stock_quantity > 0;
                            const isLow = product.stock_quantity <= product.low_stock_threshold;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => inStock && addItem(product)}
                                    className={`group relative glass-card p-5 flex flex-col gap-4 transition-all cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 active:scale-95 ${!inStock ? 'opacity-30 grayscale pointer-events-none' : ''}`}
                                >
                                    {/* Availability Glimmer */}
                                    <div className="absolute top-4 right-4 z-10">
                                        <div className={`size-2.5 rounded-full border-2 border-background shadow-sm ${isLow ? 'bg-destructive animate-pulse' : 'bg-primary shadow-[0_0_8px_#11d473]'}`} />
                                    </div>

                                    <div className="h-44 w-full bg-accent/40 rounded-2xl flex items-center justify-center overflow-hidden border border-primary/5 group-hover:bg-primary/10 transition-colors relative">
                                        <div className="size-16 rounded-[2rem] bg-card flex items-center justify-center text-primary shadow-2xl shadow-black/20 group-hover:scale-110 transition-transform group-hover:text-background group-hover:bg-primary border border-primary/10">
                                            <Package className="h-8 w-8" />
                                        </div>
                                        <span className="absolute bottom-4 left-4 text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{product.sku || 'SYSTEM SKU'}</span>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest opacity-60">
                                                {product.category || "General"}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-base mt-2 leading-none group-hover:text-primary transition-colors tracking-tight truncate">{product.name}</h3>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex flex-col gap-1">
                                                <p className={`text-[10px] font-black uppercase tracking-tighter ${isLow ? 'text-destructive animate-bounce' : 'text-muted-foreground/60'}`}>
                                                    {inStock ? `${product.stock_quantity.toLocaleString()} KG STOCK` : 'DEPLETED'}
                                                </p>
                                                <div className="w-16 h-1 bg-accent rounded-full overflow-hidden">
                                                    <div className={`h-full ${isLow ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min((product.stock_quantity / 1000) * 100, 100)}%` }} />
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-lg tracking-tighter text-foreground group-hover:text-primary transition-colors">${product.selling_price.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-primary/10 mt-auto flex justify-center">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-y-0 translate-y-2">
                                            <Plus className="h-3 w-3 stroke-[3px]" /> ADD TO SESSION
                                        </div>
                                    </div>
                                </div>
                            )
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 border-2 border-dashed border-primary/10 rounded-[3rem] bg-card/10">
                                <div className="size-24 rounded-full bg-accent flex items-center justify-center border border-primary/10">
                                    <Boxes className="h-10 w-10 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-black uppercase tracking-widest opacity-30">Null Reference Identified</p>
                                    <p className="text-xs font-medium text-muted-foreground/40">Try adjusting your nomenclature search parameters.</p>
                                </div>
                                <Button variant="outline" onClick={() => { setSearchTerm(""); setActiveCategory("All Categories") }} className="rounded-xl font-black text-[10px] tracking-widest uppercase">Reset Sequence</Button>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Column: Terminal Control Center (Desktop) */}
            <div className="hidden lg:flex w-[480px] flex-col glass-card rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden self-start h-[calc(100vh-140px)] sticky top-0 transition-all duration-500 hover:shadow-primary/5 hover:border-primary/20">
                <div className="flex-1 p-8 overflow-hidden">
                    <CartComponent />
                </div>
            </div>

            {/* Mobile Matrix Toggle */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="w-full h-18 text-base font-black uppercase tracking-[0.2em] flex justify-between px-10 rounded-3xl shadow-2xl shadow-primary/40 border-b-4 border-primary-foreground/20 animate-in slide-in-from-bottom-10 backdrop-blur-lg">
                            <span className="flex items-center gap-4">
                                <Terminal className="h-6 w-6" /> CART ({items.length})
                            </span>
                            <span className="text-xl tracking-tighter shadow-sm">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[95vh] flex flex-col rounded-t-[4rem] border-primary/20 p-0 overflow-hidden bg-card/95 backdrop-blur-3xl lg:hidden">
                        <div className="w-16 h-1.5 bg-primary/20 rounded-full mx-auto mt-6 opacity-50" />
                        <div className="flex-1 px-10 py-10 pb-16 overflow-hidden">
                            <CartComponent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Status Bar Indicators */}
            <div className="fixed bottom-8 left-10 hidden 2xl:flex items-center gap-6 px-6 py-3 bg-background/60 backdrop-blur-3xl border border-primary/10 rounded-2xl shadow-2xl z-20">
                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest">
                    <kbd className="px-2 py-1 rounded bg-accent border border-primary/20 text-primary font-mono leading-none">CTRL</kbd>
                    <kbd className="px-2 py-1 rounded bg-accent border border-primary/20 text-primary font-mono leading-none">F</kbd>
                    <span className="text-muted-foreground/60 ml-2">Smart Find</span>
                </div>
                <div className="w-px h-4 bg-primary/20" />
                <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-primary">
                    <div className="size-2 bg-primary rounded-full animate-pulse" />
                    Terminal Active
                </div>
            </div>
        </div>
    )
}
