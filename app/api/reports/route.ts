import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar todas as vendas
    const { data: sales, error: salesError } = await supabase
      .from("sales")
      .select("*")
      .order("sold_at", { ascending: false })

    if (salesError) {
      console.error("Erro ao buscar vendas:", salesError)
      return NextResponse.json(
        { error: "Erro ao buscar dados de vendas" },
        { status: 500 }
      )
    }

    // Buscar todos os produtos para calcular custo e lucro
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")

    if (productsError) {
      console.error("Erro ao buscar produtos:", productsError)
      return NextResponse.json(
        { error: "Erro ao buscar dados de produtos" },
        { status: 500 }
      )
    }

    // Criar mapa de produtos para acesso rápido
    const productMap = new Map(products?.map((p) => [p.id, p]) || [])

    // Calcular métricas por produto
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

    sales?.forEach((sale) => {
      const product = productMap.get(sale.product_id)
      const saleTotal = parseFloat(sale.total) || 0
      const quantity = sale.quantity || 1
      const unitPrice = parseFloat(sale.unit_price) || 0
      
      // Calcular custo (se existir cost_price no produto)
      const costPrice = product?.cost_price 
        ? parseFloat(product.cost_price) 
        : unitPrice * 0.6 // Estimar 40% de margem se não tiver custo cadastrado
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

    // Calcular média de preço
    Object.values(productMetrics).forEach((metric) => {
      metric.averagePrice = metric.totalSold > 0 
        ? metric.totalRevenue / metric.totalSold 
        : 0
    })

    // Ordenar produtos por diferentes métricas
    const productList = Object.values(productMetrics)
    
    const topSellingProducts = [...productList]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10)

    const leastSellingProducts = [...productList]
      .sort((a, b) => a.totalSold - b.totalSold)
      .slice(0, 10)

    const mostProfitableProducts = [...productList]
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 10)

    const leastProfitableProducts = [...productList]
      .sort((a, b) => a.totalProfit - b.totalProfit)
      .slice(0, 10)

    // Calcular investimento total em estoque
    let totalInventoryValue = 0
    let totalInventoryCost = 0
    products?.forEach((product) => {
      const price = parseFloat(product.price) || 0
      const costPrice = product.cost_price 
        ? parseFloat(product.cost_price) 
        : price * 0.6
      const stock = product.stock || 0
      totalInventoryValue += price * stock
      totalInventoryCost += costPrice * stock
    })

    // Vendas por forma de pagamento
    const salesByPaymentMethod: Record<string, { count: number; total: number }> = {}
    sales?.forEach((sale) => {
      const method = sale.payment_method || "nao_informado"
      if (!salesByPaymentMethod[method]) {
        salesByPaymentMethod[method] = { count: 0, total: 0 }
      }
      salesByPaymentMethod[method].count += 1
      salesByPaymentMethod[method].total += parseFloat(sale.total) || 0
    })

    // Vendas por período (últimos 30 dias)
    const last30Days: Record<string, { revenue: number; profit: number; count: number }> = {}
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split("T")[0]
      last30Days[dateKey] = { revenue: 0, profit: 0, count: 0 }
    }

    sales?.forEach((sale) => {
      const saleDate = new Date(sale.sold_at).toISOString().split("T")[0]
      if (last30Days[saleDate]) {
        const saleTotal = parseFloat(sale.total) || 0
        const product = productMap.get(sale.product_id)
        const costPrice = product?.cost_price 
          ? parseFloat(product.cost_price) 
          : (parseFloat(sale.unit_price) || 0) * 0.6
        const saleCost = costPrice * (sale.quantity || 1)
        
        last30Days[saleDate].revenue += saleTotal
        last30Days[saleDate].profit += saleTotal - saleCost
        last30Days[saleDate].count += 1
      }
    })

    const profitMargin = totalRevenue > 0 
      ? ((totalProfit / totalRevenue) * 100).toFixed(1) 
      : "0"

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalCost,
          totalProfit,
          profitMargin: parseFloat(profitMargin),
          totalItemsSold,
          totalSales: sales?.length || 0,
          totalInventoryValue,
          totalInventoryCost,
        },
        topSellingProducts,
        leastSellingProducts,
        mostProfitableProducts,
        leastProfitableProducts,
        salesByPaymentMethod,
        salesByDay: Object.entries(last30Days).map(([date, data]) => ({
          date,
          ...data,
        })),
      },
    })
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json(
      { error: "Erro interno ao gerar relatório" },
      { status: 500 }
    )
  }
}
