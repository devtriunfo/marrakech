import { SalesAnalytics } from "@/components/admin/sales-analytics"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function SalesControlPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Vendas</h1>
          <p className="text-muted-foreground">
            Acompanhe os produtos mais vendidos, desempenho por mes e o historico detalhado de cada venda.
          </p>
        </div>
        <Link href="/admin/vendas">
          <Button>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </Link>
      </div>

      <SalesAnalytics />
    </div>
  )
}
