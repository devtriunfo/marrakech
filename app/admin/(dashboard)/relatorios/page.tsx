import { ReportsPanel } from "@/components/admin/reports-panel"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Relatorios</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho das vendas, lucros e produtos mais vendidos.
        </p>
      </div>

      <ReportsPanel />
    </div>
  )
}
