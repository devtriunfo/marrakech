import { SalesAnalytics } from "@/components/admin/sales-analytics"

export default function SalesControlPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Controle de Vendas</h1>
        <p className="text-muted-foreground">
          Acompanhe os produtos mais vendidos, desempenho por mês e o historico detalhado de cada venda.
        </p>
      </div>

      <SalesAnalytics />
    </div>
  )
}
