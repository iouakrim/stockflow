"use client"

import { useState } from "react"
import { Product } from "@/types"
import { useCartStore } from "./CartStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Search, Trash2, ShoppingCart } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { processSaleCheckout } from "@/app/(dashboard)/sales/actions"
import { useRouter } from "next/navigation"

export function POSClient({ products }: { products: Product[] }) {
    const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCartStore()
    const [searchTerm, setSearchTerm] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const router = useRouter()

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.includes(searchTerm) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleCheckout = async () => {
        if (items.length === 0) return alert("Cart is empty")
        try {
            setIsProcessing(true)
            const saleItems = items.map(i => ({
                product_id: i.id,
                quantity: i.cartQuantity,
                unit_price: i.selling_price,
                total_price: i.selling_price * i.cartQuantity
            }))

            const res = await processSaleCheckout(saleItems)

            if (res.success) {
                clearCart()
                alert(`Sale Processed successfully! Receipt: ${res.saleId}`)
                router.refresh() // re-fetch stock numbers in list
            } else {
                alert("Checkout failed: " + res.error);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                alert("Checkout failed: " + error.message)
            } else {
                alert("Checkout failed with an unknown error.")
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const CartContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto pr-4 space-y-4">
                {items.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground p-4">
                        Cart is empty
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-accent/50 p-2 rounded-lg">
                            <div className="flex-1">
                                <p className="font-semibold text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">${item.selling_price} x {item.cartQuantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}>
                                    <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-4 text-center">{item.cartQuantity}</span>
                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}>
                                    <Plus className="h-3 w-3" />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-6 w-6 ml-2" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="border-t pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
                <Button
                    className="w-full h-12 text-lg font-bold"
                    disabled={items.length === 0 || isProcessing}
                    onClick={handleCheckout}
                >
                    {isProcessing ? "Processing..." : "Checkout"}
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex-col md:flex-row gap-4">
            {/* Products Selection Area */}
            <div className="flex-1 flex flex-col h-full bg-card rounded-lg border shadow-sm p-4 overflow-hidden">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, SKU or barcode..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <ScrollArea className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
                        {filteredProducts.map(product => {
                            const inStock = product.stock_quantity > 0;
                            return (
                                <Card
                                    key={product.id}
                                    className={`cursor-pointer transition-all hover:ring-2 ring-primary ${!inStock ? 'opacity-50' : ''}`}
                                    onClick={() => inStock && addItem(product)}
                                >
                                    <CardContent className="p-4 flex flex-col h-full">
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
                                            {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <p className="font-bold text-primary">${product.selling_price.toFixed(2)}</p>
                                            <p className={`text-xs ${product.stock_quantity <= product.low_stock_threshold ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                                                {product.stock_quantity} left
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No products found matching &quot;{searchTerm}&quot;
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Cart Area (Desktop) */}
            <div className="hidden md:flex w-96 flex-col bg-card rounded-lg border shadow-sm p-4">
                <h2 className="font-bold text-xl border-b pb-4 mb-4">Current Order</h2>
                <CartContent />
            </div>

            {/* Cart Slide-up (Mobile) */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 border-t bg-background/80 backdrop-blur z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button className="w-full h-12 text-lg font-bold flex justify-between px-6">
                            <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> Cart ({items.length})</span>
                            <span>${total.toFixed(2)}</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh] flex flex-col rounded-t-xl">
                        <SheetHeader className="mb-4">
                            <SheetTitle>Current Order</SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-hidden">
                            <CartContent />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}
