import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, icon } = body

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: "Nome e slug são obrigatórios" }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("categories")
      .insert({ name, slug, icon: icon || null })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Erro ao criar categoria:", error)
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, slug, icon } = body

    if (!id || !name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: "ID, nome e slug são obrigatórios" }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("categories")
      .update({ name, slug, icon: icon || null })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error)
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao deletar categoria:", error)
    return NextResponse.json({ error: "Erro ao deletar categoria" }, { status: 500 })
  }
}
