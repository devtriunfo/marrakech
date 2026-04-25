import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface NormalizedSaleItem {
  id: string
  product_id: string
  product_name: string | null
  quantity: number
  unit_price: number
  total: number
  sold_at: string
  payment_method: string
}

interface NormalizedProduct {
  id: string
  name: string
  price: number
  stock: number
  cost_price: string | null
}

function getPeriodStart(period: string | null) {
  if (!period || period === "all") {
    return null
  }

  const days = Number.parseInt(period, 10)
  if (Number.isNaN(days) || days <= 0) {
    return null
  }

  const fromDate = new Date()
  fromDate.setHours(0, 0, 0, 0)
  fromDate.setDate(fromDate.getDate() - (days - 1))
  return fromDate.toISOString()
}

function isMissingTableError(error: { code?: string } | null) {
  return error?.code === "PGRST205"
}

async function loadSales(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fromDate: string | null,
) {
  let salesQuery = supabase
    .from("sales")
    .select("id, items, total, payment_method, sold_at")
    .order("sold_at", { ascending: false })

  if (fromDate) {
    salesQuery = salesQuery.gte("sold_at", fromDate)
  }

  const { data: salesRows, error: salesError } = await salesQuery

  if (!salesError) {
    const saleItems: NormalizedSaleItem[] = (salesRows || []).flatMap((sale) => {
      const items = Array.isArray(sale.items) ? sale.items : []

      return items.map((item, index) => ({
        id: `${sale.id}-${index}`,
        product_id: String(item.productId ?? item.product_id ?? "unknown"),
        product_name: item.productName ?? item.product_name ?? null,
        quantity: Number(item.quantity ?? 0),
        unit_price: Number(item.unitPrice ?? item.unit_price ?? 0),
        total: Number(item.subtotal ?? item.total ?? 0),
        sold_at: String(sale.sold_at),
        payment_method: String(sale.payment_method ?? "nao_informado"),
      }))
    })

    const byPaymentMethod = (salesRows || []).reduce<Record<string, { count: number; total: number }>>((acc, sale) => {
      const method = String(sale.payment_method ?? "nao_informado")
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 }
      }

      acc[method].count += 1
      acc[method].total += Number(sale.total ?? 0)
      return acc
    }, {})

    const dailyMap: Record<string, { date: string; revenue: number; count: number }> = {}
    for (const sale of salesRows || []) {
      const date = String(sale.sold_at).slice(0, 10)
      if (!dailyMap[date]) dailyMap[date] = { date, revenue: 0, count: 0 }
      dailyMap[date].revenue += Number(sale.total ?? 0)
      dailyMap[date].count += 1
    }
    const dailySales = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))

    return {
      saleCount: salesRows?.length || 0,
      saleItems,
      byPaymentMethod,
      dailySales,
    }
  }

  if (!isMissingTableError(salesError)) {
    throw salesError
  }

  let legacyQuery = supabase
    .from("vendas")
    .select("id, id_do_produto, quantidade, preco, total, vendido_em")
    .order("vendido_em", { ascending: false })

  if (fromDate) {
    legacyQuery = legacyQuery.gte("vendido_em", fromDate)
  }

  const { data: legacyRows, error: legacyError } = await legacyQuery

  if (legacyError) {
    throw legacyError
  }

  const saleItems: NormalizedSaleItem[] = (legacyRows || []).map((sale) => ({
    id: String(sale.id),
    product_id: String(sale.id_do_produto ?? "unknown"),
    product_name: null,
    quantity: Number(sale.quantidade ?? 0),
    unit_price: Number(sale.preco ?? 0),
    total: Number(sale.total ?? 0),
    sold_at: String(sale.vendido_em),
    payment_method: "nao_informado",
  }))

  const dailyMap: Record<string, { date: string; revenue: number; count: number }> = {}
  for (const item of saleItems) {
    const date = item.sold_at.slice(0, 10)
    if (!dailyMap[date]) dailyMap[date] = { date, revenue: 0, count: 0 }
    dailyMap[date].revenue += item.total
    dailyMap[date].count += 1
  }
  const dailySales = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date))

  return {
    saleCount: legacyRows?.length || 0,
    saleItems,
    byPaymentMethod: {
      nao_informado: {
        count: legacyRows?.length || 0,
        total: saleItems.reduce((sum, sale) => sum + sale.total, 0),
      },
    },
    dailySales,
  }
}

