import { createClient } from "@/lib/supabase/server"
import { CategoriesManager } from "@/components/admin/categories-manager"

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Categorias</h1>
        <p className="text-muted-foreground">Gerencie as categorias de produtos</p>
      </div>

      <CategoriesManager categories={categories || []} />
    </div>
  )
}
