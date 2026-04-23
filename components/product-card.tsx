"use client"

import { Plus, Check, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import Image from 'next/image'
import type { Product } from '@/lib/types'

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const isInCart = items.some(item => item.id === product.id)
  const cartItem = items.find(item => item.id === product.id)

  const handleAddToCart = () => {
    if (product.stock <= 0) return
    setIsAdding(true)
    addItem(product)
    setTimeout(() => setIsAdding(false), 500)
  }

  // Format price for display
  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    if (isNaN(num)) return `R$ ${price}`
    return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
      <div className="aspect-square relative bg-secondary overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        {isInCart && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs font-medium">
            {cartItem?.quantity}x no carrinho
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Esgotado
            </span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full px-2 py-1 text-xs font-medium">
            Últimas {product.stock} unidades
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-lg leading-tight mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description || "Sem descrição"}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`transition-all duration-300 ${
              isAdding 
                ? 'bg-green-600 hover:bg-green-600' 
                : isOutOfStock
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            } text-primary-foreground`}
          >
            {isAdding ? (
              <Check className="h-4 w-4" />
            ) : isOutOfStock ? (
              'Indisponível'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
