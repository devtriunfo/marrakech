import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo nao permitido. Use JPG, PNG, WebP ou GIF." }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Maximo 5MB." }, { status: 400 })
    }

    const timestamp = Date.now()
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.${extension}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { error: uploadError } = await supabaseAdmin.storage
      .from("products")
      .upload(filename, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      console.error("Supabase Storage error:", uploadError)
      return NextResponse.json({ error: "Erro ao fazer upload da imagem: " + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("products")
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("Erro no upload:", error)
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 })
  }
}