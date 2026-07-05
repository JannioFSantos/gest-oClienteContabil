'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, FolderOpen, MessageSquare, KeyRound, Copy, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIME_LABELS, STATUS_LABELS } from '@/lib/constants'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id ?? '')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [newPassword, setNewPassword] = useState<{ email: string; password: string } | null>(null)

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then((r) => r.json())
      .then((d) => setForm(d?.client ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razaoSocial: form.razaoSocial,
          nomeFantasia: form.nomeFantasia,
          documento: form.documento,
          regimeTributario: form.regimeTributario,
          telefone: form.telefone,
          status: form.status,
          email: form.email,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Cliente atualizado com sucesso.')
    } catch {
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-20 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
  }
  if (!form) {
    return <div className="p-8 text-center text-muted-foreground">Cliente não encontrado.</div>
  }

  return (
    <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
      <Link href="/clientes" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>
      <PageHeader title={form.nomeFantasia || form.razaoSocial} subtitle="Edite os dados cadastrais e a situação do cliente." />

      <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-sm)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Razão Social</Label>
            <Input value={form.razaoSocial ?? ''} onChange={(e) => set('razaoSocial', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nome Fantasia</Label>
            <Input value={form.nomeFantasia ?? ''} onChange={(e) => set('nomeFantasia', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CNPJ / CPF</Label>
            <Input value={form.documento ?? ''} onChange={(e) => set('documento', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Regime Tributário</Label>
            <Select value={form.regimeTributario} onValueChange={(v) => set('regimeTributario', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(REGIME_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (<SelectItem key={k} value={k}>{v}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>E-mail (acesso)</Label>
            <Input value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefone / WhatsApp</Label>
            <Input value={form.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar alterações
          </Button>
          <Button variant="outline" onClick={() => router.push('/documentos')}><FolderOpen className="mr-2 h-4 w-4" /> Documentos</Button>
          <Button variant="outline" onClick={() => router.push('/mensagens')}><MessageSquare className="mr-2 h-4 w-4" /> Mensagens</Button>
          <Button variant="outline" className="text-amber-600 hover:text-amber-700" onClick={async () => {
            setResetting(true)
            try {
              const res = await fetch(`/api/clients/${id}/reset-password`, { method: 'POST' })
              const data = await res.json()
              if (!res.ok) throw new Error()
              setNewPassword(data)
              setResetOpen(true)
            } catch { toast.error('Erro ao resetar senha.') }
            finally { setResetting(false) }
          }} disabled={resetting}>
            {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />} Resetar senha
          </Button>
        </div>

        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Senha resetada!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nova senha gerada para o cliente. Compartilhe de forma segura.
              </p>
              {newPassword && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <span className="font-medium">Novas credenciais</span>
                  </div>
                  <div className="mt-3 space-y-1 font-mono text-sm">
                    <p><span className="text-muted-foreground">E-mail:</span> {newPassword.email}</p>
                    <p><span className="text-muted-foreground">Senha:</span> {newPassword.password}</p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                navigator.clipboard?.writeText(`E-mail: ${newPassword?.email}\nSenha: ${newPassword?.password}`).then(() => toast.success('Credenciais copiadas!')).catch(() => {})
              }}><Copy className="mr-2 h-4 w-4" /> Copiar</Button>
              <Button onClick={() => setResetOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
