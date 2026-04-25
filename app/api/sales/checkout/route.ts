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
      .from("produtos")
      .select("id, nome, estoque, preco")
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
      } else if (product.estoque < item.quantity) {
        stockIssues.push(
          `${item.productName}: estoque insuficiente (disponivel: ${product.estoque}, solicitado: ${item.quantity})`
        )
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json(
        { error: "Problemas de estoque", details: stockIssues },
        { status: 400 }
      )
    }

    // Criar uma venda para cada item usando a estrutura correta da tabela vendas
    const salesPromises = items.map(async (item) => {
      const { data, error } = await supabase
        .from("vendas")
        .insert({
          id_do_produto: item.productId,
          quantidade: item.quantity,
          preco: item.unitPrice,
          total: item.subtotal,
          vendido_em: new Date().toISOString(),
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
        const newStock = product.estoque - item.quantity
        await supabase
          .from("produtos")
          .update({ 
            estoque: newStock,
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
