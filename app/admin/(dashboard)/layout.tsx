"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Loader2 } from "lucide-react"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    // Verificar se está logado
    const session = localStorage.getItem("admin_session")
    if (session) {
      try {
        const parsed = JSON.parse(session)
        // Verificar se a sessão é válida (menos de 24 horas)
        const isValid = parsed.loggedIn && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000
        if (isValid) {
          setUserEmail(parsed.email)
          setLoading(false)
          return
        }
      } catch {
        // Sessão inválida
      }
    }
    // Redirecionar para login se não estiver logado
    router.push("/admin/login")
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar userEmail={userEmail} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
