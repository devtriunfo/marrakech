import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface SaleItem {
  productId: string
  productName: string
  barcode: string | null
  quantity: number
  unitPrice: number
  subtotal?: number
  total?: number
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

interface NormalizedProduct {
  id: string
  name: string
  stock: number
  price: number
}

function isMissingTableError(error: { code?: string } | null) {
  return error?.code === "PGRST205"
}

async function loadProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productIds: string[],
) {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, stock, price")
    .in("id", productIds)

  if (!error) {
    return {
      schema: "current" as const,
      products: (products || []).map((product) => ({
        id: String(product.id),
        name: String(product.name ?? ""),
        stock: Number(product.stock ?? 0),
        price: Number(product.price ?? 0),
      })) satisfies NormalizedProduct[],
    }
  }

  if (!isMissingTableError(error)) {
    throw error
  }

  const { data: legacyProducts, error: legacyError } = await supabase
    .from("produtos")
    .select("id, nome, estoque, preco")
    .in("id", productIds)

  if (legacyError) {
    throw legacyError
  }

  return {
    schema: "legacy" as const,
    products: (legacyProducts || []).map((product) => ({
      id: String(product.id),
      name: String(product.nome ?? ""),
      stock: Number(product.estoque ?? 0),
      price: Number(product.preco ?? 0),
    })) satisfies NormalizedProduct[],
  }
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
    let productState: Awaited<ReturnType<typeof loadProducts>>

    try {
      productState = await loadProducts(supabase, productIds)
    } catch (productsError) {
      console.error("[v0] Erro ao buscar produtos:", productsError)
      return NextResponse.json(
        { error: "Erro ao verificar estoque" },
        { status: 500 }
      )
    }

    const { schema, products } = productState

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

    let saleNumber: number | null = null

    if (schema === "current") {
      const itemsPayload = items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        barcode: item.barcode,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal ?? item.total ?? item.unitPrice * item.quantity,
      }))

      const { data: saleRow, error: saleError } = await supabase
        .from("sales")
        .insert({
          items: itemsPayload,
          subtotal,
          discount,
          total,
          payment_method: paymentMethod,
          customer_name: customerName || null,
          notes: notes || null,
          sold_at: new Date().toISOString(),
        })
        .select("sale_number")
        .single()

      if (saleError) {
        console.error("[v0] Erro ao criar venda:", saleError)
        return NextResponse.json(
          { error: "Erro ao registrar venda: " + saleError.message },
          { status: 500 }
        )
      }

      saleNumber = saleRow?.sale_number ?? null
    } else {
      const salesPromises = items.map(async (item) => {
        const { data, error } = await supabase
          .from("vendas")
          .insert({
            id_do_produto: item.productId,
            quantidade: item.quantity,
            preco: item.unitPrice,
            total: item.subtotal ?? item.total ?? item.unitPrice * item.quantity,
            vendido_em: new Date().toISOString(),
          })
          .select()
          .single()

        return { data, error }
      })

      const salesResults = await Promise.all(salesPromises)
      const saleError = salesResults.find((result) => result.error)?.error

      if (saleError) {
        console.error("[v0] Erro ao criar venda:", saleError)
        return NextResponse.json(
          { error: "Erro ao registrar venda: " + saleError.message },
          { status: 500 }
        )
      }
    }

    // Atualizar estoque dos produtos
    for (const item of items) {
      const product = products?.find((p) => p.id === item.productId)
      if (product) {
        const newStock = product.stock - item.quantity

        if (schema === "current") {
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.productId)
        } else {
          await supabase
            .from("produtos")
            .update({ estoque: newStock })
            .eq("id", item.productId)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso",
      saleNumber,
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
