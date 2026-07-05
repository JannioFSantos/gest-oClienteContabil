'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { formatDateTimePt } from '@/lib/constants'

export default function PortalAvisos() {
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState<string | null>(null)

  const load = () => {
    fetch('/api/notices').then((r) => r.json()).then((d) => setNotices(d?.notices ?? [])).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const confirm = async (id: string) => {
    setMarking(id)
    try {
      const res = await fetch(`/api/notices/${id}/read`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Leitura confirmada!')
      load()
    } catch { toast.error('Erro ao confirmar.') } finally { setMarking(null) }
  }

  return (
    <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Avisos" subtitle="Comunicados importantes do seu escritório contábil. Confirme a leitura de cada aviso." />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
      ) : notices.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-card py-16 text-center shadow-[var(--shadow-sm)]">
          <Megaphone className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum aviso no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }} className="rounded-xl bg-card p-5 shadow-[var(--shadow-sm)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10"><Megaphone className="h-5 w-5 text-primary" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-foreground">{n.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{n.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground/70">{formatDateTimePt(n.createdAt)}</p>
                  <div className="mt-3">
                    {n.read ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Leitura confirmada {n.readAt ? `· ${formatDateTimePt(n.readAt)}` : ''}</span>
                    ) : (
                      <Button size="sm" onClick={() => confirm(n.id)} disabled={marking === n.id}>
                        {marking === n.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmar leitura
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
