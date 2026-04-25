import { createClient } from "@/lib/supabase/server"
import { ProductsTable } from "@/components/admin/products-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ProductsPage() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
  
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos</p>
        </div>
        <Link href="/admin/produtos/novo">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </Link>
      </div>

      <ProductsTable products={products || []} categories={categories || []} />
    </div>
  )
}
