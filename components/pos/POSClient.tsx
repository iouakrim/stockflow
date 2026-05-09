"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { toast } from "sonner"
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
    History
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
import { POSCartItems } from "./POSCartItems"
import { POSCheckoutPanel } from "./POSCheckoutPanel"
import { POSReceiptPanel } from "./POSReceiptPanel"
import { POSProductGrid } from "./POSProductGrid"
import { POSCustomerSelect } from "./POSCustomerSelect"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { processSaleCheckout, quickCreateCustomer, cancelAndRevertSale } from "@/app/(dashboard)/sales/actions"
import { useRouter } from "next/navigation"
import { useSettings } from "@/components/providers/SettingsProvider"

export interface ProductWithSupplier extends Product {
    suppliers?: { name: string } | { name: string }[] | null;
}

interface POSClientProps {
    products: ProductWithSupplier[]
    customers: { id: string; name: string; phone: string | null; loyalty_points?: number }[]
}

export function POSClient({ products, customers }: POSClientProps) {
    const { items, addItem, removeItem, updateQuantity, total, clearCart, discount, discountType, setDiscount } = useCartStore()
    const { currency } = useSettings()
    const t = useTranslations("POS")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walk-in")
    const [isCustomerOpen, setIsCustomerOpen] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeSupplier, setActiveSupplier] = useState(t("all"))
    const [isSupplierOpen, setIsSupplierOpen] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [completedSaleId, setCompletedSaleId] = useState<string | null>(null)
    const [paymentMode, setPaymentMode] = useState<'cash' | 'credit'>('cash')
    const [isCancelling, setIsCancelling] = useState(false)

    // Quick Create Customer State
    const [localCustomers, setLocalCustomers] = useState(customers)
    const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false)
    const [newCustomerName, setNewCustomerName] = useState("")
    const [newCustomerPhone, setNewCustomerPhone] = useState("")
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
    const [showDiscount, setShowDiscount] = useState(false)

    useEffect(() => setLocalCustomers(customers), [customers])

    useEffect(() => {
        if (selectedCustomerId === 'walk-in' && paymentMode === 'credit') {
            setPaymentMode('cash')
        }
    }, [selectedCustomerId, paymentMode])

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
                const s = Array.isArray(p.suppliers) ? p.suppliers[0] : p.suppliers
                if (s) {
                    const existing = supps.find(x => x.name === s.name)
                    if (existing) {
                        existing.count++
                    } else {
                        supps.push({ id: p.supplier_id || s.name, name: s.name, count: 1 })
                    }
                }
            }
        })
        return supps.sort((a, b) => b.count - a.count)
    }, [products])

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.barcode?.includes(searchTerm) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSupplier = activeSupplier === t("all") || (Array.isArray(p.suppliers) ? p.suppliers[0]?.name : p.suppliers?.name) === activeSupplier
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
                paymentMode,
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

    const handleRevertSale = async () => {
        if (!completedSaleId) return
        if (!confirm("Voulez-vous vraiment annuler cette vente et restaurer les stocks pour la modifier ?")) return

        setIsCancelling(true)
        try {
            const res = await cancelAndRevertSale(completedSaleId)
            if (res && res.success) {
                setCompletedSaleId(null)
                setShowSuccess(false)
                toast.success("Vente annulée avec succès ! Vous pouvez modifier le panier.")
                router.refresh()
            } else {
                toast.error("Erreur d'annulation.")
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error("Erreur lors de l'annulation de la vente." + error.message)
            } else {
                toast.error("Erreur lors de l'annulation de la vente.")
            }
        } finally {
            setIsCancelling(false)
        }
    }



    return (
        <div className="flex-1 flex flex-col h-full bg-background selection:bg-primary/30 selection:text-primary">

            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0">
                {/* Left Side: Controls & Product Catalog */}
                <div className={`flex-1 flex flex-col min-w-0 gap-4 ${completedSaleId ? 'pointer-events-none opacity-50 grayscale transition-all duration-500' : ''}`}>

                    {/* Stacked Controls: Customer & Search */}
                    <div className="flex flex-col gap-3">
                        <POSCustomerSelect
                            isCustomerOpen={isCustomerOpen}
                            setIsCustomerOpen={setIsCustomerOpen}
                            selectedCustomerId={selectedCustomerId}
                            setSelectedCustomerId={setSelectedCustomerId}
                            localCustomers={localCustomers}
                            setLocalCustomers={setLocalCustomers}
                            isNewCustomerOpen={isNewCustomerOpen}
                            setIsNewCustomerOpen={setIsNewCustomerOpen}
                            newCustomerName={newCustomerName}
                            setNewCustomerName={setNewCustomerName}
                            newCustomerPhone={newCustomerPhone}
                            setNewCustomerPhone={setNewCustomerPhone}
                            isCreatingCustomer={isCreatingCustomer}
                            setIsCreatingCustomer={setIsCreatingCustomer}
                        />

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

                    <POSProductGrid filteredProducts={filteredProducts} />
                </div>

                {/* Desktop Cart Controller */}
                <div className="hidden lg:flex w-[380px] flex-col glass-card rounded-[2rem] p-5 shadow-2xl overflow-hidden h-full">
                    {completedSaleId ? (
                        <POSReceiptPanel
                            completedSaleId={completedSaleId}
                            handleNewSale={handleNewSale}
                            handleRevertSale={handleRevertSale}
                            isCancelling={isCancelling}
                            idPrefix="desktop"
                        />
                    ) : (
                        <>
                            <POSCartItems />
                            <POSCheckoutPanel
                                handleCheckout={handleCheckout}
                                isProcessing={isProcessing}
                                showSuccess={showSuccess}
                                discountAmount={discountAmount}
                                subtotal={subtotal}
                                grandTotal={grandTotal}
                                paymentMode={paymentMode}
                                setPaymentMode={setPaymentMode}
                                selectedCustomerId={selectedCustomerId}
                                setIsCustomerOpen={setIsCustomerOpen}
                                showDiscount={showDiscount}
                                setShowDiscount={setShowDiscount}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Mobile Order Bar */}
            <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 flex gap-3">
                <Button
                    onClick={() => router.push('/sales')}
                    className="h-18 w-18 shrink-0 rounded-3xl bg-zinc-950/90 backdrop-blur-xl border-b-4 border-primary/20 shadow-2xl flex items-center justify-center text-primary active:scale-95 transition-all"
                    title={t("history")}
                >
                    <History className="size-6" />
                </Button>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="flex-1 h-18 text-base font-black uppercase tracking-[0.2em] flex justify-between px-8 rounded-3xl shadow-2xl shadow-primary/40 bg-zinc-950 border-b-4 border-primary/20 active:scale-[1.01] transition-all">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                                <span>{items.length} {t("itms")}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg tracking-tighter">{grandTotal.toFixed(2)} <span className="text-xs opacity-50 ml-1">{currency}</span></span>
                                <ChevronRight className="h-5 w-5" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[95vh] rounded-t-[3rem] border-primary/20 bg-card/95 backdrop-blur-3xl flex flex-col p-8">
                        <div className="w-12 h-1 bg-primary/20 rounded-full mx-auto mb-8" />
                        {completedSaleId ? (
                            <POSReceiptPanel
                                completedSaleId={completedSaleId}
                                handleNewSale={handleNewSale}
                                handleRevertSale={handleRevertSale}
                                isCancelling={isCancelling}
                                idPrefix="mobile"
                            />
                        ) : (
                            <>
                                <POSCartItems />
                                <div className="pt-6">
                                    <POSCheckoutPanel
                                        handleCheckout={handleCheckout}
                                        isProcessing={isProcessing}
                                        showSuccess={showSuccess}
                                        discountAmount={discountAmount}
                                        subtotal={subtotal}
                                        grandTotal={grandTotal}
                                        paymentMode={paymentMode}
                                        setPaymentMode={setPaymentMode}
                                        selectedCustomerId={selectedCustomerId}
                                        setIsCustomerOpen={setIsCustomerOpen}
                                        showDiscount={showDiscount}
                                        setShowDiscount={setShowDiscount}
                                    />
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
