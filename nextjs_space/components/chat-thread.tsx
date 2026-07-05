'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDateTimePt } from '@/lib/constants'

type Msg = {
  id: string
  content: string
  senderRole: string
  senderId: string
  createdAt: string
}

export function ChatThread({ clientId }: { clientId: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(() => {
    if (!clientId) return
    fetch(`/api/messages/${clientId}`)
      .then((r) => r.json())
      .then((d) => {
        setMessages(d?.messages ?? [])
        if (d?.currentUserId) setCurrentUserId(d.currentUserId)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [clientId])

  useEffect(() => {
    setLoading(true)
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setSending(true)
    setText('')
    try {
      const res = await fetch(`/api/messages/${clientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
      load()
    } catch {
      toast.error('Erro ao enviar mensagem.')
      setText(content)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 opacity-40" />
            <p className="mt-2 text-sm">Nenhuma mensagem ainda. Envie a primeira!</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId
            return (
              <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[78%] rounded-2xl px-4 py-2 text-sm shadow-[var(--shadow-sm)]',
                    mine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm bg-card text-foreground'
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className={cn(
                      'mt-1 text-[10px]',
                      mine ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {formatDateTimePt(m.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-border bg-card p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 rounded-lg bg-muted/50 px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <Button type="submit" size="icon" disabled={sending || !text.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  )
}
