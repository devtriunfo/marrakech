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
        { error: "Forma de pagamento não informada" },
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
      return NextResponse.json(
        { error: "Erro ao verificar estoque" },
        { status: 500 }
      )
    }

    // Verificar se há estoque suficiente
    const stockIssues: string[] = []
    for (const item of items) {
      const product = products?.find((p) => p.id === item.productId)
      if (!product) {
        stockIssues.push(`Produto ${item.productName} não encontrado`)
      } else if (product.stock < item.quantity) {
        stockIssues.push(
          `${item.productName}: estoque insuficiente (disponível: ${product.stock}, solicitado: ${item.quantity})`
        )
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json(
        { error: "Problemas de estoque", details: stockIssues },
        { status: 400 }
      )
    }

    // Criar a venda principal
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        payment_method: paymentMethod,
        discount: discount,
        subtotal: subtotal,
        total: total,
        notes: notes || null,
        customer_name: customerName || null,
        status: "completed",
        sold_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (saleError) {
      console.error("Erro ao criar venda:", saleError)
      return NextResponse.json(
        { error: "Erro ao registrar venda" },
        { status: 500 }
      )
    }

    // Criar os itens da venda
    const saleItems = items.map((item) => ({
      sale_id: sale.id,
      product_id: item.productId,
      product_name: item.productName,
      barcode: item.barcode,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from("sale_items")
      .insert(saleItems)

    if (itemsError) {
      console.error("Erro ao criar itens da venda:", itemsError)
      // Reverter a venda principal
      await supabase.from("sales").delete().eq("id", sale.id)
      return NextResponse.json(
        { error: "Erro ao registrar itens da venda" },
        { status: 500 }
      )
    }

    // Atualizar estoque dos produtos
    const stockUpdates = items.map(async (item) => {
      const product = products?.find((p) => p.id === item.productId)
      if (product) {
        return supabase
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", item.productId)
      }
    })

    await Promise.all(stockUpdates)

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso",
      sale: {
        id: sale.id,
        total: total,
        paymentMethod: paymentMethod,
        itemCount: items.length,
      },
    })
  } catch (error) {
    console.error("Erro no checkout:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
