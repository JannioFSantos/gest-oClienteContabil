'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Download,
  FileText,
  Loader2,
  Trash2,
  ChevronDown,
  FolderOpen,
  User,
  Briefcase,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CATEGORY_LABELS,
  MONTH_LABELS,
  formatBytes,
  formatDatePt,
} from '@/lib/constants'
import { cn } from '@/lib/utils'

type Doc = {
  id: string
  year: number
  month: number
  category: string
  fileName: string
  fileSize: number
  createdAt: string
  uploadedByRole: string
  uploadedById: string
  uploadedBy?: { name: string; role: string } | null
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i)

export function DocumentsManager({
  clientId,
  canUpload,
  currentUserId,
  canDeleteAll = false,
}: {
  clientId: string
  canUpload: boolean
  currentUserId: string
  canDeleteAll?: boolean
}) {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const [year, setYear] = useState(String(CURRENT_YEAR))
  const [month, setMonth] = useState(String(new Date().getMonth() + 1))
  const [category, setCategory] = useState('OUTROS')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(() => {
    if (!clientId) return
    setLoading(true)
    fetch(`/api/documents?clientId=${clientId}`)
      .then((r) => r.json())
      .then((d) => {
        setDocs(d?.documents ?? [])
        const years = Array.from(new Set((d?.documents ?? []).map((x: Doc) => x.year)))
        const exp: Record<string, boolean> = {}
        years.forEach((y: any) => (exp[String(y)] = true))
        setExpanded(exp)
      })
      .catch(() => toast.error('Erro ao carregar documentos.'))
      .finally(() => setLoading(false))
  }, [clientId])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async () => {
    const files = fileRef.current?.files
    if (!files || files.length === 0) {
      toast.error('Selecione ao menos um arquivo.')
      return
    }
    setUploading(true)
    let ok = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const presign = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
            isPublic: false,
          }),
        }).then((r) => r.json())
        if (!presign?.uploadUrl) throw new Error('presign')
        const put = await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
          body: file,
        })
        if (!put.ok) throw new Error('upload')
        const meta = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientId,
            year: parseInt(year),
            month: parseInt(month),
            category,
            fileName: file.name,
            cloudStoragePath: presign.cloudStoragePath,
            fileSize: file.size,
            contentType: file.type || 'application/octet-stream',
          }),
        })
        if (meta.ok) ok++
      } catch {
        // continua
      }
    }
    setUploading(false)
    setUploadOpen(false)
    if (fileRef.current) fileRef.current.value = ''
    if (ok > 0) {
      toast.success(`${ok} arquivo(s) enviado(s) com sucesso.`)
      load()
    } else {
      toast.error('Não foi possível enviar os arquivos.')
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const d = await fetch(`/api/documents/${id}/download`).then((r) => r.json())
      if (!d?.url) throw new Error()
      const a = document.createElement('a')
      a.href = d.url
      a.download = d.fileName ?? 'documento'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch {
      toast.error('Erro ao baixar documento.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remover este documento?')) return
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Documento removido.')
      load()
    } else {
      toast.error('Erro ao remover.')
    }
  }

  // group
  const grouped: Record<number, Record<number, Doc[]>> = {}
  docs.forEach((d) => {
    grouped[d.year] = grouped[d.year] || {}
    grouped[d.year][d.month] = grouped[d.year][d.month] || []
    grouped[d.year][d.month].push(d)
  })
  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a)

  return (
    <div>
      {canUpload && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" /> Enviar documentos
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Carregando...
        </div>
      ) : years.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-card py-16 text-center shadow-[var(--shadow-sm)]">
          <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-foreground">Nenhum documento ainda</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canUpload
              ? 'Envie o primeiro documento usando o botão acima.'
              : 'Assim que houver documentos, eles aparecerão aqui.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((y) => (
            <div key={y} className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-sm)]">
              <button
                onClick={() => setExpanded((e) => ({ ...e, [y]: !e[y] }))}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="font-display text-lg font-bold text-foreground">{y}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 text-muted-foreground transition-transform',
                    expanded[y] && 'rotate-180'
                  )}
                />
              </button>
              {expanded[y] && (
                <div className="space-y-4 border-t border-border px-5 py-4">
                  {Object.keys(grouped[y])
                    .map(Number)
                    .sort((a, b) => b - a)
                    .map((m) => (
                      <div key={m}>
                        <p className="mb-2 text-sm font-semibold text-primary">
                          {MONTH_LABELS[m - 1]}
                        </p>
                        <div className="space-y-2">
                          {grouped[y][m].map((doc) => (
                            <motion.div
                              key={doc.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-3 rounded-lg bg-muted/40 p-3"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {doc.fileName}
                                </p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                  <span className="rounded bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                                    {CATEGORY_LABELS[doc.category] ?? doc.category}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    {doc.uploadedByRole === 'CONTADOR' ? (
                                      <Briefcase className="h-3 w-3" />
                                    ) : (
                                      <User className="h-3 w-3" />
                                    )}
                                    {doc.uploadedBy?.name ?? (doc.uploadedByRole === 'CONTADOR' ? 'Contador' : 'Cliente')}
                                  </span>
                                  <span>· {formatDatePt(doc.createdAt)}</span>
                                  <span>· {formatBytes(doc.fileSize)}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDownload(doc.id)}
                                title="Baixar"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {(canDeleteAll || doc.uploadedById === currentUserId) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(doc.id)}
                                  title="Remover"
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar documentos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTH_LABELS.map((m, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Arquivos</Label>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.zip,.xls,.xlsx,.doc,.docx"
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">PDF, imagens, ZIP, Excel e Word.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancelar
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
