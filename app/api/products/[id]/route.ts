import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Criar cliente admin com service role key para bypass de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "ID do produto não fornecido" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[v0] Erro ao deletar produto:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro inesperado ao deletar:", error)
    return NextResponse.json({ error: "Erro ao excluir produto" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = {
      ...body,
      barcode: body?.barcode?.trim() || null,
    }

    if (!id) {
      return NextResponse.json({ error: "ID do produto não fornecido" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", id)

    if (error) {
      console.error("[v0] Erro ao atualizar produto:", error)
      if (error.code === "23505" && error.message.toLowerCase().includes("barcode")) {
        return NextResponse.json({ error: "Já existe um produto com esse código de barras" }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Erro inesperado ao atualizar:", error)
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 })
  }
}
