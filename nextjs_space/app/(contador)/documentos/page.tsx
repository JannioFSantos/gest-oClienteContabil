'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DocumentsManager } from '@/components/documents-manager'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function DocumentosPage() {
  const { data: session } = useSession() || {}
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState('')

  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((d) => {
        const list = d?.clients ?? []
        setClients(list)
        if (list.length > 0) setSelected(list[0].id)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Central de Documentos"
        subtitle="Organize os documentos por cliente, ano e mês. Envie e baixe arquivos com segurança."
      />
      <div className="mb-5 max-w-md space-y-2">
        <label className="text-sm font-medium">Selecione o cliente</label>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger><SelectValue placeholder="Escolha um cliente" /></SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.nomeFantasia || c.razaoSocial}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selected ? (
        <DocumentsManager clientId={selected} canUpload currentUserId={session?.user?.id ?? ''} canDeleteAll />
      ) : (
        <div className="flex flex-col items-center rounded-xl bg-card py-16 text-center shadow-[var(--shadow-sm)]">
          <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">Cadastre um cliente para gerenciar documentos.</p>
        </div>
      )}
    </div>
  )
}
