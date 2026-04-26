"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  ShoppingCart,
  DollarSign,
  Package,
  RefreshCw,
  AlertTriangle,
  Receipt,
} from "lucide-react"

interface DailySale {
  date: string
  revenue: number
  count: number
}

interface ProductReport {
  product_id: string
  product_name: string
  total_quantity: number
  total_revenue: number
}

interface PaymentMethod {
  payment_method: string
  count: number
  total: number
}

interface StockItem {
  name: string
  stock: number
  price: number
}

interface ReportData {
  summary: {
    total_sales: number
    total_revenue: number
    avg_ticket: number
    total_products_sold: number
  }
  daily_sales: DailySale[]
  top_selling: ProductReport[]
  least_selling: ProductReport[]
  by_payment_method: PaymentMethod[]
  stock_levels: StockItem[]
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatShortDate(dateStr: string): string {
  const [, month, day] = dateStr.split("-")
  return `${day}/${month}`
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    credito: "Credito",
    debito: "Debito",
    nao_informado: "Outros",
  }
  return labels[method] || method
}

const PIE_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#6366f1"]

function CustomTooltipRevenue({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p className="text-primary">{formatPrice(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

function CustomTooltipQty({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-medium mb-1">{label}</p>
        <p>{payload[0].value} unidades</p>
      </div>
    )
  }
  return null
}

export function ReportsPanel() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState("30")

  const fetchReports = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch(`/api/reports?period=${period}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao carregar relatorios")
      }

      setData(result.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button variant="outline" className="mt-4" onClick={() => fetchReports()}>
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const {
    summary,
    daily_sales = [],
    top_selling = [],
    least_selling = [],
    by_payment_method = [],
    stock_levels = [],
  } = data

  const topSellingChart = top_selling.slice(0, 10).map((p) => ({
    name: p.product_name.length > 18 ? p.product_name.slice(0, 18) + "..." : p.product_name,
    fullName: p.product_name,
    qty: p.total_quantity,
    revenue: p.total_revenue,
  }))

  const paymentChart = by_payment_method.map((m, i) => ({
    name: getPaymentMethodLabel(m.payment_method),
    value: m.total,
    count: m.count,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }))

  const lowStockChart = stock_levels.slice(0, 12).map((p) => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + "..." : p.name,
    fullName: p.name,
    stock: p.stock,
  }))

  const leastSellingChart = least_selling.slice(0, 10).map((p) => ({
    name: p.product_name.length > 18 ? p.product_name.slice(0, 18) + "..." : p.product_name,
    fullName: p.product_name,
    qty: p.total_quantity,
  }))

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ultimos 7 dias</SelectItem>
            <SelectItem value="30">Ultimos 30 dias</SelectItem>
            <SelectItem value="90">Ultimos 90 dias</SelectItem>
            <SelectItem value="365">Ultimo ano</SelectItem>
            <SelectItem value="all">Todo periodo</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchReports(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Vendas
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_sales}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total_products_sold} produtos vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(summary.total_revenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Medio
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(summary.avg_ticket)}
            </div>
            <p className="text-xs text-muted-foreground">por venda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produtos em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stock_levels.length}</div>
            <p className="text-xs text-muted-foreground">
              {stock_levels.filter((p) => p.stock === 0).length} sem estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards por Forma de Pagamento */}
      {(() => {
        const methods = [
          { key: "pix", label: "PIX", color: "text-green-600" },
          { key: "dinheiro", label: "Dinheiro", color: "text-yellow-600" },
          { key: "credito", label: "Cartao de Credito", color: "text-blue-600" },
          { key: "debito", label: "Cartao de Debito", color: "text-purple-600" },
        ]
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {methods.map(({ key, label, color }) => {
              const entry = by_payment_method.find((m) => m.payment_method === key)
              return (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl font-bold ${color}`}>
                      {formatPrice(entry?.total ?? 0)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry?.count ?? 0} venda{(entry?.count ?? 0) !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      })()}

      {/* Faturamento por Dia */}
      {daily_sales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Faturamento por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily_sales} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `R$${v}`}
                  tick={{ fontSize: 11 }}
                  width={64}
                />
                <Tooltip content={<CustomTooltipRevenue />} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Graficos lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topSellingChart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topSellingChart}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltipQty />} />
                  <Bar dataKey="qty" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Formas de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Formas de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentChart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={paymentChart}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {paymentChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), "Total"]}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Estoque Atual - menor para maior */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estoque Atual (Menor para Maior)</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockChart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum produto cadastrado</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={lowStockChart}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} unidades`, "Estoque"]}
                  />
                  <Bar dataKey="stock" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Produtos Menos Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos Menos Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {leastSellingChart.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma venda registrada</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={leastSellingChart}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltipQty />} />
                  <Bar dataKey="qty" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
