import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar todas as vendas da tabela vendas
    const { data: salesRaw, error: salesError } = await supabase
      .from("vendas")
      .select("*")
      .order("vendido_em", { ascending: false })

    if (salesError) {
      console.error("Erro ao buscar vendas:", salesError)
      return NextResponse.json(
        { error: "Erro ao buscar dados de vendas" },
        { status: 500 }
      )
    }

    // Mapear vendas para formato padrao
    const sales = salesRaw?.map((s) => ({
      id: s.id,
      product_id: s.id_do_produto,
      quantity: s.quantidade,
      unit_price: s.preco,
      total: s.total,
      sold_at: s.vendido_em,
      payment_method: "nao_informado", // tabela nao tem essa coluna
    })) || []

    // Buscar todos os produtos para calcular custo e lucro
    const { data: productsRaw, error: productsError } = await supabase
      .from("produtos")
      .select("*")

    if (productsError) {
      console.error("Erro ao buscar produtos:", productsError)
      return NextResponse.json(
        { error: "Erro ao buscar dados de produtos" },
        { status: 500 }
      )
    }

    // Mapear produtos para formato padrao
    const products = productsRaw?.map((p) => ({
      id: p.id,
      name: p.nome,
      price: p.preco,
      stock: p.estoque,
      cost_price: null, // tabela nao tem essa coluna
    })) || []

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

    // Formatar produtos para o componente
    const formatProduct = (p: typeof productList[0]) => ({
      product_id: p.id,
      product_name: p.name,
      barcode: null,
      total_quantity: p.totalSold,
      total_revenue: p.totalRevenue,
      total_cost: p.totalCost,
      total_profit: p.totalProfit,
      profit_margin: p.totalRevenue > 0 ? (p.totalProfit / p.totalRevenue) * 100 : 0,
      avg_unit_price: p.averagePrice,
    })

    // Formatar vendas por forma de pagamento
    const byPaymentMethod = Object.entries(salesByPaymentMethod).map(([method, data]) => ({
      payment_method: method,
      count: data.count,
      total: data.total,
    }))

    const avgTicket = (sales?.length || 0) > 0 ? totalRevenue / (sales?.length || 1) : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_sales: sales?.length || 0,
          total_revenue: totalRevenue,
          total_cost: totalCost,
          total_profit: totalProfit,
          profit_margin: parseFloat(profitMargin),
          avg_ticket: avgTicket,
          total_products_sold: totalItemsSold,
        },
        top_selling: topSellingProducts.map(formatProduct),
        least_selling: leastSellingProducts.map(formatProduct),
        most_profitable: mostProfitableProducts.map(formatProduct),
        least_profitable: leastProfitableProducts.map(formatProduct),
        by_payment_method: byPaymentMethod,
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
      { status: 500 }
    )
  }
}
