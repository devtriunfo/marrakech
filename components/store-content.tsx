"use client"

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { CartProvider } from '@/lib/cart-context'
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { CategorySection } from '@/components/category-section'
import { ProductCard } from '@/components/product-card'
import { CartDrawer } from '@/components/cart-drawer'
import { Footer } from '@/components/footer'
import type { Product, Category } from '@/lib/types'

interface StoreContentProps {
  initialProducts: Product[]
  initialCategories: Category[]
  initialCategory?: string
}

function StoreMain({ initialProducts, initialCategories, initialCategory }: StoreContentProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')
  const productsRef = useRef<HTMLDivElement>(null)

  const visibleCategories = initialCategories.filter((c) => !/pod/i.test(c.name))

  const podCategorySlugs = new Set(
    initialCategories.filter((c) => /pod/i.test(c.name)).map((c) => c.slug),
  )

  const filteredProducts = selectedCategory === 'all'
    ? initialProducts.filter((p) => !podCategorySlugs.has(p.category_slug ?? ''))
    : initialProducts.filter(product => product.category_slug === selectedCategory)

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug)
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExploreClick = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const currentCategoryName = selectedCategory === 'all'
    ? 'Todos os Produtos'
    : initialCategories.find(c => c.slug === selectedCategory)?.name || 'Produtos'

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onCartClick={() => setCartOpen(true)} 
        onCategoryClick={handleCategoryClick}
        categories={visibleCategories}
      />

      <main className="flex-1">
        <HeroSection onExploreClick={handleExploreClick} />

        <CategorySection
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryClick}
          categories={visibleCategories}
        />

        {/* Products Grid */}
        <section ref={productsRef} className="py-8 scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif font-semibold text-foreground">
                {currentCategoryName}
              </h2>
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              </span>
            </div>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-sm text-primary hover:underline mb-4"
              >
                ← Ver todos os produtos
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Nenhum produto encontrado nesta categoria.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Social Float Buttons */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          {/* Admin Button */}
          <Link
            href="/admin"
            className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Painel Admin"
          >
            <Settings className="w-6 h-6 text-white" />
          </Link>

          {/* Instagram Button */}
          <a
            href="https://instagram.com/marrakechtab"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Siga no Instagram"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
          
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/5511933212450"
            target="_blank"
            rel="noopener noreferrer"
            className="w-14 h-14 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            aria-label="Contato via WhatsApp"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </main>

      <Footer />

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export function StoreContent({ initialProducts, initialCategories, initialCategory }: StoreContentProps) {
  return (
    <CartProvider>
      <StoreMain initialProducts={initialProducts} initialCategories={initialCategories} initialCategory={initialCategory} />
    </CartProvider>
  )
}
