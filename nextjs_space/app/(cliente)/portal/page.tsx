'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Megaphone, MessageSquare, FolderOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { formatDateTimePt } from '@/lib/constants'

export default function PortalHome() {
  const [me, setMe] = useState<any>(null)
  const [notices, setNotices] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [docCount, setDocCount] = useState(0)

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then(setMe).catch(() => {})
    fetch('/api/notices').then((r) => r.json()).then((d) => setNotices(d?.notices ?? [])).catch(() => {})
    fetch('/api/messages/unread').then((r) => r.json()).then((d) => setUnread(d?.unread ?? 0)).catch(() => {})
    fetch('/api/documents').then((r) => r.json()).then((d) => setDocCount((d?.documents ?? []).length)).catch(() => {})
  }, [])

  const unreadNotices = notices.filter((n) => !n.read)

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader title={`Olá, ${me?.client?.nomeFantasia || me?.name || 'cliente'}!`} subtitle="Acompanhe seus avisos, documentos e a comunicação com o escritório contábil." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { href: '/portal/avisos', label: 'Avisos não lidos', value: unreadNotices.length, icon: Megaphone, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { href: '/portal/mensagens', label: 'Mensagens não lidas', value: unread, icon: MessageSquare, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { href: '/portal/documentos', label: 'Documentos disponíveis', value: docCount, icon: FolderOpen, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((c, i) => (
          <motion.div key={c.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link href={c.href} className="group flex items-center justify-between rounded-xl bg-card p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <p className="mt-1 font-display text-3xl font-bold">{c.value}</p>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${c.bg}`}><c.icon className={`h-5 w-5 ${c.color}`} /></div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-card p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Avisos recentes</h2>
          <Link href="/portal/avisos" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Ver todos <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        {notices.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum aviso no momento.</p>
        ) : (
          <div className="space-y-2">
            {notices.slice(0, 4).map((n) => (
              <Link key={n.id} href="/portal/avisos" className="block rounded-lg bg-muted/40 p-3 transition-colors hover:bg-muted">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  {n.read ? <span className="flex shrink-0 items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Lido</span> : <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600">Novo</span>}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground/70">{formatDateTimePt(n.createdAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
