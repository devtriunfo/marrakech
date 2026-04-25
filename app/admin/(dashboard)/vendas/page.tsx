import { createClient } from "@/lib/supabase/server"
import { PDV } from "@/components/admin/pdv"

export default async function VendasPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name")

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
