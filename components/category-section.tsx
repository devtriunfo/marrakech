"use client"

import type { Category } from '@/lib/types'
import { Cigarette, GlassWater, Coffee, Leaf, Wind, Box, Flame, CircleDot } from 'lucide-react'

type CategorySectionProps = {
  selectedCategory: string
  onCategoryChange: (slug: string) => void
  categories: Category[]
}

const iconMap: Record<string, React.ReactNode> = {
  'Cigarette': <Cigarette className="h-6 w-6" />,
  'GlassWater': <GlassWater className="h-6 w-6" />,
  'Coffee': <Coffee className="h-6 w-6" />,
  'Leaf': <Leaf className="h-6 w-6" />,
  'Wind': <Wind className="h-6 w-6" />,
  'Box': <Box className="h-6 w-6" />,
  'Flame': <Flame className="h-6 w-6" />,
  'CircleDot': <CircleDot className="h-6 w-6" />,
}

export function CategorySection({ selectedCategory, onCategoryChange, categories }: CategorySectionProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-serif font-semibold text-center mb-6 text-foreground">
          Navegue por Categoria
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-200 ${
                selectedCategory === category.slug
                  ? 'bg-primary/20 border-primary text-foreground'
                  : 'bg-card border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
              }`}
            >
              <span className="text-primary">
                {category.icon ? iconMap[category.icon] || <Box className="h-6 w-6" /> : <Box className="h-6 w-6" />}
              </span>
              <span className="text-sm font-medium text-center">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
