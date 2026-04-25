import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function addBarcodes() {
  console.log("Buscando produtos ativos...")

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("created_at")
    .limit(3)

  if (error) {
    console.error("Erro ao buscar produtos:", error)
    return
  }

  if (!products || products.length === 0) {
    console.log("Nenhum produto encontrado")
    return
  }

  const barcodes = ["7891234567890", "7891234567891", "7891234567892"]

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const barcode = barcodes[i]

    const { error: updateError } = await supabase
      .from("products")
      .update({ barcode })
      .eq("id", product.id)

    if (updateError) {
      console.error(`Erro ao atualizar ${product.name}:`, updateError)
    } else {
      console.log(`Produto "${product.name}" atualizado com código: ${barcode}`)
    }
  }

  console.log("Concluído!")
}

addBarcodes()
