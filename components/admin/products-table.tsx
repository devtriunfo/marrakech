"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Package } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Product, Category } from "@/lib/types"

interface ProductsTableProps {
  products: Product[]
  categories: Category[]
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category_id === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)

    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        console.error("[v0] Erro ao deletar:", data.error)
      }
    } catch (error) {
      console.error("[v0] Erro ao deletar produto:", error)
    }
    
    setDeleteId(null)
    setDeleting(false)
    router.refresh()
  }

  const formatPrice = (price: string) => {
    const num = parseFloat(price)
    if (isNaN(num)) return `R$ ${price}`
    return `R$ ${num.toFixed(2).replace('.', ',')}`
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Esgotado</Badge>
    if (stock <= 5) return <Badge className="bg-orange-500">Baixo: {stock}</Badge>
    return <Badge variant="secondary">{stock} un.</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8" />
                    <span>Nenhum produto encontrado</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {categories.find(c => c.id === product.category_id)?.name || '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStockBadge(product.stock)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/produtos/${product.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
