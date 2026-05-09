"use client"

import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useCartStore } from "./CartStore"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus } from "lucide-react"
import { ProductWithSupplier } from "./POSClient"

interface POSProductGridProps {
    filteredProducts: ProductWithSupplier[]
}

export function POSProductGrid({ filteredProducts }: POSProductGridProps) {
    const { items, addItem, updateQuantity } = useCartStore()
    const { currency } = useSettings()
    const t = useTranslations("POS")

    return (
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
                            className={`group relative bg-card p-5 rounded-[1.5rem] flex flex-col gap-4 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-lg active:scale-[0.99] select-none border-2 flex-grow ${quantity > 0 ? 'border-primary ring-2 ring-primary/10 shadow-primary/20 bg-primary/[0.02]' : 'border-primary/20 hover:border-primary/40'} ${outOfStock ? 'pointer-events-none' : ''}`}
                            onClick={() => addItem(product)}
                        >
                            <div className={`flex flex-col gap-4 h-full ${outOfStock ? 'opacity-40 grayscale' : ''}`}>
                                <div className="flex items-start justify-between gap-4 w-full">
                                    {/* Left: Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-label mb-2">{product.category || t("general")}</p>
                                        <h3 className="font-black text-sm uppercase tracking-tight line-clamp-2 group-hover:text-primary transition-colors leading-tight min-h-[2.5rem] flex items-center">
                                            {product.name}
                                        </h3>
                                        {product.suppliers && (
                                            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest mt-0.5 truncate" title={(product.suppliers as { name: string }).name}>{(product.suppliers as { name: string }).name}</p>
                                        )}
                                    </div>

                                    {/* Right: Stock & Price Info */}
                                    <div className="flex flex-col items-end shrink-0 gap-3">
                                        <Badge className={`text-[10px] px-2.5 py-1.5 border-none rounded-xl font-black uppercase tracking-widest shadow-sm transition-colors ${quantity > 0 ? 'bg-primary text-primary-foreground' : isLow ? 'bg-destructive text-destructive-foreground animate-pulse shadow-destructive/20' : 'bg-accent text-muted-foreground'}`}>
                                            {product.stock_quantity} <span className="opacity-50 ml-1">{product.unit ? t(product.unit.toLowerCase()) : t("un")}</span>
                                        </Badge>

                                        {/* Price */}
                                        <div className="flex flex-col items-end">
                                            <span className="font-black text-sm tabular-nums">{product.selling_price.toFixed(2)} <span className="text-xs font-bold opacity-60">{currency}</span></span>
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

                                    {/* Quantity Controls */}
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
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}
