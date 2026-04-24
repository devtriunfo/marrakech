import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET() {
  try {
    const { data: sales, error } = await supabaseAdmin
      .from("sales")
      .select("id, product_id, quantity, price, total, sold_at")
      .order("sold_at", { ascending: false })

    if (error) {
      // Nao quebrar dashboard quando tabela/relacao ainda nao estiver pronta.
      return NextResponse.json({
        success: true,
        data: {
          productSales: [],
          monthlySales: [],
          salesRecords: [],
          totalSales: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          topProduct: null,
          lowestProduct: null,
          topMonth: null,
          lowestMonth: null,
          historyEnabled: false,
        },
        warning: "Historico de vendas indisponivel no banco (tabela sales nao encontrada ou sem permissao).",
      })
    }

    const productIds = Array.from(new Set((sales || []).map((sale) => sale.product_id)))
    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, barcode")
      .in("id", productIds)
    const productsById = new Map((products || []).map((product) => [product.id, product]))

    // Agrupar por produto para calcular total vendido
    const productSalesMap = new Map<
      string,
      { productId: string; productName: string; barcode: string | null; totalQuantity: number; totalRevenue: number; transactions: number }
    >()
    const monthlySalesMap = new Map<
      string,
      { monthKey: string; monthLabel: string; totalQuantity: number; totalRevenue: number; transactions: number }
    >()
    const salesRecords: Array<{
      id: string
      soldAt: string
      productId: string
      productName: string
      barcode: string | null
      quantity: number
      unitPrice: number
      total: number
    }> = []

    for (const sale of sales || []) {
      const key = sale.product_id
      const existing = productSalesMap.get(key)
      const saleDate = new Date(sale.sold_at)
      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, "0")}`
      const monthLabel = saleDate.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
      const monthExisting = monthlySalesMap.get(monthKey)
      const saleTotal = Number(sale.total)
      const unitPrice = Number(sale.price)

      salesRecords.push({
        id: sale.id,
        soldAt: sale.sold_at,
        productId: sale.product_id,
        productName: productsById.get(sale.product_id)?.name || "Produto desconhecido",
        barcode: productsById.get(sale.product_id)?.barcode || null,
        quantity: sale.quantity,
        unitPrice,
        total: saleTotal,
      })

      if (existing) {
        existing.totalQuantity += sale.quantity
        existing.totalRevenue += saleTotal
        existing.transactions += 1
      } else {
        productSalesMap.set(key, {
          productId: sale.product_id,
          productName: productsById.get(sale.product_id)?.name || "Produto desconhecido",
          barcode: productsById.get(sale.product_id)?.barcode || null,
          totalQuantity: sale.quantity,
          totalRevenue: saleTotal,
          transactions: 1,
        })
      }

      if (monthExisting) {
        monthExisting.totalQuantity += sale.quantity
        monthExisting.totalRevenue += saleTotal
        monthExisting.transactions += 1
      } else {
        monthlySalesMap.set(monthKey, {
          monthKey,
          monthLabel,
          totalQuantity: sale.quantity,
          totalRevenue: saleTotal,
          transactions: 1,
        })
      }
    }

    // Converter para array e ordenar
    const productSales = Array.from(productSalesMap.values()).sort(
      (a, b) => b.totalQuantity - a.totalQuantity
    )
    const monthlySales = Array.from(monthlySalesMap.values()).sort(
      (a, b) => a.monthKey.localeCompare(b.monthKey)
    )

    // Calcular totais gerais
    const totalSales = salesRecords.length
    const totalQuantity = productSales.reduce((sum, p) => sum + p.totalQuantity, 0)
    const totalRevenue = productSales.reduce((sum, p) => sum + p.totalRevenue, 0)
    const topMonth = [...monthlySales].sort((a, b) => b.totalRevenue - a.totalRevenue)[0] || null
    const lowestMonth = [...monthlySales].sort((a, b) => a.totalRevenue - b.totalRevenue)[0] || null

    return NextResponse.json({
      success: true,
      data: {
        productSales,
        monthlySales,
        salesRecords,
        totalSales,
        totalQuantity,
        totalRevenue,
        topProduct: productSales[0] || null,
        lowestProduct: productSales[productSales.length - 1] || null,
        topMonth,
        lowestMonth,
        historyEnabled: true,
      },
      warning: null,
    })
  } catch (error) {
    console.error("[v0] Erro inesperado ao buscar vendas:", error)
    return NextResponse.json({ error: "Erro ao buscar vendas" }, { status: 500 })
  }
}
