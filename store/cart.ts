import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find((i) => i.id === item.id)

        if (existingItem) {
          const newItems = items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          )
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
          set({ items: newItems, total })
        } else {
          const newItems = [...items, { ...item, quantity: 1 }]
          const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
          set({ items: newItems, total })
        }
      },

      removeItem: (id) => {
        const newItems = get().items.filter((i) => i.id !== id)
        const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        set({ items: newItems, total })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }

        const newItems = get().items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        )
        const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
        set({ items: newItems, total })
      },

      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
