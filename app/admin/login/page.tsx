"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock } from "lucide-react"
import Image from "next/image"

// Credenciais fixas do admin
const ADMIN_EMAIL = "marrakech@dev.com"
const ADMIN_PASSWORD = "Lucasdev1"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 500))

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Salvar sessão no localStorage
      localStorage.setItem("admin_session", JSON.stringify({
        email: ADMIN_EMAIL,
        loggedIn: true,
        timestamp: Date.now()
      }))
      router.push("/admin")
      router.refresh()
    } else {
      setError("Email ou senha incorretos")
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Marrakech Tabacaria"
              width={200}
              height={80}
              className="h-16 w-auto"
            />
          </div>
          <div>
            <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Painel Administrativo
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Faça login para gerenciar seus produtos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@marrakech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card border-border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card border-border"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Voltar para a loja
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
