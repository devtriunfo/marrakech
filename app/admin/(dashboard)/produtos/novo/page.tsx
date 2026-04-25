import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"

export default async function NewProductPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Novo Produto</h1>
        <p className="text-muted-foreground">Adicione um novo produto ao catálogo</p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  )
}
