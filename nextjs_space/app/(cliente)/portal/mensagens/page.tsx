'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChatThread } from '@/components/chat-thread'

export default function PortalMensagens() {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then(setMe).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-[900px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Mensagens" subtitle="Fale diretamente com o seu contador. Respostas ficam registradas aqui." />
      <div className="h-[calc(100vh-14rem)] overflow-hidden rounded-xl bg-muted/30 shadow-[var(--shadow-sm)]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
        ) : me?.client?.id ? (
          <ChatThread clientId={me.client.id} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Cadastro não encontrado.</div>
        )}
      </div>
    </div>
  )
}
