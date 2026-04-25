import { createClient } from "@/lib/supabase/server"
import { PDV } from "@/components/admin/pdv"

export default async function VendasPage() {
  const supabase = await createClient()

  // Buscar produtos da tabela produtos
  const { data: produtosRaw, error } = await supabase
    .from("produtos")
    .select("*")
    .order("nome")

  // Mapear os campos para o formato esperado pelo componente PDV
  const products = produtosRaw?.map((p) => ({
    id: p.id,
    name: p.nome || "",
    description: p.descricao || "",
    barcode: null, // tabela nao tem coluna de codigo de barras
    price: String(p.preco || 0),
    stock: p.estoque || 0,
    image_url: p.url_da_imagem || null,
    category_id: p.categoria_id || null,
    is_active: p.e_ativo ?? true,
  })) || []

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
