"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Product } from "@/types"
import { useCartStore } from "./CartStore"
import { useTranslations } from "next-intl"
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
    ChevronRight,
    ChevronDown,
    Zap,
    X,
    Loader2,
    Phone,
    Printer,
    Truck
} from "lucide-react"

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet"



import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { processSaleCheckout, quickCreateCustomer } from "@/app/(dashboard)/sales/actions"
import { useRouter } from "next/navigation"

interface POSClientProps {
    products: Product[]
    customers: { id: string; name: string; phone: string | null }[]
}

export function POSClient({ products, customers }: POSClientProps) {
    const { items, addItem, removeItem, updateQuantity, total, clearCart, discount, discountType, setDiscount } = useCartStore()
    const t = useTranslations("POS")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in")
    const [isCustomerOpen, setIsCustomerOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeSupplier, setActiveSupplier] = useState(t("all"))
    const [isSupplierOpen, setIsSupplierOpen] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [completedSaleId, setCompletedSaleId] = useState<string | null>(null)

    // Quick Create Customer State
    const [localCustomers, setLocalCustomers] = useState(customers)
    const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState("")
    const [newCustomerPhone, setNewCustomerPhone] = useState("")
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)

    useEffect(() => setLocalCustomers(customers), [customers])

    const searchInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    // 1. Focus search on mount
    useEffect(() => {
        searchInputRef.current?.focus()
    }, [])

    // 2. Global keyboard shortcuts
    useEffect(() => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items])

    const suppliers = useMemo(() => {
        const supps: { id: string; name: string; count: number }[] = []
        products.forEach(p => {
            if (p.suppliers) {
                const s = p.suppliers as any
                const existing = supps.find(x => x.name === s.name)
                if (existing) {
                    existing.count++
                } else {
                    supps.push({ id: p.supplier_id || s.name, name: s.name, count: 1 })
                }
            }
        })
        return supps.sort((a, b) => b.count - a.count)
    }, [products])

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.includes(searchTerm) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSupplier = activeSupplier === t("all") || (p.suppliers as any)?.name === activeSupplier
        return matchesSearch && matchesSupplier
    })

    const subtotal = total

    // Calculate Discount Amount
    const discountAmount = discountType === 'percentage'
        ? subtotal * (discount / 100)
        : discount

    let grandTotal = subtotal - discountAmount
    if (grandTotal < 0) grandTotal = 0

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
                'cash', // Defaulting to cash for MVP
                discountAmount // Pass numeric discount amount
            )

            if (res.success) {
                setShowSuccess(true)
                if (res.saleId) {
                    setCompletedSaleId(res.saleId)
                }
            } else {
                alert("Checkout failed: " + res.error)
            }
        } catch (error: unknown) {
            alert("Error: " + (error instanceof Error ? error.message : String(error)))
        } finally {
            setIsProcessing(false)
        }
    }

    const handleNewSale = () => {
        setCompletedSaleId(null)
        setShowSuccess(false)
        clearCart()
        setSelectedCustomerId("walk-in")
        router.refresh()
    }

    const CartHeader = () => {
        if (items.length === 0) return null;
        return (
            <div className="flex justify-end mb-2 -mt-2">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-8 rounded-lg text-xs font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 px-3"
                >
                    <Trash2 className="h-3 w-3" /> {t("clearCart")}
                </Button>
            </div>
        )
    }

    const CartItemsList = () => (
        <ScrollArea className="flex-1 -mr-2 pr-4 custom-scrollbar">
            <div className="space-y-1.5">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-primary/5 rounded-3xl bg-accent/5">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/20 mb-3" />
                        <p className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest text-center">{t("awaitingInput")}</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="group relative bg-card rounded-[1.2rem] border border-primary/10 p-2.5 flex items-center gap-3 hover:border-primary/30 transition-all hover:shadow-md overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top z-10" />

                            <div className="size-9 rounded-xl bg-primary/5 flex items-center justify-center font-black text-sm shrink-0 border border-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm relative z-10">
                                {item.name[0]}
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <p className="font-bold text-xs truncate tracking-tight uppercase group-hover:text-primary transition-colors">{item.name}</p>
                                <p className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest mt-0.5">${item.selling_price.toFixed(2)} / {item.unit ? t(item.unit.toLowerCase()) : t("un")}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0 relative z-10">
                                <p className="font-black text-sm tracking-tighter text-foreground leading-none">${(item.selling_price * item.cartQuantity).toFixed(2)}</p>
                                <div className="flex items-center gap-1.5 bg-accent/50 rounded-xl p-1 border border-primary/5">
                                    <button
                                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                                        className="size-6 rounded-lg hover:bg-background hover:text-destructive hover:shadow-sm transition-all flex items-center justify-center"
                                    >
                                        <Minus className="h-3 w-3 stroke-[3px]" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.cartQuantity || ''}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value)
                                            if (!isNaN(val) && val > 0) {
                                                updateQuantity(item.id, val)
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (!e.target.value || parseInt(e.target.value) < 1) {
                                                updateQuantity(item.id, 1)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') e.currentTarget.blur()
                                        }}
                                        onFocus={(e) => e.target.select()}
                                        className="w-10 h-6 text-xs font-black text-center bg-background/50 border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded p-0 text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        onClick={() => addItem(item)}
                                        className="size-6 rounded-lg hover:bg-background hover:text-primary hover:shadow-sm transition-all flex items-center justify-center"
                                    >
                                        <Plus className="h-3 w-3 stroke-[3px]" />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => removeItem(item.id)}
                                className="size-8 rounded-xl shrink-0 flex items-center justify-center text-muted-foreground/30 hover:bg-destructive/10 hover:text-destructive transition-colors relative z-10 ml-0.5"
                                title={t("removeItem")}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
    )

    const CheckoutPanel = () => (
        <div className="pt-4 border-t border-primary/10 space-y-4">
            {/* Smart Discount Toggle */}
            <div className="bg-primary/[0.02] p-4 rounded-3xl border border-primary/5 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{t("applyDiscount")}</span>
                    {discount > 0 && (
                        <button
                            onClick={() => setDiscount(0, 'percentage')}
                            className="text-[9px] font-bold text-destructive hover:underline uppercase tracking-widest"
                        >
                            {t("clear")}
                        </button>
                    )}
                </div>

                <div className="flex gap-2">
                    {[5, 10, 15].map((pct) => (
                        <button
                            key={pct}
                            onClick={() => setDiscount(pct, 'percentage')}
                            className={`flex-1 h-9 rounded-xl text-xs font-black transition-all border ${discount === pct && discountType === 'percentage'
                                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                                : 'bg-background text-muted-foreground border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                                }`}
                        >
                            -{pct}%
                        </button>
                    ))}
                    <div className="relative flex-1">
                        <Input
                            type="number"
                            placeholder="$$"
                            className={`h-9 rounded-xl text-xs font-black px-2 pr-6 text-right transition-all border ${discount > 0 && discountType === 'fixed'
                                ? 'border-primary ring-1 ring-primary/20 bg-primary/5'
                                : 'border-primary/10 hover:border-primary/30'
                                }`}
                            value={discountType === 'fixed' && discount > 0 ? discount : ''}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0
                                setDiscount(val, 'fixed')
                            }}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground pointer-events-none">$</span>
                    </div>
                </div>
            </div>

            <div className="bg-primary/[0.03] p-4 rounded-3xl border border-primary/10 space-y-2 shadow-inner">
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-2 pb-2 border-b border-primary/5">
                        <span className="uppercase tracking-widest">{t("subtotal")}</span>
                        <span className="line-through opacity-50">${subtotal.toFixed(2)}</span>
                    </div>
                )}
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs font-bold text-emerald-500 mb-2 pb-2 border-b border-primary/5">
                        <span className="uppercase tracking-widest">{t("discount")}</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-end">
                    <span className="text-xs font-black uppercase text-primary tracking-[0.2em] mb-1">{t("total")}</span>
                    <span className="text-3xl font-black tracking-tighter text-foreground leading-none">${grandTotal.toFixed(2)}</span>
                </div>
            </div>

            <Button
                onClick={handleCheckout}
                disabled={items.length === 0 || isProcessing}
                className={`w-full h-14 rounded-2xl shadow-xl font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${showSuccess ? 'bg-green-500 hover:bg-green-500' : 'bg-primary hover:bg-primary/90 text-background'
                    }`}
            >
                {showSuccess ? (
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" /> {t("completed")}
                    </div>
                ) : isProcessing ? (
                    <div className="flex items-center gap-3">
                        <span className="size-4 border-2 border-background/20 border-t-background rounded-full animate-spin" /> {t("processing")}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 fill-current" /> {t("checkout")}
                    </div>
                )}
            </Button>
        </div>
    )

    return (
        <div className="flex-1 flex flex-col h-full bg-background selection:bg-primary/30 selection:text-primary">

            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
                {/* Left Side: Controls & Product Catalog */}
                <div className="flex-1 flex flex-col min-w-0 gap-4">

                    {/* Stacked Controls: Customer & Search */}
                    <div className="flex flex-col gap-3">
                        {/* Customer Quick Select & Add */}
                        <div className="flex items-center gap-2">
                            <div className="relative group flex-1">
                                <Popover open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={isCustomerOpen}
                                            className="w-full h-14 pl-11 justify-between bg-card/40 border-primary/10 rounded-2xl font-bold transition-all focus:ring-1 focus:ring-primary shadow-sm hover:border-primary/30"
                                        >
                                            <div className="flex items-center">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                                                <span className="truncate">
                                                    {selectedCustomerId === "walk-in"
                                                        ? t("walkIn")
                                                        : localCustomers.find((c) => c.id === selectedCustomerId)?.name?.toUpperCase() || t("selectCustomer")}
                                                </span>
                                            </div>
                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0 rounded-2xl border-primary/10 shadow-2xl">
                                        <Command>
                                            <CommandInput placeholder={t("searchClients")} className="h-12 font-bold" />
                                            <CommandList className="max-h-[300px] custom-scrollbar">
                                                <CommandEmpty className="py-6 text-center text-sm font-medium">{t("noClientFound")}</CommandEmpty>
                                                <CommandGroup>
                                                    <CommandItem
                                                        value="walk-in"
                                                        className="font-bold py-3 pl-10 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary cursor-pointer relative"
                                                        onSelect={() => {
                                                            setSelectedCustomerId("walk-in")
                                                            setIsCustomerOpen(false)
                                                        }}
                                                    >
                                                        {selectedCustomerId === "walk-in" && (
                                                            <div className="size-2 bg-primary rounded-full absolute left-4 top-1/2 -translate-y-1/2" />
                                                        )}
                                                        {t("walkIn")}
                                                    </CommandItem>
                                                    {customers.map((c) => (
                                                        <CommandItem
                                                            key={c.id}
                                                            value={c.name}
                                                            className="font-bold py-3 pl-10 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary cursor-pointer relative"
                                                            onSelect={() => {
                                                                setSelectedCustomerId(c.id)
                                                                setIsCustomerOpen(false)
                                                            }}
                                                        >
                                                            {selectedCustomerId === c.id && (
                                                                <div className="size-2 bg-primary rounded-full absolute left-4 top-1/2 -translate-y-1/2" />
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span>{c.name.toUpperCase()}</span>
                                                                {c.phone && <span className="text-[9px] text-muted-foreground/60">{c.phone}</span>}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Add New Customer Button Toggle */}
                            <Button
                                variant={isNewCustomerOpen ? "default" : "outline"}
                                size="icon"
                                className={`h-14 w-14 shrink-0 rounded-2xl border-primary/10 shadow-sm hover:border-primary/30 transition-all ${isNewCustomerOpen ? 'bg-primary text-primary-foreground' : 'bg-card/40 text-primary'}`}
                                onClick={() => setIsNewCustomerOpen(!isNewCustomerOpen)}
                            >
                                {isNewCustomerOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                            </Button>
                        </div>

                        {/* Inline Horizontal New Customer Form */}
                        {isNewCustomerOpen && (
                            <div className="flex items-center gap-3 bg-card/60 p-3 rounded-2xl border border-primary/10 shadow-inner animate-in slide-in-from-top-2 duration-300">
                                <div className="relative flex-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input
                                        placeholder={t("clientName")}
                                        className="pl-9 h-11 border-primary/5 focus-visible:ring-primary/20 bg-background/80 uppercase font-bold text-sm"
                                        value={newCustomerName}
                                        onChange={(e) => setNewCustomerName(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input
                                        placeholder={t("phoneNumber")}
                                        className="pl-9 h-11 border-primary/5 focus-visible:ring-primary/20 bg-background/80 font-bold text-sm"
                                        value={newCustomerPhone}
                                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') document.getElementById('quick-save-client-btn')?.click()
                                        }}
                                    />
                                </div>
                                <Button
                                    id="quick-save-client-btn"
                                    className="h-11 px-6 font-black uppercase tracking-wider rounded-xl shrink-0"
                                    disabled={!newCustomerName.trim() || isCreatingCustomer}
                                    onClick={async () => {
                                        if (!newCustomerName.trim()) return
                                        setIsCreatingCustomer(true)
                                        const res = await quickCreateCustomer(newCustomerName, newCustomerPhone)
                                        if (res.success && res.id) {
                                            const newC = { id: res.id, name: newCustomerName, phone: newCustomerPhone || null }
                                            setLocalCustomers(prev => [newC, ...prev])
                                            setSelectedCustomerId(res.id)
                                            setIsNewCustomerOpen(false)
                                            setNewCustomerName("")
                                            setNewCustomerPhone("")
                                            router.refresh()
                                        } else {
                                            alert("Failed to create customer: " + res.error)
                                        }
                                        setIsCreatingCustomer(false)
                                    }}
                                >
                                    {isCreatingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : t("save")}
                                </Button>
                            </div>
                        )}

                        {/* Lightning Search */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                            <Input
                                ref={searchInputRef}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t("search")}
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



                    {/* Supplier Smart Filters */}
                    {suppliers.length > 0 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar mask-fade-right select-none">
                            <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest mr-2 shrink-0">{t("suppliers")}</span>
                            <button
                                onClick={() => setActiveSupplier(t("all"))}
                                className={`h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 border ${activeSupplier === t("all")
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : 'bg-card/40 text-muted-foreground border-primary/5 hover:border-primary/20 hover:text-primary'
                                    }`}
                            >
                                {t("all")}
                            </button>
                            {/* Top 3 Suppliers */}
                            {suppliers.slice(0, 3).map(s => (
                                <button
                                    key={s.name}
                                    onClick={() => setActiveSupplier(s.name)}
                                    className={`h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 border flex items-center gap-1.5 ${activeSupplier === s.name
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                        : 'bg-card/40 text-muted-foreground border-primary/5 hover:border-primary/20 hover:text-primary'
                                        }`}
                                >
                                    {s.name} <span className="opacity-50 font-normal">({s.count})</span>
                                </button>
                            ))}

                            {/* All Suppliers Dropdown */}
                            {suppliers.length > 3 && (
                                <div className="relative group shrink-0">
                                    <Popover open={isSupplierOpen} onOpenChange={setIsSupplierOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isSupplierOpen}
                                                className={`h-8 px-3 ml-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 border flex items-center gap-1.5 ${activeSupplier !== "All" && !suppliers.slice(0, 3).find(s => s.name === activeSupplier)
                                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                                    : 'bg-card/40 text-muted-foreground border-primary/5 hover:border-primary/20 hover:text-primary'
                                                    }`}
                                            >
                                                {activeSupplier !== t("all") && !suppliers.slice(0, 3).find(s => s.name === activeSupplier)
                                                    ? activeSupplier
                                                    : t("moreSuppliers")}
                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[280px] p-0 rounded-2xl border-primary/10 shadow-xl bg-card/95 backdrop-blur-xl" align="start">
                                            <Command className="bg-transparent">
                                                <CommandInput placeholder={t("searchSupplier")} className="h-12 border-none focus:ring-0 uppercase text-xs font-bold font-sans" />
                                                <CommandList className="max-h-[300px] custom-scrollbar p-2">
                                                    <CommandEmpty className="py-6 text-center text-xs font-bold text-muted-foreground uppercase">{t("noSupplierFound")}</CommandEmpty>
                                                    <CommandGroup>
                                                        {suppliers.map((s) => (
                                                            <CommandItem
                                                                key={s.name}
                                                                value={s.name}
                                                                className="font-bold py-3 pl-3 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary cursor-pointer rounded-xl flex justify-between"
                                                                onSelect={() => {
                                                                    setActiveSupplier(s.name)
                                                                    setIsSupplierOpen(false)
                                                                }}
                                                            >
                                                                <span className="uppercase text-xs">{s.name}</span>
                                                                <span className="text-[10px] opacity-40">{s.count} {t("items")}</span>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}
                        </div>
                    )}

                    <ScrollArea className="flex-1 h-full w-full pr-4 pb-[100px] lg:pb-4 custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                            {filteredProducts.map(product => {
                                const cartItem = items.find(i => i.id === product.id)
                                const quantity = cartItem?.cartQuantity || 0
                                const isLow = product.stock_quantity <= (product.low_stock_threshold || 5)
                                const outOfStock = product.stock_quantity <= 0
                                const isWeightBased = product.unit?.toLowerCase() === 'kg'

                                const handleQuickAdd = (e: React.MouseEvent, amountToAdd: number) => {
                                    e.stopPropagation()
                                    if (quantity === 0) {
                                        addItem(product)
                                        // Update the quantity right after adding to override the default 1
                                        setTimeout(() => updateQuantity(product.id, amountToAdd), 0)
                                    } else {
                                        updateQuantity(product.id, quantity + amountToAdd)
                                    }
                                }

                                return (
                                    <div
                                        key={product.id}
                                        className={`group relative bg-card p-5 rounded-[1.5rem] flex flex-col gap-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg active:scale-[0.99] select-none border-2 flex-grow ${quantity > 0 ? 'border-primary ring-2 ring-primary/10 shadow-primary/20 bg-primary/[0.02]' : 'border-primary/5 hover:border-primary/30'} ${outOfStock ? 'opacity-30 grayscale pointer-events-none' : ''}`}
                                        onClick={() => addItem(product)}
                                    >
                                        <div className="flex items-start justify-between gap-4 w-full">
                                            {/* Left: Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">{product.category || t("general")}</p>
                                                <h3 className="font-black text-base uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                {product.suppliers && (
                                                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-0.5 truncate" title={(product.suppliers as any).name}>{(product.suppliers as any).name}</p>
                                                )}
                                                {product.sku && (
                                                    <span className="text-[9px] font-mono font-bold text-muted-foreground/40 bg-accent/80 px-2 py-1 rounded-md mt-2 inline-block border border-primary/5">{product.sku}</span>
                                                )}
                                            </div>

                                            {/* Right: Stock & Price Info */}
                                            <div className="flex flex-col items-end shrink-0 gap-3">
                                                <Badge className={`text-[10px] px-2.5 py-1.5 border-none rounded-xl font-black uppercase tracking-widest shadow-sm transition-colors ${quantity > 0 ? 'bg-primary text-primary-foreground' : isLow ? 'bg-destructive text-destructive-foreground animate-pulse shadow-destructive/20' : 'bg-accent text-muted-foreground'}`}>
                                                    {product.stock_quantity} <span className="opacity-50 ml-1">{product.unit ? t(product.unit.toLowerCase()) : t("un")}</span>
                                                </Badge>

                                                {/* Price Moved to Right */}
                                                <div className="flex flex-col items-end">
                                                    <span className="font-black text-xl tracking-tighter text-emerald-500/90 group-hover:text-emerald-500 transition-colors leading-none">
                                                        ${product.selling_price.toFixed(2)}
                                                    </span>
                                                    <span className="text-[9px] uppercase font-black text-muted-foreground/50 mt-1">/ {product.unit ? t(product.unit.toLowerCase()) : t("un")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions & Quantity */}
                                        <div className="mt-auto flex flex-col gap-3 relative z-20 pt-2 border-t border-primary/5" onClick={(e) => e.stopPropagation()}>

                                            {/* Smart Quick Buttons */}
                                            <div className="flex items-center gap-2">
                                                {isWeightBased ? (
                                                    <>
                                                        <button onClick={(e) => handleQuickAdd(e, 40)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">+40<span className="text-[9px] font-bold opacity-50 ml-0.5">{t("kg")}</span></button>
                                                        <button onClick={(e) => handleQuickAdd(e, 100)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">+100<span className="text-[9px] font-bold opacity-50 ml-0.5">{t("kg")}</span></button>
                                                        <button onClick={(e) => handleQuickAdd(e, 1000)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">
                                                            +1K<span className="text-[9px] font-bold opacity-50 ml-0.5">{t("kg")}</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={(e) => handleQuickAdd(e, 5)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">+5</button>
                                                        <button onClick={(e) => handleQuickAdd(e, 10)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">+10</button>
                                                        <button onClick={(e) => handleQuickAdd(e, 50)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">+50</button>
                                                        <button onClick={(e) => handleQuickAdd(e, 100)} className="flex-1 h-9 rounded-xl bg-accent/40 hover:bg-primary/10 hover:text-primary text-xs font-black transition-all border border-primary/5 border-b-[3px] active:border-b active:translate-y-px">+100</button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Quantity Controls (Visible when > 0) */}
                                            {quantity > 0 && (
                                                <div className="flex items-center justify-between p-1.5 bg-background shadow-inner rounded-xl border border-primary/10 animate-in slide-in-from-top-2 duration-300">
                                                    <button
                                                        onClick={() => updateQuantity(product.id, quantity - 1)}
                                                        className="size-10 rounded-lg hover:bg-destructive/10 text-destructive transition-all flex items-center justify-center active:scale-90"
                                                    >
                                                        <Minus className="h-5 w-5 stroke-[3px]" />
                                                    </button>
                                                    <div className="flex flex-col items-center">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={quantity || ''}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value)
                                                                if (!isNaN(val) && val > 0) {
                                                                    updateQuantity(product.id, val)
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                if (!e.target.value || parseInt(e.target.value) < 1) {
                                                                    updateQuantity(product.id, 1)
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') e.currentTarget.blur()
                                                            }}
                                                            onFocus={(e) => e.target.select()}
                                                            className="w-16 h-7 text-xl bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md p-0 text-primary text-center font-black leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <span className="text-[8px] font-black tracking-widest text-muted-foreground/60 uppercase mt-0.5">{product.unit ? t(product.unit.toLowerCase()) : t("un")}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => updateQuantity(product.id, quantity + 1)}
                                                        className="size-10 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all flex items-center justify-center active:scale-90 shadow-sm"
                                                    >
                                                        <Plus className="h-5 w-5 stroke-[3px]" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Desktop Cart Controller */}
                <div className="hidden lg:flex w-[380px] flex-col glass-card rounded-[2rem] p-5 shadow-2xl overflow-hidden h-full">
                    {completedSaleId ? (
                        <div className="flex flex-col h-full bg-background rounded-3xl overflow-hidden border border-primary/10 shadow-sm mt-2 mb-2">
                            <div className="p-5 border-b border-primary/10 flex justify-between items-center bg-card">
                                <h2 className="font-black text-sm flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                    {t("transactionComplete")}
                                </h2>
                            </div>
                            <iframe src={`/receipt/${completedSaleId}`} className="flex-1 w-full bg-white relative z-0" />
                            <div className="p-4 bg-card border-t border-primary/10 flex flex-col gap-3">
                                <Button onClick={() => window.open(`/receipt/${completedSaleId}?print=true`, '_blank')} className="w-full h-12 rounded-xl bg-black hover:bg-black/90 text-white font-black tracking-widest uppercase shadow-xl shadow-black/10 text-xs gap-2">
                                    <Printer className="w-4 h-4" /> {t("printReceipt")}
                                </Button>
                                <Button onClick={() => window.open(`/receipt/${completedSaleId}?print=true&type=pickup`, '_blank')} className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest uppercase shadow-xl shadow-emerald-500/20 text-xs gap-2">
                                    <Truck className="w-4 h-4" /> {t("printPickup")}
                                </Button>
                                <Button onClick={handleNewSale} variant="outline" className="w-full h-12 rounded-xl border-2 border-primary/20 hover:bg-primary/5 text-primary font-black tracking-widest uppercase text-xs">
                                    {t("nextCustomer")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <CartHeader />
                            <CartItemsList />
                            <CheckoutPanel />
                        </>
                    )}
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
                                <span>{items.length} {t("itms")}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg tracking-tighter">${grandTotal.toFixed(2)}</span>
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] border-primary/20 bg-card/95 backdrop-blur-3xl flex flex-col p-8">
                        <div className="w-12 h-1 bg-primary/20 rounded-full mx-auto mb-8" />
                        {completedSaleId ? (
                            <div className="flex flex-col flex-1 bg-background rounded-3xl overflow-hidden border border-primary/10 shadow-sm">
                                <div className="p-5 border-b border-primary/10 flex justify-between items-center bg-card">
                                    <h2 className="font-black text-sm flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        {t("transactionComplete")}
                                    </h2>
                                </div>
                                <iframe src={`/receipt/${completedSaleId}`} className="flex-1 w-full bg-white relative z-0" />
                                <div className="p-4 bg-card border-t border-primary/10 flex flex-col gap-3">
                                    <Button onClick={() => window.open(`/receipt/${completedSaleId}?print=true`, '_blank')} className="w-full h-12 rounded-xl bg-black hover:bg-black/90 text-white font-black tracking-widest uppercase shadow-xl shadow-black/10 text-xs gap-2">
                                        <Printer className="w-4 h-4" /> {t("printReceipt")}
                                    </Button>
                                    <Button onClick={() => window.open(`/receipt/${completedSaleId}?print=true&type=pickup`, '_blank')} className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black tracking-widest uppercase shadow-xl shadow-emerald-500/20 text-xs gap-2">
                                        <Truck className="w-4 h-4" /> {t("printPickup")}
                                    </Button>
                                    <Button onClick={handleNewSale} variant="outline" className="w-full h-12 rounded-xl border-2 border-primary/20 hover:bg-primary/5 text-primary font-black tracking-widest uppercase text-xs">
                                        {t("nextCustomer")}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <CartHeader />
                                <CartItemsList />
                                <div className="pt-6">
                                    <CheckoutPanel />
                                </div>
                            </>
                        )}
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
