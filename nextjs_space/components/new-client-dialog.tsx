'use client'

import { useState } from 'react'
import { Loader2, Copy, CheckCircle2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIME_LABELS } from '@/lib/constants'

export function NewClientDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    documento: '',
    regimeTributario: 'SIMPLES_NACIONAL',
    email: '',
    telefone: '',
    password: '',
  })
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.razaoSocial || !form.documento || !form.email) {
      toast.error('Preencha Razão Social, CNPJ/CPF e E-mail.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? 'Erro ao cadastrar.')
        return
      }
      setCredentials(data.credentials)
      onCreated()
    } catch {
      toast.error('Erro ao cadastrar cliente.')
    } finally {
      setLoading(false)
    }
  }

  const close = () => {
    setCredentials(null)
    setForm({
      razaoSocial: '',
      nomeFantasia: '',
      documento: '',
      regimeTributario: 'SIMPLES_NACIONAL',
      email: '',
      telefone: '',
      password: '',
    })
    onOpenChange(false)
  }

  const copyCreds = () => {
    if (!credentials) return
    navigator.clipboard
      ?.writeText(`E-mail: ${credentials.email}\nSenha: ${credentials.password}`)
      .then(() => toast.success('Credenciais copiadas!'))
      .catch(() => {})
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent className="sm:max-w-lg">
        {credentials ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Cliente cadastrado!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                As credenciais de acesso foram geradas. Compartilhe com o cliente de
                forma segura — esta senha não será exibida novamente.
              </p>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <KeyRound className="h-4 w-4 text-primary" />
                  <span className="font-medium">Acesso do cliente</span>
                </div>
                <div className="mt-3 space-y-1 font-mono text-sm">
                  <p><span className="text-muted-foreground">E-mail:</span> {credentials.email}</p>
                  <p><span className="text-muted-foreground">Senha:</span> {credentials.password}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={copyCreds}>
                <Copy className="mr-2 h-4 w-4" /> Copiar
              </Button>
              <Button onClick={close}>Concluir</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cadastrar novo cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Razão Social *</Label>
                <Input value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ / CPF *</Label>
                <Input value={form.documento} onChange={(e) => set('documento', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Regime Tributário</Label>
                <Select value={form.regimeTributario} onValueChange={(v) => set('regimeTributario', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(REGIME_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>E-mail (acesso do cliente) *</Label>
                <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Senha (opcional — senão será gerada automaticamente)</Label>
                <Input type="text" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Deixe em branco para gerar senha automática" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={close} disabled={loading}>Cancelar</Button>
              <Button onClick={submit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cadastrar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
