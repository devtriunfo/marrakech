"use client"

import { useState } from 'react'
import { X, Plus, Minus, Trash2, MessageCircle, Package, User, MapPin, CreditCard, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

const paymentMethods = [
  { id: 'pix', label: 'PIX' },
  { id: 'dinheiro', label: 'Dinheiro' },
  { id: 'credito', label: 'Cartao de Credito' },
  { id: 'debito', label: 'Cartao de Debito' },
]

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  
  const [step, setStep] = useState<'cart' | 'checkout'>('cart')
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateCheckout = () => {
    const newErrors: Record<string, string> = {}
    if (!customerName.trim()) newErrors.name = 'Nome e obrigatorio'
    if (!customerAddress.trim()) newErrors.address = 'Endereco e obrigatorio'
    if (!paymentMethod) newErrors.payment = 'Selecione uma forma de pagamento'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return ''

    const selectedPayment = paymentMethods.find(p => p.id === paymentMethod)?.label || paymentMethod

    let message = '*Pedido - Marrakech Tabacaria*\n\n'
    message += '*Cliente:* ' + customerName + '\n'
    message += '*Endereco:* ' + customerAddress + '\n'
    message += '*Pagamento:* ' + selectedPayment + '\n\n'
    message += '*Itens do Pedido:*\n'
    message += '─────────────────\n'

    items.forEach((item, index) => {
      const itemTotal = parsePrice(item.price) * item.quantity
      message += `\n${index + 1}. *${item.name}*\n`
      message += `   Qtd: ${item.quantity}x\n`
      message += `   Valor: R$ ${itemTotal.toFixed(2).replace('.', ',')}\n`
    })

    message += '\n─────────────────\n'
    message += `\n*TOTAL: R$ ${totalPrice.toFixed(2).replace('.', ',')}*`

    return encodeURIComponent(message)
  }

  const handleProceedToCheckout = () => {
    if (items.length === 0) return
    setStep('checkout')
  }

  const handleBackToCart = () => {
    setStep('cart')
    setErrors({})
  }

  const handleWhatsAppCheckout = () => {
    if (!validateCheckout()) return
    
    const message = generateWhatsAppMessage()
    const whatsappNumber = '5511933212450'
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    
    // Limpar tudo
    clearCart()
    setCustomerName('')
    setCustomerAddress('')
    setPaymentMethod('')
    setStep('cart')
    onClose()
  }

  const handleClose = () => {
    setStep('cart')
    setErrors({})
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={handleClose}
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
            <div className="flex items-center gap-2">
              {step === 'checkout' && (
                <Button variant="ghost" size="icon" onClick={handleBackToCart}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              <h2 className="text-xl font-semibold text-foreground">
                {step === 'cart' ? 'Seu Carrinho' : 'Finalizar Pedido'}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {step === 'cart' ? (
              // Cart Items
              items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Package className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg">Seu carrinho esta vazio</p>
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
              )
            ) : (
              // Checkout Form
              <div className="space-y-6">
                {/* Resumo dos Itens */}
                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3">Resumo do Pedido</h3>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="text-foreground font-medium">
                          R$ {(parsePrice(item.price) * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-bold text-primary">
                        R$ {totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <div className="space-y-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </Label>
                    <Input
                      id="name"
                      placeholder="Digite seu nome"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  {/* Endereco */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Endereco de Entrega
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="Rua, numero, bairro, cidade..."
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className={errors.address ? 'border-destructive' : ''}
                      rows={3}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address}</p>
                    )}
                  </div>

                  {/* Forma de Pagamento */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Forma de Pagamento
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <Button
                          key={method.id}
                          type="button"
                          variant={paymentMethod === method.id ? 'default' : 'outline'}
                          className={`justify-start ${paymentMethod === method.id ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => setPaymentMethod(method.id)}
                        >
                          {method.label}
                        </Button>
                      ))}
                    </div>
                    {errors.payment && (
                      <p className="text-sm text-destructive">{errors.payment}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border space-y-4">
              {step === 'cart' ? (
                <>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-primary text-xl">
                      R$ {totalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg"
                    onClick={handleProceedToCheckout}
                  >
                    Continuar para Finalizar
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-border text-muted-foreground hover:text-foreground"
                    onClick={clearCart}
                  >
                    Limpar Carrinho
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  onClick={handleWhatsAppCheckout}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Enviar Pedido via WhatsApp
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
