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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(body)
      .select()
      .single()

    if (error) {
      console.error("[v0] Erro ao criar produto:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Erro inesperado ao criar:", error)
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 })
  }
}
