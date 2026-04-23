"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Trash2, Loader2, Tags } from "lucide-react"
import type { Category } from "@/lib/types"

interface CategoriesManagerProps {
  categories: Category[]
}

export function CategoriesManager({ categories }: CategoriesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [icon, setIcon] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const openCreateDialog = () => {
    setEditingCategory(null)
    setName("")
    setSlug("")
    setIcon("")
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug)
    setIcon(category.icon || "")
    setDialogOpen(true)
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!editingCategory) {
      setSlug(value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
    }
  }

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) return
    setSaving(true)

    try {
      const data = {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        icon: icon || null,
      }

      if (editingCategory) {
        await supabase
          .from("categories")
          .update(data)
          .eq("id", editingCategory.id)
      } else {
        await supabase
          .from("categories")
          .insert(data)
      }

      setDialogOpen(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)

    await supabase.from("categories").delete().eq("id", deleteId)
    
    setDeleteId(null)
    setDeleting(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreateDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Tags className="h-8 w-8" />
                      <span>Nenhuma categoria cadastrada</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell>{category.icon || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(category.id)}
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nome da Categoria</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Sedas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug (URL)</Label>
              <Input
                id="category-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="sedas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-icon">Ícone (opcional)</Label>
              <Input
                id="category-icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Cigarette, Flame, Box, etc."
              />
              <p className="text-xs text-muted-foreground">
                Ícones disponíveis: Cigarette, GlassWater, Coffee, Leaf, Wind, Box, Flame, CircleDot
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !slug.trim() || saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Os produtos desta categoria ficarão sem categoria. Esta ação não pode ser desfeita.
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
