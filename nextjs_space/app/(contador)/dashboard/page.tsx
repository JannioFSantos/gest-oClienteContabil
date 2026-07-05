'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users,
  FileClock,
  MailWarning,
  FolderOpen,
  Megaphone,
  MessageSquare,
  Plus,
  ArrowRight,
  Search,
} from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/stat-card'
import { NewClientDialog } from '@/components/new-client-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { REGIME_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

type Client = {
  id: string
  razaoSocial: string
  nomeFantasia: string | null
  documento: string
  regimeTributario: string
  status: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [q, setQ] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadClients = () => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => setClients(d?.clients ?? []))
      .catch(() => {})
  }
  const loadStats = () => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
  }

  useEffect(() => {
    loadStats()
    loadClients()
  }, [])

  const filtered = clients.filter((c) => {
    const t = q.toLowerCase()
    return (
      c.razaoSocial.toLowerCase().includes(t) ||
      (c.nomeFantasia ?? '').toLowerCase().includes(t) ||
      c.documento.toLowerCase().includes(t)
    )
  })

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Painel do Contador"
        subtitle="Visão geral do escritório: clientes, documentos e comunicação em um só lugar."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo cliente
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Clientes ativos" value={stats?.activeClients ?? 0} icon={Users} delay={0} />
        <StatCard label="Documentos de clientes" value={stats?.pendingDocuments ?? 0} icon={FileClock} accent="text-amber-500" bg="bg-amber-500/10" delay={0.05} />
        <StatCard label="Mensagens não lidas" value={stats?.unreadMessages ?? 0} icon={MailWarning} accent="text-rose-500" bg="bg-rose-500/10" delay={0.1} />
        <StatCard label="Documentos totais" value={stats?.totalDocuments ?? 0} icon={FolderOpen} accent="text-emerald-500" bg="bg-emerald-500/10" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: '/documentos', label: 'Central de Documentos', icon: FolderOpen },
          { href: '/mensagens', label: 'Mensagens', icon: MessageSquare },
          { href: '/avisos', label: 'Avisos Gerais', icon: Megaphone },
        ].map((a, i) => (
          <motion.div key={a.href} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Link
              href={a.href}
              className="group flex items-center justify-between rounded-xl bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <span className="flex items-center gap-3 font-medium text-foreground">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <a.icon className="h-5 w-5 text-primary" />
                </span>
                {a.label}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-xl bg-card p-5 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold tracking-tight">Clientes</h2>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar cliente..." className="pl-9" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 8).map((c) => (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 transition-colors hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.nomeFantasia || c.razaoSocial}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.documento} · {REGIME_LABELS[c.regimeTributario]}</p>
                </div>
                <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', STATUS_COLORS[c.status])}>
                  {STATUS_LABELS[c.status]}
                </span>
              </Link>
            ))}
            <div className="pt-2 text-center">
              <Link href="/clientes" className="text-sm font-medium text-primary hover:underline">
                Ver todos os clientes
              </Link>
            </div>
          </div>
        )}
      </div>

      <NewClientDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={() => { loadClients(); loadStats() }} />
    </div>
  )
}
