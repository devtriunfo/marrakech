"use client"

import { X, Plus, Minus, Trash2, MessageCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import Image from 'next/image'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

function parsePrice(price: string): number {
  const num = parseFloat(price)
  return isNaN(num) ? 0 : num
}

function formatPrice(price: string): string {
  const num = parseFloat(price)
  if (isNaN(num)) return `R$ ${price}`
  return `R$ ${num.toFixed(2).replace('.', ',')}`
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return ''

    let message = '🌿 *Pedido - Marrakech Tabacaria*\n\n'
    message += '📋 *Itens do Pedido:*\n'
    message += '─────────────────\n'

    items.forEach((item, index) => {
      const itemTotal = parsePrice(item.price) * item.quantity
      message += `\n${index + 1}. *${item.name}*\n`
      message += `   Qtd: ${item.quantity}x\n`
      message += `   Valor: R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`
    })

    message += '\n─────────────────\n'
    message += `\n💰 *TOTAL: R$ ${totalPrice.toFixed(2).replace('.', ',')}*\n`
    message += '\n─────────────────\n'
    message += '\n📍 *Informações para entrega:*\n'
    message += 'Nome:\n'
    message += 'Endereço:\n'
    message += 'Forma de pagamento:\n'

    return encodeURIComponent(message)
  }

  const handleWhatsAppCheckout = () => {
    const message = generateWhatsAppMessage()
    const whatsappNumber = '5511933212450'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    clearCart()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Seu Carrinho</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Package className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg">Seu carrinho está vazio</p>
                <p className="text-sm mt-2">Adicione produtos para continuar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-secondary rounded-lg"
                  >
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-primary font-semibold mt-1">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-border"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-border"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary text-xl">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                onClick={handleWhatsAppCheckout}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Finalizar via WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-foreground"
                onClick={clearCart}
              >
                Limpar Carrinho
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
