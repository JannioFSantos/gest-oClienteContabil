'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Search, Users, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { NewClientDialog } from '@/components/new-client-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIME_LABELS, STATUS_COLORS, STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [open, setOpen] = useState(false)

  const load = () => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => setClients(d?.clients ?? []))
      .catch(() => {})
  }
  useEffect(() => { load() }, [])

  const filtered = clients.filter((c) => {
    const t = q.toLowerCase()
    const match =
      c.razaoSocial.toLowerCase().includes(t) ||
      (c.nomeFantasia ?? '').toLowerCase().includes(t) ||
      c.documento.toLowerCase().includes(t) ||
      c.email.toLowerCase().includes(t)
    const st = status === 'TODOS' || c.status === status
    return match && st
  })

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie todos os clientes do escritório, seus dados e situação cadastral."
        actions={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Novo cliente</Button>}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar por nome, documento ou e-mail..." className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os status</SelectItem>
            <SelectItem value="ATIVO">Ativo</SelectItem>
            <SelectItem value="SUSPENSO">Suspenso</SelectItem>
            <SelectItem value="ENCERRADO">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl bg-card py-16 text-center shadow-[var(--shadow-sm)]">
          <Users className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
              <Link href={`/clientes/${c.id}`} className="group block rounded-xl bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{c.nomeFantasia || c.razaoSocial}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.razaoSocial}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', STATUS_COLORS[c.status])}>{STATUS_LABELS[c.status]}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-mono">{c.documento}</span>
                  <span>· {REGIME_LABELS[c.regimeTributario]}</span>
                  <span>· {c._count?.documents ?? 0} doc(s)</span>
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <Pencil className="h-3.5 w-3.5" /> Ver / editar
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <NewClientDialog open={open} onOpenChange={setOpen} onCreated={load} />
    </div>
  )
}
