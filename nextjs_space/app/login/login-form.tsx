'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Building2,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  FileText,
  MessageSquare,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [officeName, setOfficeName] = useState('Gestão Contábil')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSecret, setForgotSecret] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotResult, setForgotResult] = useState<{
    password: string | null
    name: string | null
    message: string
    hint: string | null
  } | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.officeName) setOfficeName(d.officeName)
        if (d?.logoUrl) setLogoUrl(d.logoUrl)
      })
      .catch(() => {})
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Informe e-mail e senha.')
      return
    }
    setLoading(true)
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      toast.error('E-mail ou senha inválidos.')
      return
    }
    toast.success('Bem-vindo(a)!')
    router.replace('/')
  }

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      toast.error('Informe seu e-mail.')
      return
    }
    if (!forgotSecret.trim()) {
      toast.error('Informe a palavra secreta.')
      return
    }
    setForgotLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, secretWord: forgotSecret }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error)
      setForgotResult(data)
    } catch {
      toast.error('Erro ao processar.')
    } finally {
      setForgotLoading(false)
    }
  }

  const closeForgot = () => {
    setForgotOpen(false)
    setForgotEmail('')
    setForgotSecret('')
    setForgotResult(null)
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="relative z-10 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-11 w-11 rounded-md bg-white object-contain" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
              <Building2 className="h-6 w-6" />
            </div>
          )}
          <span className="font-display text-xl font-bold">{officeName}</span>
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Gestão contábil simples, organizada e segura.
          </h1>
          <p className="mt-4 text-primary-foreground/80">
            Centralize clientes, documentos e a comunicação do seu escritório em um único lugar.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: FileText, text: 'Central de documentos por cliente, ano e mês' },
              { icon: MessageSquare, text: 'Chat direto entre contador e cliente' },
              { icon: ShieldCheck, text: 'Acessos separados e dados protegidos' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-primary-foreground/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-primary-foreground/60">
          {new Date().getFullYear()} · {officeName}
        </div>
        <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex w-full items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">{officeName}</span>
          </div>

          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Acessar conta</h2>
          <p className="mt-1 text-sm text-muted-foreground">Entre com seu e-mail e senha para continuar.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" className="pl-10" autoComplete="email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" autoComplete="current-password" />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => setForgotOpen(true)} className="text-sm font-medium text-primary hover:underline">
              Esqueceu a senha? (somente contador)
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            O acesso ao sistema é gerenciado pelo escritório contábil. Solicite seu cadastro ao administrador.
          </p>
        </motion.div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={(v) => !v && closeForgot()}>
        <DialogContent className="sm:max-w-md">
          {forgotResult ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {forgotResult.password ? (
                    <><CheckCircle2 className="h-5 w-5 text-emerald-500" /> Senha redefinida!</>
                  ) : 'Verificação'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{forgotResult.message}</p>
                {forgotResult.hint && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-3 text-sm text-amber-800 dark:text-amber-200">
                    <strong>Dica:</strong> {forgotResult.hint}
                  </div>
                )}
                {forgotResult.password && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <KeyRound className="h-4 w-4 text-primary" />
                      <span className="font-medium">Nova senha</span>
                    </div>
                    <div className="mt-3 space-y-1 font-mono text-sm">
                      {forgotResult.name && <p><span className="text-muted-foreground">Nome:</span> {forgotResult.name}</p>}
                      <p><span className="text-muted-foreground">Senha:</span> {forgotResult.password}</p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={closeForgot}>Fechar</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Recuperar senha de contador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Informe seu e-mail e a <strong>palavra secreta</strong>. Se coincidirem, uma nova senha será gerada.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Clientes devem solicitar nova senha ao administrador.
                </p>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="voce@empresa.com.br" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Palavra secreta</Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" value={forgotSecret} onChange={(e) => setForgotSecret(e.target.value)} placeholder="Digite a palavra secreta" className="pl-10" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeForgot} disabled={forgotLoading}>Cancelar</Button>
                <Button onClick={handleForgotPassword} disabled={forgotLoading}>
                  {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Resetar senha
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}