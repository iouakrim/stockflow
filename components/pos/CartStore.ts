import { create } from 'zustand'
import { Product } from '@/types'

export type CartItem = Product & { cartQuantity: number }

type CartState = {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    total: number
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    total: 0,
    addItem: (product) => set((state) => {
        const existing = state.items.find(item => item.id === product.id)
        let newItems = []

        if (existing) {
            newItems = state.items.map(item =>
                item.id === product.id
                    ? { ...item, cartQuantity: item.cartQuantity + 1 }
                    : item
            )
        } else {
            newItems = [...state.items, { ...product, cartQuantity: 1 }]
        }

        return {
            items: newItems,
            total: newItems.reduce((acc, item) => acc + (item.selling_price * item.cartQuantity), 0)
        }
    }),
    removeItem: (productId) => set((state) => {
        const newItems = state.items.filter(item => item.id !== productId)
        return {
            items: newItems,
            total: newItems.reduce((acc, item) => acc + (item.selling_price * item.cartQuantity), 0)
        }
    }),
    updateQuantity: (productId, quantity) => set((state) => {
        if (quantity <= 0) return state // Do nothing if <= 0, should use removeItem

        const newItems = state.items.map(item =>
            item.id === productId ? { ...item, cartQuantity: quantity } : item
        )
        return {
            items: newItems,
            total: newItems.reduce((acc, item) => acc + (item.selling_price * item.cartQuantity), 0)
        }
    }),
    clearCart: () => set({ items: [], total: 0 }),
}))
