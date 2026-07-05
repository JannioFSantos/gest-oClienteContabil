'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Search } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChatThread } from '@/components/chat-thread'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { formatDateTimePt } from '@/lib/constants'

export default function MensagensPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selected, setSelected] = useState<string>('')
  const [q, setQ] = useState('')

  const load = () => {
    fetch('/api/messages/conversations')
      .then((r) => r.json())
      .then((d) => {
        const list = d?.conversations ?? []
        setConversations(list)
        setSelected((prev) => prev || (list[0]?.clientId ?? ''))
      })
      .catch(() => {})
  }
  useEffect(() => {
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [])

  const filtered = conversations.filter((c) =>
    (c.nomeFantasia || c.razaoSocial).toLowerCase().includes(q.toLowerCase())
  )
  const active = conversations.find((c) => c.clientId === selected)

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Mensagens" subtitle="Converse diretamente com cada cliente. As conversas ficam registradas." />
      <div className="grid h-[calc(100vh-13rem)] grid-cols-1 gap-4 overflow-hidden rounded-xl md:grid-cols-[320px_1fr]">
        <div className="flex flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-sm)]">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar cliente..." className="pl-9" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Nenhuma conversa.</p>
            ) : filtered.map((c) => (
              <button
                key={c.clientId}
                onClick={() => setSelected(c.clientId)}
                className={cn('flex w-full items-start gap-3 border-b border-border/60 p-3 text-left transition-colors hover:bg-accent', selected === c.clientId && 'bg-accent')}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{c.nomeFantasia || c.razaoSocial}</p>
                    {c.unread > 0 && <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{c.unread}</span>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{c.lastMessage ?? 'Sem mensagens'}</p>
                  {c.lastMessageAt && <p className="mt-0.5 text-[10px] text-muted-foreground/70">{formatDateTimePt(c.lastMessageAt)}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl bg-muted/30 shadow-[var(--shadow-sm)]">
          {active ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-border bg-card px-4 py-3">
                <p className="font-medium text-foreground">{active.nomeFantasia || active.razaoSocial}</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatThread clientId={active.clientId} />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">Selecione uma conversa</div>
          )}
        </div>
      </div>
    </div>
  )
}
