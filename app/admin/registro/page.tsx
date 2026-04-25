"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, UserPlus, CheckCircle } from "lucide-react"
import Image from "next/image"

export default function AdminRegistroPage() {
  const [email, setEmail] = useState("marrakech@dev.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta")
        return
      }

      if (data.needsConfirmation) {
        setSuccess(true)
        setNeedsConfirmation(true)
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-2xl text-primary">
                Conta Criada com Sucesso!
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {needsConfirmation 
                  ? "Verifique seu email para confirmar a conta antes de fazer login."
                  : "Sua conta admin foi criada e já está ativa. Você já pode fazer login!"
                }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push("/admin/login")}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              <UserPlus className="h-5 w-5" />
              Criar Conta Admin
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Crie sua conta para gerenciar a loja
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
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
                placeholder="seu@email.com"
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
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
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            <a 
              href="/admin/login" 
              className="text-sm text-primary hover:underline transition-colors block"
            >
              Já tem uma conta? Faça login
            </a>
            <a 
              href="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors block"
            >
              Voltar para a loja
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
