'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Plus, Loader2, Users, CheckCircle2, XCircle, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { formatDateTimePt } from '@/lib/constants'

export default function AvisosPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [readsOpen, setReadsOpen] = useState<string | null>(null)
  const [reads, setReads] = useState<any[]>([])

  const load = () => {
    fetch('/api/notices').then((r) => r.json()).then((d) => setNotices(d?.notices ?? [])).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const publish = async () => {
    if (!title.trim() || !desc.trim()) { toast.error('Preencha título e descrição.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: desc }) })
      if (!res.ok) throw new Error()
      toast.success('Aviso publicado!')
      setOpen(false); setTitle(''); setDesc(''); load()
    } catch { toast.error('Erro ao publicar.') } finally { setSaving(false) }
  }

  const openReads = (id: string) => {
    setReadsOpen(id); setReads([])
    fetch(`/api/notices/${id}/reads`).then((r) => r.json()).then((d) => setReads(d?.clients ?? [])).catch(() => {})
  }

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Avisos Gerais" subtitle="Publique comunicados para todos os clientes e acompanhe as confirmações de leitura."
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Novo aviso</Button>} />

      {notices.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-card py-16 text-center shadow-[var(--shadow-sm)]">
          <Megaphone className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum aviso publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }} className="rounded-xl bg-card p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground">{n.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{n.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground/70">Publicado em {formatDateTimePt(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  <Users className="h-4 w-4" /> {n.readCount}/{n.totalClients}
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => openReads(n.id)}><Eye className="mr-2 h-4 w-4" /> Ver leituras</Button>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Publicar novo aviso</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={publish} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!readsOpen} onOpenChange={(v) => !v && setReadsOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Status de leitura</DialogTitle></DialogHeader>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {reads.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado.</p> : reads.map((c) => (
              <div key={c.clientId} className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                <span className="text-sm font-medium">{c.nomeFantasia || c.razaoSocial}</span>
                {c.read ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Lido {c.readAt ? `· ${formatDateTimePt(c.readAt)}` : ''}</span> : <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><XCircle className="h-4 w-4" /> Não lido</span>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
