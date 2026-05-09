"use client"

import { useTranslations } from "next-intl"
import { useSettings } from "@/components/providers/SettingsProvider"
import { useCartStore } from "./CartStore"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"

export function POSCartItems() {
    const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore()
    const { currency } = useSettings()
    const t = useTranslations("POS")

    return (
        <>
            {items.length > 0 && (
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
            )}
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

                                <div className="flex-1 min-w-0 relative z-10 flex flex-col justify-center">
                                    <p className="font-bold text-[11px] leading-tight line-clamp-2 tracking-tight uppercase group-hover:text-primary transition-colors mb-0.5">{item.name}</p>
                                    <p className="text-[8px] text-muted-foreground/60 font-black uppercase tracking-widest">{item.selling_price.toFixed(2)} <span className="text-[7px] opacity-70">{currency}</span> / {item.unit ? t(item.unit.toLowerCase()) : t("un")}</p>
                                </div>

                                <div className="flex flex-col items-end gap-1.5 shrink-0 relative z-10">
                                    <p className="font-black text-sm tracking-tighter text-foreground leading-none">{(item.selling_price * item.cartQuantity).toFixed(2)} <span className="text-[10px] ml-0.5 opacity-70">{currency}</span></p>
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
        </>
    )
}
