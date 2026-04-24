import { createClient } from "@/lib/supabase/server"
import { SalesPanel } from "@/components/admin/sales-panel"

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
        <p className="text-muted-foreground">
          Leia o codigo de barras para adicionar itens e finalizar a venda.
        </p>
      </div>

      <SalesPanel products={products || []} />
    </div>
  )
}
