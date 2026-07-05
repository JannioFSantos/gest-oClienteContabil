'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DocumentsManager } from '@/components/documents-manager'

export default function PortalDocumentos() {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then(setMe).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader title="Meus Documentos" subtitle="Envie e baixe documentos organizados por ano e mês, com total segurança." />
      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...</div>
      ) : me?.client?.id ? (
        <DocumentsManager clientId={me.client.id} canUpload currentUserId={me?.id ?? ''} />
      ) : (
        <p className="text-center text-sm text-muted-foreground">Cadastro não encontrado.</p>
      )}
    </div>
  )
}
