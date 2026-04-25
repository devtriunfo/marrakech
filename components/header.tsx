"use client"

import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'
import type { Category } from '@/lib/types'

type HeaderProps = {
  onCartClick: () => void
  onCategoryClick: (slug: string) => void
  categories: Category[]
}

export function Header({ onCartClick, onCategoryClick, categories }: HeaderProps) {
  const { totalItems } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-40">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Marrakech Tabacaria"
              width={300}
              height={100}
              className="h-[150px] w-auto"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Button
              variant="ghost"
              className="text-foreground/80 hover:text-primary hover:bg-primary/10"
              onClick={() => onCategoryClick('all')}
            >
              Todos
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant="ghost"
                className="text-foreground/80 hover:text-primary hover:bg-primary/10"
                onClick={() => onCategoryClick(category.slug)}
              >
                {category.name}
              </Button>
            ))}
          </nav>

          {/* Cart Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="relative border-primary/30 hover:bg-primary/10 hover:border-primary"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5 text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="justify-start text-foreground/80 hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  onCategoryClick('all')
                  setMobileMenuOpen(false)
                }}
              >
                Todos os Produtos
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className="justify-start text-foreground/80 hover:text-primary hover:bg-primary/10"
                  onClick={() => {
                    onCategoryClick(category.slug)
                    setMobileMenuOpen(false)
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
