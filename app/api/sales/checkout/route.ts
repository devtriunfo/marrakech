import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

type CheckoutItem = {
  productId: string
  quantity: number
}

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = (body?.items || []) as CheckoutItem[]

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Nenhum item enviado para a venda" }, { status: 400 })
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)))

    const { data: products, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("id, name, stock, price")
      .in("id", productIds)

    if (fetchError) {
      return NextResponse.json({ error: "Erro ao buscar produtos para venda" }, { status: 500 })
    }

    const productsById = new Map((products || []).map((product) => [product.id, product]))

    for (const item of items) {
      const product = productsById.get(item.productId)

      if (!product) {
        return NextResponse.json({ error: "Produto da venda nao encontrado" }, { status: 404 })
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: "Quantidade invalida na venda" }, { status: 400 })
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${product.name}` },
          { status: 409 }
        )
      }
    }

    let salesHistoryUnavailable = false

    // Registrar vendas e atualizar estoque
    for (const item of items) {
      const product = productsById.get(item.productId)
      if (!product) continue

      const unitPrice = Number(product.price)
      const totalPrice = unitPrice * item.quantity

      // Registrar venda
      if (!salesHistoryUnavailable) {
        const { error: saleError } = await supabaseAdmin
          .from("sales")
          .insert({
            product_id: item.productId,
            quantity: item.quantity,
            price: unitPrice,
            total: totalPrice,
            sold_at: new Date().toISOString(),
          })

        if (saleError) {
          // Nao bloquear a venda por falha no historico; manter apenas aviso.
          console.error("[v0] Erro ao registrar venda:", saleError)
          salesHistoryUnavailable = true
        }
      }

      // Atualizar estoque
      const { error: updateError } = await supabaseAdmin
        .from("products")
        .update({
          stock: product.stock - item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.productId)

      if (updateError) {
        return NextResponse.json({ error: "Erro ao atualizar estoque" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      warning: salesHistoryUnavailable
        ? "Venda finalizada, mas o historico nao foi salvo. Verifique a tabela sales no banco"
        : null,
    })
  } catch (error) {
    console.error("[v0] Erro inesperado ao finalizar venda:", error)
    return NextResponse.json({ error: "Erro ao finalizar venda" }, { status: 500 })
  }
}
