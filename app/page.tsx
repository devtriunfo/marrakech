import { createClient } from '@/lib/supabase/server'
import { hasSupabaseConfig } from '@/lib/supabase/config'
import { StoreContent } from '@/components/store-content'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  if (!hasSupabaseConfig()) {
    return <StoreContent initialProducts={[]} initialCategories={[]} />
  }

  const { categoria } = await searchParams
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      categories (
        name,
        slug
      )
    `)
    .eq("is_active", true)
    .order("name")
  
  const { data: categoriesRaw } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  // Transform products to include category info at top level
  const transformedProducts = (products || []).map(p => ({
    ...p,
    category_name: p.categories?.name || null,
    category_slug: p.categories?.slug || null,
  }))

  return (
    <StoreContent 
      initialProducts={transformedProducts} 
      initialCategories={categoriesRaw || []}
      initialCategory={categoria}
    />
  )
}
