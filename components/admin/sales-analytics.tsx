"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, TrendingUp, TrendingDown, CalendarRange, Clock, ShoppingCart, Receipt, RefreshCw } from "lucide-react"

interface ProductSale {
  productId: string
  productName: string
  barcode: string | null
  totalQuantity: number
  totalRevenue: number
  transactions: number
}

interface SalesData {
  productSales: ProductSale[]
  monthlySales: {
    monthKey: string
    monthLabel: string
    totalQuantity: number
    totalRevenue: number
    transactions: number
  }[]
  salesRecords: {
    id: string
    soldAt: string
    productId: string
    productName: string
    barcode: string | null
    quantity: number
    unitPrice: number
    total: number
  }[]
  totalSales: number
  totalQuantity: number
  totalRevenue: number
  topProduct: ProductSale | null
  lowestProduct: ProductSale | null
  topMonth: {
    monthKey: string
    monthLabel: string
    totalQuantity: number
    totalRevenue: number
    transactions: number
  } | null
  lowestMonth: {
    monthKey: string
    monthLabel: string
    totalQuantity: number
    totalRevenue: number
    transactions: number
  } | null
  historyEnabled: boolean
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]

export function SalesAnalytics() {
  const [data, setData] = useState<SalesData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [warning, setWarning] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const response = await fetch("/api/sales/analytics")
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao buscar vendas")
      }

      setData(result.data)
      setWarning(result.warning || null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados de vendas")
      setData(null)
      setWarning(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Carregando dados de vendas...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Nenhuma venda registrada ainda</div>
        </CardContent>
      </Card>
    )
  }

  const productChartData = data.productSales.map((p) => ({
    name: p.productName.substring(0, 20),
    quantidade: p.totalQuantity,
    receita: parseFloat(p.totalRevenue.toFixed(2)),
  }))
  const monthlyChartData = data.monthlySales.map((month) => ({
    mes: month.monthLabel,
    quantidade: month.totalQuantity,
    receita: parseFloat(month.totalRevenue.toFixed(2)),
  }))

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace(".", ",")}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Atualizando..." : "Atualizar Dados"}
        </Button>
      </div>

      {warning && (
        <Alert>
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Produtos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalQuantity}</div>
            <p className="text-xs text-muted-foreground mt-1">unidades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Itens de Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSales}</div>
            <p className="text-xs text-muted-foreground mt-1">registros de vendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">faturamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalQuantity > 0 ? formatCurrency(data.totalRevenue / data.totalQuantity) : "R$ 0,00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">por unidade vendida</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-green-500" />
              Mês Com Maior Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topMonth ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">{data.topMonth.monthLabel}</p>
                <p className="text-sm text-muted-foreground">
                  Receita: {formatCurrency(data.topMonth.totalRevenue)} | Quantidade: {data.topMonth.totalQuantity}
                </p>
                <p className="text-sm text-muted-foreground">Transações: {data.topMonth.transactions}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Sem vendas por mês ainda</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5 text-orange-500" />
              Mês Com Menor Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowestMonth ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">{data.lowestMonth.monthLabel}</p>
                <p className="text-sm text-muted-foreground">
                  Receita: {formatCurrency(data.lowestMonth.totalRevenue)} | Quantidade: {data.lowestMonth.totalQuantity}
                </p>
                <p className="text-sm text-muted-foreground">Transações: {data.lowestMonth.transactions}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Sem vendas por mês ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Produto Mais Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProduct ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-lg font-semibold">{data.topProduct.productName}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="text-xl font-bold">{data.topProduct.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Receita</p>
                    <p className="text-xl font-bold">{formatCurrency(data.topProduct.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transações</p>
                    <p className="text-xl font-bold">{data.topProduct.transactions}</p>
                  </div>
                </div>
                {data.topProduct.barcode && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Código de Barras</p>
                    <p className="text-sm font-mono">{data.topProduct.barcode}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum produto vendido</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Produto Menos Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.lowestProduct ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-lg font-semibold">{data.lowestProduct.productName}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Quantidade</p>
                    <p className="text-xl font-bold">{data.lowestProduct.totalQuantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Receita</p>
                    <p className="text-xl font-bold">{formatCurrency(data.lowestProduct.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transações</p>
                    <p className="text-xl font-bold">{data.lowestProduct.transactions}</p>
                  </div>
                </div>
                {data.lowestProduct.barcode && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Código de Barras</p>
                    <p className="text-sm font-mono">{data.lowestProduct.barcode}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum produto vendido</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Vendas por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          {productChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis yAxisId="left" label={{ value: "Quantidade", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Receita (R$)", angle: 90, position: "insideRight" }} />
                <Tooltip
                  formatter={(value) => {
                    if (typeof value === "number") {
                      return value.toFixed(2)
                    }
                    return value
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="quantidade" fill="#3b82f6" name="Quantidade Vendida" />
                <Bar yAxisId="right" dataKey="receita" fill="#10b981" name="Receita (R$)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado disponível
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Vendas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="quantidade"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Quantidade"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="receita"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Receita (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Nenhum dado mensal disponível
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.productSales.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <p className="font-medium">{product.productName}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Código: {product.barcode || "Não cadastrado"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Qtd</p>
                      <p className="font-semibold">{product.totalQuantity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Receita</p>
                      <p className="font-semibold">{formatCurrency(product.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Txs</p>
                      <p className="font-semibold">{product.transactions}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Historico de Vendas
            {data.salesRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {data.salesRecords.length} registro{data.salesRecords.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.salesRecords.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground font-medium">Nenhuma venda registrada ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                As vendas finalizadas na aba Vendas aparecerao aqui automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.salesRecords.slice(0, 50).map((sale, index) => {
                const isRecent = new Date().getTime() - new Date(sale.soldAt).getTime() < 3600000 // 1 hora
                return (
                  <div 
                    key={sale.id} 
                    className={`rounded-lg border p-4 transition-colors hover:bg-accent/50 ${isRecent ? "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{sale.productName}</p>
                          {isRecent && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                              <Clock className="mr-1 h-3 w-3" />
                              Recente
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Codigo: {sale.barcode || "Nao cadastrado"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(sale.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sale.soldAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground border-t pt-3">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-foreground">{sale.quantity}x</span> unidade{sale.quantity !== 1 ? "s" : ""}
                      </span>
                      <span>|</span>
                      <span>
                        Preco unitario: <span className="font-medium text-foreground">{formatCurrency(sale.unitPrice)}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
              {data.salesRecords.length > 50 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Exibindo as 50 vendas mais recentes de {data.salesRecords.length} total.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
