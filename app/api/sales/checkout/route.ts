import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface SaleItem {
  productId: string
  productName: string
  barcode: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

interface CheckoutRequest {
  items: SaleItem[]
  paymentMethod: string
  discount: number
  subtotal: number
  total: number
  notes?: string
  customerName?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body: CheckoutRequest = await request.json()

    const { items, paymentMethod, discount, subtotal, total, notes, customerName } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item na venda" },
        { status: 400 }
      )
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Forma de pagamento nao informada" },
        { status: 400 }
      )
    }

    // Verificar estoque de todos os produtos
    const productIds = items.map((item) => item.productId)
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, stock, price")
      .in("id", productIds)

    if (productsError) {
      console.error("[v0] Erro ao buscar produtos:", productsError)
      return NextResponse.json(
        { error: "Erro ao verificar estoque" },
        { status: 500 }
      )
    }

    // Verificar se ha estoque suficiente
    const stockIssues: string[] = []
    for (const item of items) {
      const product = products?.find((p) => p.id === item.productId)
      if (!product) {
        stockIssues.push(`Produto ${item.productName} nao encontrado`)
      } else if (product.stock < item.quantity) {
        stockIssues.push(
          `${item.productName}: estoque insuficiente (disponivel: ${product.stock}, solicitado: ${item.quantity})`
        )
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json(
        { error: "Problemas de estoque", details: stockIssues },
        { status: 400 }
      )
    }

    // Criar uma venda para cada item (estrutura simples que funciona com a tabela existente)
    const salesPromises = items.map(async (item) => {
      const { data, error } = await supabase
        .from("sales")
        .insert({
          product_id: item.productId,
          product_name: item.productName,
          barcode: item.barcode,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total: item.subtotal,
          payment_method: paymentMethod,
          sold_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      return { data, error }
    })

    const salesResults = await Promise.all(salesPromises)
    const saleError = salesResults.find(r => r.error)?.error

    if (saleError) {
      console.error("[v0] Erro ao criar venda:", saleError)
      return NextResponse.json(
        { error: "Erro ao registrar venda: " + saleError.message },
        { status: 500 }
      )
    }

    // Atualizar estoque dos produtos
    for (const item of items) {
      const product = products?.find((p) => p.id === item.productId)
      if (product) {
        const newStock = product.stock - item.quantity
        await supabase
          .from("products")
          .update({ 
            stock: newStock,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.productId)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso",
      sale: {
        total: total,
        paymentMethod: paymentMethod,
        itemCount: items.length,
      },
    })
  } catch (error) {
    console.error("[v0] Erro no checkout:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
