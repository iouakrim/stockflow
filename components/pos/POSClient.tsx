"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Product } from "@/types"
import { useCartStore } from "./CartStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
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
    Boxes,
    Zap,
    X,
    ArrowRight,
    HandCoins
} from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    const [activeCategory, setActiveCategory] = useState("All")
    const [showSuccess, setShowSuccess] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // 1. Focus search on mount
    useEffect(() => {
        searchInputRef.current?.focus()

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault()
                searchInputRef.current?.focus()
            }
            if (e.key === 'F4' && items.length > 0) {
                e.preventDefault()
                handleCheckout()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [items])

    const categories = useMemo(() => {
        const cats = Array.from(new Set(products.map(p => p.category || "General")))
        return ["All", ...cats]
    }, [products])

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.includes(searchTerm) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = activeCategory === "All" || (p.category || "General") === activeCategory
        return matchesSearch && matchesCategory
    })

    const taxRate = 0.02
    const subtotal = total
    const tax = total * taxRate
    const grandTotal = subtotal + tax

    const handleCheckout = async () => {
        if (items.length === 0 || isProcessing) return

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
                setShowSuccess(true)
                setTimeout(() => {
                    clearCart()
                    setShowSuccess(false)
                    router.refresh()
                }, 1500)
            } else {
                alert("Checkout failed: " + res.error)
            }
        } catch (error: any) {
            alert("Error: " + error.message)
        } finally {
            setIsProcessing(false)
        }
    }

    const CartHeader = () => (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Terminal className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-base font-black tracking-tight uppercase">Terminal Order</h3>
                    <p className="text-[10px] text-muted-foreground font-black tracking-widest opacity-60">SESSION ACTIVE</p>
                </div>
            </div>
            {items.length > 0 && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearCart}
                    className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    )

    const CartItemsList = () => (
        <ScrollArea className="flex-1 -mr-2 pr-4 custom-scrollbar">
            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 border-2 border-dashed border-primary/5 rounded-[2rem] bg-accent/5">
                        <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-4" />
                        <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest text-center">Awaiting Protocol Input...</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="group bg-card/60 rounded-2xl border border-primary/5 p-3 flex items-center gap-3 hover:border-primary/20 transition-all">
                            <div className="size-10 rounded-xl bg-accent flex items-center justify-center font-black text-xs shrink-0">
                                {item.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-xs truncate tracking-tight uppercase">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-medium">${item.selling_price.toFixed(2)} / {item.unit || 'unit'}</p>
                            </div>
                            <div className="flex items-center gap-2.5 bg-accent/30 rounded-lg p-1">
                                <button
                                    onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                    className="size-6 rounded-md hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-[11px] font-black min-w-[1.5rem] text-center">{item.cartQuantity}</span>
                                <button
                                    onClick={() => addItem(item)}
                                    className="size-6 rounded-md hover:bg-primary/20 hover:text-primary transition-colors flex items-center justify-center"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                            <div className="text-right min-w-[4rem]">
                                <p className="font-black text-xs">${(item.selling_price * item.cartQuantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
    )

    const CheckoutPanel = () => (
        <div className="pt-6 border-t border-primary/10 space-y-6">
            <div className="grid grid-cols-3 gap-2">
                {[
                    { id: 'cash', icon: Banknote, label: 'CASH' },
                    { id: 'card', icon: Smartphone, label: 'CARD' },
                    { id: 'credit', icon: CreditCard, label: 'CREDIT' }
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${paymentMethod === m.id
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-accent/40 border-transparent text-muted-foreground hover:bg-accent'
                            }`}
                    >
                        <m.icon className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{m.label}</span>
                    </button>
                ))}
            </div>

            <div className="bg-primary/[0.03] p-5 rounded-2xl border border-primary/5 space-y-2.5">
                <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>Tax (2%)</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-primary/10">
                    <span className="text-[11px] font-black uppercase text-primary tracking-[0.2em]">Grand Total</span>
                    <span className="text-2xl font-black tracking-tighter text-foreground">${grandTotal.toFixed(2)}</span>
                </div>
            </div>

            <Button
                onClick={handleCheckout}
                disabled={items.length === 0 || isProcessing}
                className={`w-full h-15 rounded-[1.5rem] shadow-xl font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${showSuccess ? 'bg-green-500 hover:bg-green-500' : 'bg-primary hover:bg-primary/90 text-background'
                    }`}
            >
                {showSuccess ? (
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" /> COMPLETED
                    </div>
                ) : isProcessing ? (
                    <div className="flex items-center gap-3">
                        <span className="size-4 border-2 border-background/20 border-t-background rounded-full animate-spin" /> PROCESSING
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 fill-current" /> EXECUTE (F4)
                    </div>
                )}
            </Button>
        </div>
    )

    return (
        <div className="flex-1 flex flex-col h-full bg-background selection:bg-primary/30 selection:text-primary">
            {/* Top Command Bar */}
            <div className="flex flex-col md:flex-row items-center gap-5 mb-8">
                <div className="w-full md:w-auto shrink-0 flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-background shadow-lg shadow-primary/30">
                        <Zap className="h-7 w-7 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase leading-tight">FastLane POS</h1>
                        <Badge variant="outline" className="text-[8px] font-black tracking-[0.2em] border-primary/20 text-primary px-2">v4.0 OPERATIONAL</Badge>
                    </div>
                </div>

                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Customer Quick Select */}
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                            <SelectTrigger className="h-14 pl-11 bg-card/40 border-primary/10 rounded-2xl font-bold transition-all focus:ring-1 focus:ring-primary shadow-sm hover:border-primary/30">
                                <SelectValue placeholder="Client Selection" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-primary/10 shadow-2xl">
                                <SelectItem value="walk-in" className="font-bold py-3 pl-10 focus:bg-primary/5 focus:text-primary relative group">
                                    <div className="size-2 bg-primary rounded-full absolute left-4 top-1/2 -translate-y-1/2 opacity-40 group-focus:opacity-100 transition-opacity" />
                                    WALK-IN (STANDARD)
                                </SelectItem>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id} className="font-bold py-3 pl-10 focus:bg-primary/5 focus:text-primary">
                                        {c.name.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lightning Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <Input
                            ref={searchInputRef}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="SEARCH OR SCAN (F2)..."
                            className="h-14 pl-11 bg-card/40 border-primary/10 rounded-2xl font-bold transition-all focus:ring-1 focus:ring-primary shadow-sm hover:border-primary/30 placeholder:opacity-40 uppercase"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && filteredProducts.length === 1) {
                                    addItem(filteredProducts[0])
                                    setSearchTerm("")
                                }
                            }}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-20 group-focus-within:opacity-50 transition-opacity">
                            <BoxIcon className="size-3" />
                            <span className="text-[10px] font-black underline">ENTER</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden min-h-0">
                {/* Product Catalog */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center gap-4 overflow-x-auto pb-6 no-scrollbar mask-fade-right">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap active:scale-95 border ${activeCategory === cat
                                        ? 'bg-primary text-background border-primary shadow-lg shadow-primary/20 scale-105'
                                        : 'bg-card/40 text-muted-foreground border-primary/10 hover:border-primary/40 hover:text-primary'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <ScrollArea className="flex-1 pr-4 -mr-4 custom-scrollbar">
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                            {filteredProducts.map(product => {
                                const cartItem = items.find(i => i.id === product.id)
                                const quantity = cartItem?.cartQuantity || 0
                                const isLow = product.stock_quantity <= (product.low_stock_threshold || 5)
                                const outOfStock = product.stock_quantity <= 0

                                return (
                                    <div
                                        key={product.id}
                                        className={`group relative glass-card p-4 rounded-[1.8rem] flex flex-col gap-3 transition-all cursor-pointer hover:border-primary/40 shadow-sm hover:shadow-xl active:scale-95 select-none ${outOfStock ? 'opacity-30 grayscale pointer-events-none' : ''
                                            }`}
                                        onClick={() => addItem(product)}
                                    >
                                        <div className="aspect-[4/3] rounded-2xl bg-accent/30 flex items-center justify-center relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                                            <Package className={`h-8 w-8 transition-transform duration-500 ${quantity > 0 ? 'text-primary' : 'text-muted-foreground/30'} group-hover:scale-110`} />
                                            {quantity > 0 && (
                                                <div className="absolute inset-0 bg-primary/5 border-2 border-primary/30 rounded-2xl animate-in zoom-in-75 duration-300" />
                                            )}
                                            <div className="absolute top-2 right-2 flex flex-col items-end gap-1.5">
                                                <Badge className={`text-[8px] px-1.5 py-0 border-none rounded-lg font-black ${isLow ? 'bg-destructive text-white animate-pulse' : 'bg-primary/20 text-primary'}`}>
                                                    {product.stock_quantity} {product.unit || 'KG'}
                                                </Badge>
                                                {quantity > 0 && (
                                                    <Badge className="bg-primary text-background text-xs font-black size-7 rounded-full flex items-center justify-center p-0 shadow-lg animate-in fade-in zoom-in duration-300">
                                                        {quantity}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-0.5 px-1">
                                            <h3 className="font-black text-xs uppercase tracking-tight truncate leading-tight">{product.name}</h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="font-black text-sm tracking-tighter text-emerald-500">${product.selling_price.toFixed(2)}</p>
                                                <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{product.category || 'GEN'}</p>
                                            </div>
                                        </div>

                                        {/* Quick Controls overlay when selected */}
                                        {quantity > 0 && (
                                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between p-1 bg-background/90 backdrop-blur-md rounded-xl border border-primary/20 animate-in slide-in-from-bottom-2 duration-300" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                                    className="size-7 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center active:scale-90"
                                                >
                                                    <Minus className="h-4 w-4 stroke-[3px]" />
                                                </button>
                                                <span className="text-xs font-black">{quantity}</span>
                                                <button
                                                    onClick={() => addItem(product)}
                                                    className="size-7 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center active:scale-90"
                                                >
                                                    <Plus className="h-4 w-4 stroke-[3px]" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Desktop Cart Controller */}
                <div className="hidden lg:flex w-[380px] flex-col glass-card rounded-[2.5rem] p-7 shadow-2xl overflow-hidden self-start h-[calc(100vh-200px)] sticky top-0">
                    <CartHeader />
                    <CartItemsList />
                    <CheckoutPanel />
                </div>
            </div>

            {/* Mobile Order Bar */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="w-full h-18 text-base font-black uppercase tracking-[0.2em] flex justify-between px-8 rounded-3xl shadow-2xl shadow-primary/40 bg-zinc-950 border-b-4 border-primary/20 active:scale-[0.98] transition-all">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                                <span>{items.length} ITMS</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg tracking-tighter">${grandTotal.toFixed(2)}</span>
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] border-primary/20 bg-card/95 backdrop-blur-3xl flex flex-col p-8">
                        <div className="w-12 h-1 bg-primary/20 rounded-full mx-auto mb-8" />
                        <CartHeader />
                        <CartItemsList />
                        <div className="pt-6">
                            <CheckoutPanel />
                        </div>
                        <SheetClose className="absolute right-8 top-8 opacity-40 hover:opacity-100 transition-opacity">
                            <X className="h-6 w-6" />
                        </SheetClose>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}

function BoxIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="9 10 4 15 9 20" />
            <path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </svg>
    )
}
