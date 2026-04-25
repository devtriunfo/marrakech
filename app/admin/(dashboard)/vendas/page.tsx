import { createClient } from "@/lib/supabase/server"
import { PDV } from "@/components/admin/pdv"

export default async function VendasPage() {
  const supabase = await createClient()

  const { data: productsRaw, error } = await supabase
    .from("products")
    .select("*")
    .order("name")

  if (error?.code && error.code !== "PGRST205") {
    throw error
  }

  const legacyProductsRaw = !productsRaw && error?.code === "PGRST205"
    ? await supabase
        .from("produtos")
        .select("*")
        .order("nome")
    : null

  if (legacyProductsRaw?.error) {
    throw legacyProductsRaw.error
  }

  const products = productsRaw
    ? productsRaw.map((product) => ({
        id: product.id,
        name: product.name || "",
        description: product.description || "",
        barcode: product.barcode || null,
        price: String(product.price || 0),
        cost_price: product.cost_price || null,
        stock: product.stock || 0,
        min_stock: product.min_stock || null,
        image_url: product.image_url || null,
        category_id: product.category_id || null,
        is_active: product.is_active ?? true,
        created_at: product.created_at || "",
        updated_at: product.updated_at || "",
      }))
    : (legacyProductsRaw?.data?.map((product) => ({
        id: product.id,
        name: product.nome || "",
        description: product.descricao || "",
        barcode: null,
        price: String(product.preco || 0),
        cost_price: null,
        stock: product.estoque || 0,
        min_stock: null,
        image_url: product.url_da_imagem || null,
        category_id: product.categoria_id || null,
        is_active: product.e_ativo ?? true,
        created_at: product.criado_em || "",
        updated_at: product.atualizado_em || "",
      })) || [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendas no Balcao</h1>
        <p className="text-muted-foreground">
          Registre vendas, pesquise produtos por codigo de barras ou nome e finalize a venda.
        </p>
      </div>

      <PDV products={products || []} />
    </div>
  )
}
