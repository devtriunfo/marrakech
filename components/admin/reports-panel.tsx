"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Award,
  Target,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

interface ProductReport {
  product_id: string
  product_name: string
  barcode: string | null
  total_quantity: number
  total_revenue: number
  total_cost: number
  total_profit: number
  profit_margin: number
  avg_unit_price: number
}

interface ReportData {
  summary: {
    total_sales: number
    total_revenue: number
    total_cost: number
    total_profit: number
    profit_margin: number
    avg_ticket: number
    total_products_sold: number
  }
  top_selling: ProductReport[]
  least_selling: ProductReport[]
  most_profitable: ProductReport[]
  least_profitable: ProductReport[]
  by_payment_method: {
    payment_method: string
    count: number
    total: number
  }[]
  inventory_value: {
    total_stock_value: number
    total_cost_value: number
    potential_profit: number
  }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return "0.0%"
  return `${value.toFixed(1)}%`
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    dinheiro: "Dinheiro",
    pix: "PIX",
    credito: "Cartao de Credito",
    debito: "Cartao de Debito",
  }
  return labels[method] || method
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
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fetchReports()}
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const { summary, top_selling, least_selling, most_profitable, least_profitable, by_payment_method, inventory_value } = data

  return (
    <div className="space-y-6">
      {/* Filtros e Acoes */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
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
        </div>
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
            <p className="text-xs text-muted-foreground">
              Ticket medio: {formatPrice(summary.avg_ticket)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {formatPrice(summary.total_cost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor investido em produtos vendidos
            </p>
          </CardContent>
        </Card>

        <Card className={summary.total_profit >= 0 ? "border-green-500/30" : "border-red-500/30"}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Total
            </CardTitle>
            <PiggyBank className={`h-4 w-4 ${summary.total_profit >= 0 ? "text-green-500" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.total_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {formatPrice(summary.total_profit)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {summary.profit_margin >= 0 ? (
                <ArrowUpRight className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-500" />
              )}
              <span className={summary.profit_margin >= 0 ? "text-green-500" : "text-red-500"}>
                {formatPercent(summary.profit_margin)} de margem
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valor do Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Valor do Estoque Atual
          </CardTitle>
          <CardDescription>
            Resumo do valor investido e potencial de lucro do estoque atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Valor de Venda (Estoque)</p>
              <p className="text-xl font-bold">{formatPrice(inventory_value.total_stock_value)}</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary">
              <p className="text-sm text-muted-foreground">Custo Total (Investido)</p>
              <p className="text-xl font-bold text-orange-500">{formatPrice(inventory_value.total_cost_value)}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/20">
              <p className="text-sm text-muted-foreground">Lucro Potencial</p>
              <p className="text-xl font-bold text-green-600">{formatPrice(inventory_value.potential_profit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {top_selling.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {top_selling.map((product, index) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium">{product.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{product.total_quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.total_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Produtos Menos Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Produtos Menos Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {least_selling.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {least_selling.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <span className="font-medium">{product.product_name}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{product.total_quantity}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(product.total_revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Maior Lucro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              Produtos com Maior Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {most_profitable.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {most_profitable.map((product, index) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Award className="h-4 w-4 text-green-500" />}
                          <span className="font-medium">{product.product_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatPrice(product.total_profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {formatPercent(product.profit_margin)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Menor Lucro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Produtos com Menor Lucro
            </CardTitle>
          </CardHeader>
          <CardContent>
            {least_profitable.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Lucro</TableHead>
                    <TableHead className="text-right">Margem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {least_profitable.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <span className="font-medium">{product.product_name}</span>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${product.total_profit >= 0 ? "text-orange-500" : "text-red-500"}`}>
                        {formatPrice(product.total_profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={product.profit_margin < 10 ? "border-orange-500 text-orange-500" : ""}>
                          {formatPercent(product.profit_margin)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendas por Forma de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vendas por Forma de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {by_payment_method.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {by_payment_method.map((method) => (
                <div
                  key={method.payment_method}
                  className="p-4 rounded-lg border bg-card"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {getPaymentMethodLabel(method.payment_method)}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {formatPrice(method.total)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {method.count} venda{method.count !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