async function loadProducts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: productsRows, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, cost_price")

  if (!productsError) {
    return (productsRows || []).map((product) => ({
      id: String(product.id),
      name: String(product.name ?? ""),
      price: Number(product.price ?? 0),
      stock: Number(product.stock ?? 0),
      cost_price: product.cost_price ? String(product.cost_price) : null,
    })) satisfies NormalizedProduct[]
  }

  if (!isMissingTableError(productsError)) {
    throw productsError
  }

  const { data: legacyRows, error: legacyError } = await supabase
    .from("produtos")
    .select("id, nome, preco, estoque")

  if (legacyError) {
    throw legacyError
  }

  return (legacyRows || []).map((product) => ({
    id: String(product.id),
    name: String(product.nome ?? ""),
    price: Number(product.preco ?? 0),
    stock: Number(product.estoque ?? 0),
    cost_price: null,
  })) satisfies NormalizedProduct[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const period = request.nextUrl.searchParams.get("period")
    const fromDate = getPeriodStart(period)

    const [{ saleCount, saleItems, byPaymentMethod, dailySales }, products] = await Promise.all([
      loadSales(supabase, fromDate),
      loadProducts(supabase),
    ])

    const productMap = new Map(products.map((product) => [product.id, product]))

    const productMetrics: Record<
      string,
      {
        id: string
        name: string
        totalSold: number
        totalRevenue: number
        totalCost: number
        totalProfit: number
        averagePrice: number
        salesCount: number
      }
    > = {}

    let totalRevenue = 0
    let totalCost = 0
    let totalProfit = 0
    let totalItemsSold = 0

    saleItems.forEach((sale) => {
      const product = productMap.get(sale.product_id)
      const saleTotal = Number(sale.total) || 0
      const quantity = Number(sale.quantity) || 1
      const unitPrice = Number(sale.unit_price) || 0
      const costPrice = product?.cost_price ? Number.parseFloat(product.cost_price) : unitPrice * 0.6
      const saleCost = costPrice * quantity
      const saleProfit = saleTotal - saleCost

      totalRevenue += saleTotal
      totalCost += saleCost
      totalProfit += saleProfit
      totalItemsSold += quantity

      const productId = sale.product_id || "unknown"
      const productName = sale.product_name || product?.name || "Produto Desconhecido"

      if (!productMetrics[productId]) {
        productMetrics[productId] = {
          id: productId,
          name: productName,
          totalSold: 0,
          totalRevenue: 0,
          totalCost: 0,
          totalProfit: 0,
          averagePrice: 0,
          salesCount: 0,
        }
      }

      productMetrics[productId].totalSold += quantity
      productMetrics[productId].totalRevenue += saleTotal
      productMetrics[productId].totalCost += saleCost
      productMetrics[productId].totalProfit += saleProfit
      productMetrics[productId].salesCount += 1
    })

    Object.values(productMetrics).forEach((metric) => {
      metric.averagePrice = metric.totalSold > 0 ? metric.totalRevenue / metric.totalSold : 0
    })

    const productList = Object.values(productMetrics)
    const topSellingProducts = [...productList].sort((a, b) => b.totalSold - a.totalSold).slice(0, 10)
    const leastSellingProducts = [...productList].sort((a, b) => a.totalSold - b.totalSold).slice(0, 10)
    const mostProfitableProducts = [...productList].sort((a, b) => b.totalProfit - a.totalProfit).slice(0, 10)
    const leastProfitableProducts = [...productList].sort((a, b) => a.totalProfit - b.totalProfit).slice(0, 10)

    let totalInventoryValue = 0
    let totalInventoryCost = 0

    products.forEach((product) => {
      const price = Number(product.price) || 0
      const costPrice = product.cost_price ? Number.parseFloat(product.cost_price) : price * 0.6
      const stock = Number(product.stock) || 0
      totalInventoryValue += price * stock
      totalInventoryCost += costPrice * stock
    })

    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    const formatProduct = (product: (typeof productList)[number]) => ({
      product_id: product.id,
      product_name: product.name,
      barcode: null,
      total_quantity: product.totalSold,
      total_revenue: product.totalRevenue,
      total_cost: product.totalCost,
      total_profit: product.totalProfit,
      profit_margin: product.totalRevenue > 0 ? (product.totalProfit / product.totalRevenue) * 100 : 0,
      avg_unit_price: product.averagePrice,
    })

    const paymentMethodList = Object.entries(byPaymentMethod).map(([method, data]) => ({
      payment_method: method,
      count: data.count,
      total: data.total,
    }))

    const avgTicket = saleCount > 0 ? totalRevenue / saleCount : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_sales: saleCount,
          total_revenue: totalRevenue,
          total_cost: totalCost,
          total_profit: totalProfit,
          profit_margin: profitMargin,
          avg_ticket: avgTicket,
          total_products_sold: totalItemsSold,
        },
        top_selling: topSellingProducts.map(formatProduct),
        least_selling: leastSellingProducts.map(formatProduct),
        most_profitable: mostProfitableProducts.map(formatProduct),
        least_profitable: leastProfitableProducts.map(formatProduct),
        by_payment_method: paymentMethodList,
        daily_sales: dailySales,
        stock_levels: products
          .map((p) => ({ name: p.name, stock: p.stock, price: p.price }))
          .sort((a, b) => a.stock - b.stock),
        inventory_value: {
          total_stock_value: totalInventoryValue,
          total_cost_value: totalInventoryCost,
          potential_profit: totalInventoryValue - totalInventoryCost,
        },
      },
    })
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json(
      { error: "Erro interno ao gerar relatório" },
      { status: 500 },
    )
  }
}
