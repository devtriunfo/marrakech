import { createClient } from "@/lib/supabase/server"
import { SalesPanel } from "@/components/admin/sales-panel"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground">
            Leia o codigo de barras para adicionar itens e finalizar a venda. Cada venda finalizada sera registrada no controle de vendas.
          </p>
        </div>
        <Link href="/admin/controle-vendas">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Ver Controle de Vendas
          </Button>
        </Link>
      </div>

      <SalesPanel products={products || []} />
    </div>
  )
}
