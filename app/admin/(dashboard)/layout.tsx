"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getPermissionsForEmail, AdminPermissions } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Loader2 } from "lucide-react"

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState("")
  const [permissions, setPermissions] = useState<AdminPermissions | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/admin/login")
        return
      }

      const perms = getPermissionsForEmail(user.email ?? "")

      if (pathname.startsWith("/admin/relatorios") && !perms.canViewReports) {
        router.push("/admin")
        return
      }

      setUserEmail(user.email ?? "")
      setPermissions(perms)
      setLoading(false)
    })
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar userEmail={userEmail} permissions={permissions} />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
