"use client"

import { useState, useRef, useEffect } from "react"
import { Product } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  QrCode,
  Receipt,
  CheckCircle2,
  Package,
  User,
  Calendar,
  X,
} from "lucide-react"
import Image from "next/image"

interface CartItem {
  product: Product
  quantity: number
}

interface PDVProps {
  products: Product[]
}

const PAYMENT_METHODS = [
  { value: "dinheiro", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "PIX", icon: QrCode },
  { value: "credito", label: "Cartao Credito", icon: CreditCard },
  { value: "debito", label: "Cartao Debito", icon: CreditCard },
]

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price)
}

function parsePrice(price: string | number): number {
  if (typeof price === "number") return price
  return parseFloat(price.replace(",", ".")) || 0
}

export function PDV({ products }: PDVProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [notes, setNotes] = useState("")
  const [discount, setDiscount] = useState<number>(0)
  const [cashReceived, setCashReceived] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [lastSaleNumber, setLastSaleNumber] = useState<number | null>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Filtrar produtos pela busca
  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(search) ||
      product.barcode?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    )
  })

  // Calculos do carrinho
  const subtotal = cart.reduce((sum, item) => {
    return sum + parsePrice(item.product.price) * item.quantity
  }, 0)

  const total = subtotal - discount
  const change = cashReceived > 0 ? cashReceived - total : 0

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(
          cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        )
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { product, quantity: 1 }])
      }
    }
  }

  // Buscar por codigo de barras
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const product = products.find(
      (p) => p.barcode?.toLowerCase() === barcodeInput.toLowerCase()
    )

    if (product) {
      addToCart(product)
      setBarcodeInput("")
    } else {
      alert("Produto nao encontrado com esse codigo de barras")
    }

    barcodeInputRef.current?.focus()
  }

  // Atualizar quantidade
  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQuantity = item.quantity + delta
            if (newQuantity <= 0) return null
            if (newQuantity > item.product.stock) return item
            return { ...item, quantity: newQuantity }
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  // Remover do carrinho
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  // Limpar carrinho
  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setCustomerName("")
    setNotes("")
    setPaymentMethod("")
    setCashReceived(0)
  }

  // Finalizar venda
  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      alert("Adicione produtos ao carrinho")
      return
    }

    if (!paymentMethod) {
      alert("Selecione a forma de pagamento")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/sales/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            barcode: item.product.barcode,
            quantity: item.quantity,
            unitPrice: parsePrice(item.product.price),
            total: parsePrice(item.product.price) * item.quantity,
          })),
          subtotal,
          discount,
          total,
          paymentMethod,
          customerName: customerName || null,
          notes: notes || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao finalizar venda")
      }

      setLastSaleNumber(data.saleNumber)
      setShowSuccessDialog(true)
      clearCart()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro ao finalizar venda")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Focar no input de codigo de barras ao carregar
  useEffect(() => {
    barcodeInputRef.current?.focus()
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Coluna da Esquerda - Produtos */}
      <div className="lg:col-span-2 space-y-4">
        {/* Busca por codigo de barras */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Leia ou digite o codigo de barras..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="pl-10 h-12 text-lg"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" size="lg" className="px-6">
                <Plus className="h-5 w-5 mr-2" />
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Busca por nome */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Produtos Disponiveis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produto por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((item) => item.product.id === product.id)
                  const availableStock = product.stock - (inCart?.quantity || 0)

                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      disabled={availableStock <= 0}
                      className="flex items-center gap-3 p-3 rounded-lg border text-left transition-colors hover:bg-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-primary font-semibold">
                            {formatPrice(parsePrice(product.price))}
                          </span>
                          <Badge
                            variant={availableStock > 0 ? "secondary" : "destructive"}
                            className="text-xs"
                          >
                            {availableStock} un.
                          </Badge>
                        </div>
                        {product.barcode && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.barcode}
                          </p>
                        )}
                      </div>
                      <Plus className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </button>
                  )
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-muted-foreground">
                    Nenhum produto encontrado
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Coluna da Direita - Carrinho */}
      <div className="space-y-4">
        <Card className="sticky top-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
                {cart.length > 0 && (
                  <Badge variant="secondary">{cart.length}</Badge>
                )}
              </CardTitle>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Carrinho vazio</p>
                <p className="text-sm">Adicione produtos para iniciar a venda</p>
              </div>
            ) : (
              <>
                <ScrollArea className="max-h-[250px]">
                  <div className="space-y-3 pr-3">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-primary font-semibold">
                            {formatPrice(parsePrice(item.product.price) * item.quantity)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Info do Cliente */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Cliente (opcional)
                    </Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nome do cliente"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Forma de Pagamento *
                    </Label>
                    <Select 
                      value={paymentMethod} 
                      onValueChange={(value) => {
                        setPaymentMethod(value)
                        if (value !== "dinheiro") {
                          setCashReceived(0)
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <method.icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campo de Troco - Apenas para Dinheiro */}
                  {paymentMethod === "dinheiro" && (
                    <div className="p-3 rounded-lg bg-secondary/50 border space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Valor Recebido (R$)
                        </Label>
                        <div className="relative mt-1">
                          <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0,00"
                            value={cashReceived || ""}
                            onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      {cashReceived > 0 && (
                        <div className={`p-3 rounded-lg ${change >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {change >= 0 ? 'Troco a devolver:' : 'Valor insuficiente:'}
                            </span>
                            <span className={`text-xl font-bold ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {change >= 0 ? formatPrice(change) : formatPrice(Math.abs(change))}
                            </span>
                          </div>
                          {change < 0 && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              Faltam {formatPrice(Math.abs(change))} para completar o valor
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Desconto (R$)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={discount || ""}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto</span>
                      <span className="text-destructive">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base"
                  onClick={handleFinalizeSale}
                  disabled={isSubmitting || cart.length === 0 || !paymentMethod}
                >
                  {isSubmitting ? (
                    "Processando..."
                  ) : (
                    <>
                      <Receipt className="h-5 w-5 mr-2" />
                      Finalizar Venda
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Data atual */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Venda Finalizada!
            </DialogTitle>
            <DialogDescription>
              A venda foi registrada com sucesso no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-center">
            <p className="text-3xl font-bold text-primary">
              Venda #{lastSaleNumber}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              O estoque foi atualizado automaticamente.
            </p>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                setShowSuccessDialog(false)
                barcodeInputRef.current?.focus()
              }}
            >
              Nova Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
