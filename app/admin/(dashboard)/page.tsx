import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tags, DollarSign, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  // Get stats
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
  
  const { count: totalCategories } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true })
  
  const { data: allProducts } = await supabase
    .from("products")
    .select("price, stock")
    .eq("is_active", true)
  
  const totalValue = allProducts?.reduce((acc, p) => acc + (parseFloat(p.price) || 0), 0) || 0
  const lowStockCount = allProducts?.filter(p => p.stock <= 5).length || 0
  const totalStock = allProducts?.reduce((acc, p) => acc + (p.stock || 0), 0) || 0

  const stats = [
    {
      title: "Total de Produtos",
      value: totalProducts || 0,
      icon: Package,
      href: "/admin/produtos",
      color: "text-blue-500",
    },
    {
      title: "Categorias",
      value: totalCategories || 0,
      icon: Tags,
      href: "/admin/categorias",
      color: "text-green-500",
    },
    {
      title: "Valor Total do Catálogo",
      value: `R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      href: "/admin/produtos",
      color: "text-primary",
    },
    {
      title: "Estoque Baixo",
      value: lowStockCount,
      icon: AlertTriangle,
      href: "/admin/produtos",
      color: lowStockCount > 0 ? "text-orange-500" : "text-green-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua tabacaria</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo do Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-lg">
            Total de unidades em estoque: <span className="font-bold text-primary">{totalStock}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
