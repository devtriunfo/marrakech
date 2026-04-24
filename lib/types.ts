export interface Product {
  id: string
  name: string
  description: string | null
  barcode: string | null
  price: string
  stock: number
  image_url: string | null
  category_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  category_name?: string
  category_slug?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export interface CartItem {
  id: string
  name: string
  price: string
  image_url: string | null
  quantity: number
}
