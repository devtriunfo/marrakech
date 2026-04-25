"use client"

import { useMemo, useState } from "react"
import { AlertCircle, Barcode, CheckCircle2, ExternalLink, Package, Plus, Search, Trash2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Product } from "@/lib/types"

type SaleItem = {
  product: Product
  quantity: number
}

interface SalesPanelProps {
  products: Product[]
}

function parsePrice(price: string) {
  const value = parseFloat(price)
  return Number.isNaN(value) ? 0 : value
}

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace(".", ",")}`
}

export function SalesPanel({ products }: SalesPanelProps) {
  const [barcodeInput, setBarcodeInput] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [items, setItems] = useState<SaleItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [lastSale, setLastSale] = useState<{
    items: SaleItem[]
    total: number
    date: Date
  } | null>(null)

  const availableProducts = useMemo(
    () => products.filter((product) => product.is_active),
    [products]
  )

  const addProductToSale = (product: Product) => {
    if (product.stock <= 0) {
      setError("Produto sem estoque para venda")
      setSuccess(null)
      return
    }

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) {
          setError("Quantidade máxima em estoque já adicionada")
          setSuccess(null)
          return currentItems
        }

        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...currentItems, { product, quantity: 1 }]
    })

    setError(null)
    setSuccess(`Produto ${product.name} adicionado à venda`)
  }

  const handleBarcodeSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const barcode = barcodeInput.trim()
    if (!barcode) return

    const product = availableProducts.find((item) => item.barcode === barcode)

    if (!product) {
      setError("Nenhum produto encontrado para este código de barras")
      setSuccess(null)
      return
    }

    addProductToSale(product)
    setBarcodeInput("")
  }

  const searchedProducts = useMemo(() => {
    const search = searchInput.trim().toLowerCase()

    if (!search) {
      return availableProducts
    }

    return availableProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(search) ||
        (product.barcode || "").toLowerCase().includes(search)
    )
  }, [availableProducts, searchInput])

  const updateQuantity = (productId: string, nextQuantity: number) => {
    setItems((currentItems) => {
      if (nextQuantity <= 0) {
        return currentItems.filter((item) => item.product.id !== productId)
      }

      return currentItems.map((item) => {
        if (item.product.id !== productId) return item

        const maxStock = item.product.stock
        if (nextQuantity > maxStock) return item

        return { ...item, quantity: nextQuantity }
      })
    })
  }

  const removeItem = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.product.id !== productId))
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = items.reduce((sum, item) => sum + parsePrice(item.product.price) * item.quantity, 0)

  const finishSale = async () => {
    if (items.length === 0) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/sales/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível finalizar a venda")
      }

      // Salvar última venda para exibir resumo
      setLastSale({
        items: [...items],
        total: totalValue,
        date: new Date(),
      })

      setItems([])
      setSuccess(
        data.warning || "Venda finalizada com sucesso! Estoque atualizado e registrado no controle de vendas."
      )
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Erro ao finalizar venda"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Leitura de Codigo de Barras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBarcodeSubmit} className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={barcodeInput}
                  onChange={(event) => setBarcodeInput(event.target.value)}
                  placeholder="Escaneie ou digite o codigo de barras"
                  autoFocus
                />
                <Button type="submit">Adicionar por Codigo</Button>
              </form>
              <p className="text-xs text-muted-foreground">
                Dica: a maioria dos leitores envia o codigo e Enter automaticamente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Busca de Produtos para Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por nome ou codigo de barras (opcional)"
              />

              <div className="space-y-2">
                {searchInput.trim().length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Exibindo todos os produtos ativos. Digite para filtrar.
                  </p>
                )}

                {searchedProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum produto encontrado.</p>
                )}

                {searchedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Codigo: {product.barcode || "Nao cadastrado"} | Estoque: {product.stock}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addProductToSale(product)}
                      disabled={product.stock <= 0}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Adicionar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="flex flex-col gap-2">
                <span>{success}</span>
                <Link 
                  href="/admin/controle-vendas" 
                  className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                >
                  Ver no Controle de Vendas
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {lastSale && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Ultima Venda Finalizada
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {lastSale.date.toLocaleString("pt-BR")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {lastSale.items.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-sm">
                      <span>{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">
                        {formatPrice(parsePrice(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold">Total da Venda</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(lastSale.total)}
                  </span>
                </div>
                <div className="pt-2">
                  <Link href="/admin/controle-vendas">
                    <Button variant="outline" className="w-full" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver Todas as Vendas no Controle
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resumo da Venda</span>
              <Badge variant="secondary">{totalItems} itens</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                <Package className="mx-auto mb-2 h-6 w-6" />
                Nenhum produto na venda.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(parsePrice(item.product.price))} cada
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrice(parsePrice(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <div className="mb-4 flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalValue)}</span>
              </div>
              <Button
                type="button"
                className="w-full"
                disabled={items.length === 0 || submitting}
                onClick={finishSale}
              >
                {submitting ? "Finalizando..." : "Finalizar Venda"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produtos na Venda ({totalItems} itens)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              <Package className="mx-auto mb-2 h-8 w-8" />
              Nenhum produto adicionado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                      <span>Codigo: {item.product.barcode || "Não cadastrado"}</span>
                      <span>Preço: {formatPrice(parsePrice(item.product.price))}</span>
                      <span>Estoque: {item.product.stock} un.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Quantidade</p>
                      <p className="text-lg font-semibold">{item.quantity}x</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatPrice(parsePrice(item.product.price) * item.quantity)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
