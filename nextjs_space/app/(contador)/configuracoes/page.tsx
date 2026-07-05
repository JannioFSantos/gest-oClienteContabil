'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Loader2,
  Save,
  Upload,
  Building2,
  User,
  Trash2,
  Plus,
  KeyRound,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
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

export default function ConfiguracoesPage() {
  // --- Escritório ---
  const [officeName, setOfficeName] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoPath, setLogoPath] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // --- Perfil do contador ---
  const [myName, setMyName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [secretWord, setSecretWord] = useState('')
  const [secretHint, setSecretHint] = useState('')
  const [savingSecret, setSavingSecret] = useState(false)

  // --- Contadores auxiliares ---
  const [accountants, setAccountants] = useState<any[]>([])
  const [newDialog, setNewDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [newCreds, setNewCreds] = useState<{ email: string; password: string } | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        setOfficeName(d?.officeName ?? '')
        setPrimaryColor(d?.primaryColor ?? '#2563EB')
        setLogoUrl(d?.logoUrl ?? null)
      })
      .catch(() => {})
    loadProfile()
    loadAccountants()
  }, [])

  const loadProfile = () => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => setMyName(d?.name ?? ''))
      .catch(() => {})
  }

  const loadAccountants = () => {
    fetch('/api/accountants')
      .then((r) => r.json())
      .then((d) => setAccountants(d?.accountants ?? []))
      .catch(() => {})
  }

  const uploadLogo = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const presign = await fetch('/api/upload/presigned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, isPublic: true }),
      }).then((r) => r.json())
      const put = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!put.ok) throw new Error()
      setLogoPath(presign.cloudStoragePath)
      setLogoUrl(URL.createObjectURL(file))
      toast.success('Logo carregada. Clique em salvar para aplicar.')
    } catch {
      toast.error('Erro ao enviar logo.')
    } finally {
      setUploading(false)
    }
  }

  const saveOffice = async () => {
    setSaving(true)
    try {
      const body: any = { officeName, primaryColor }
      if (logoPath) body.logoPath = logoPath
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) throw new Error()
      setLogoUrl(d?.logoUrl ?? logoUrl)
      toast.success('Configurações do escritório salvas!')
    } catch {
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const saveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: myName }),
      })
      if (!res.ok) throw new Error()
      toast.success('Nome atualizado! Faça login novamente para ver a mudança no menu.')
    } catch {
      toast.error('Erro ao salvar nome.')
    } finally {
      setSavingProfile(false)
    }
  }

  const createAccountant = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Preencha nome e e-mail.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/accountants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data?.error ?? 'Erro ao criar.')
        return
      }
      setNewCreds(data.credentials)
      loadAccountants()
    } catch {
      toast.error('Erro ao criar contador.')
    } finally {
      setCreating(false)
    }
  }

  const closeNewDialog = () => {
    setNewDialog(false)
    setNewName('')
    setNewEmail('')
    setNewPassword('')
    setNewCreds(null)
  }

  const copyCreds = () => {
    if (!newCreds) return
    navigator.clipboard
      ?.writeText(`E-mail: ${newCreds.email}\nSenha: ${newCreds.password}`)
      .then(() => toast.success('Credenciais copiadas!'))
      .catch(() => {})
  }

  const deleteAccountant = async (id: string, name: string) => {
    if (!confirm(`Remover o contador "${name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/accountants?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Contador removido.')
      loadAccountants()
    } catch {
      toast.error('Erro ao remover.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8 space-y-8">
      <PageHeader title="Configurações do Sistema" subtitle="Personalize o escritório, seu perfil e gerencie acessos de contadores auxiliares." />

      {/* Escritório */}
      <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
        <h2 className="font-display text-lg font-bold">Identidade do Escritório</h2>
        <div className="space-y-2">
          <Label>Nome do escritório</Label>
          <Input value={officeName} onChange={(e) => setOfficeName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-muted">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                <Building2 className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Enviar imagem
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Cor principal</Label>
          <div className="flex items-center gap-3">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-16 cursor-pointer rounded border border-border" />
            <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-40 font-mono" />
          </div>
        </div>
        <Button onClick={saveOffice} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar escritório
        </Button>
      </div>

      {/* Perfil do contador logado */}
      <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
        <h2 className="font-display text-lg font-bold">Meu Perfil</h2>
        <div className="space-y-2">
          <Label>Nome de exibição</Label>
          <Input value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="Seu nome" />
        </div>
        <Button onClick={saveProfile} disabled={savingProfile}>
          {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar nome
        </Button>
      </div>

      {/* Palavra secreta */}
      <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
        <h2 className="font-display text-lg font-bold">Palavra Secreta para Recuperação de Senha</h2>
        <p className="text-sm text-muted-foreground">
          Usada para recuperar sua senha na tela de login, junto com seu e-mail. A dica será exibida se errar a palavra.
        </p>
        <div className="space-y-2">
          <Label>Palavra secreta</Label>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input value={secretWord} onChange={(e) => setSecretWord(e.target.value)} placeholder="Ex: abacaxi" className="pl-10" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Dica da palavra secreta</Label>
          <Input value={secretHint} onChange={(e) => setSecretHint(e.target.value)} placeholder="Ex: fruta amarela" />
        </div>
        <Button onClick={async () => {
          setSavingSecret(true)
          try {
            const res = await fetch('/api/me', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ secretWord, secretHint }),
            })
            if (!res.ok) throw new Error()
            toast.success('Palavra secreta atualizada!')
          } catch { toast.error('Erro ao salvar.') }
          finally { setSavingSecret(false) }
        }} disabled={savingSecret}>
          {savingSecret ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar palavra secreta
        </Button>
      </div>

      {/* Contadores auxiliares */}
      <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Contadores Auxiliares</h2>
          <Button size="sm" onClick={() => setNewDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo contador
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Contadores auxiliares têm acesso a todos os clientes, documentos e mensagens do escritório.
        </p>
        {accountants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum contador auxiliar cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {accountants.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{a.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deleting === a.id}
                  onClick={() => deleteAccountant(a.id, a.name)}
                >
                  {deleting === a.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog: Novo contador auxiliar */}
      <Dialog open={newDialog} onOpenChange={(v) => (v ? setNewDialog(v) : closeNewDialog())}>
        <DialogContent className="sm:max-w-md">
          {newCreds ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Contador cadastrado!
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As credenciais de acesso foram geradas. Compartilhe de forma segura.
                </p>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <span className="font-medium">Acesso</span>
                  </div>
                  <div className="mt-3 space-y-1 font-mono text-sm">
                    <p><span className="text-muted-foreground">E-mail:</span> {newCreds.email}</p>
                    <p><span className="text-muted-foreground">Senha:</span> {newCreds.password}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={copyCreds}><Copy className="mr-2 h-4 w-4" /> Copiar</Button>
                <Button onClick={closeNewDialog}>Concluir</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Cadastrar contador auxiliar</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do contador" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="contador@escritorio.com" />
                </div>
                <div className="space-y-2">
                  <Label>Senha (opcional — senão será gerada automaticamente)</Label>
                  <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Deixe em branco para gerar automática" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeNewDialog} disabled={creating}>Cancelar</Button>
                <Button onClick={createAccountant} disabled={creating}>
                  {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Cadastrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}