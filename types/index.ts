export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  comparePrice: number | null
  images: string[]
  category: string
  stock: number
  sku: string | null
  isActive: boolean
  featured: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  slug: string
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  status: OrderStatus
  total: number
  subtotal: number
  tax: number
  shipping: number
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  paymentMethod: string | null
  stripeSessionId: string | null
  shippingAddress: Address
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export type UserRole = 'CUSTOMER' | 'ADMIN'
