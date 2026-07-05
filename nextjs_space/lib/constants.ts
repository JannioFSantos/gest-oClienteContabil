export const REGIME_LABELS: Record<string, string> = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
}

export const STATUS_LABELS: Record<string, string> = {
  ATIVO: 'Ativo',
  SUSPENSO: 'Suspenso',
  ENCERRADO: 'Encerrado',
}

export const STATUS_COLORS: Record<string, string> = {
  ATIVO: 'bg-emerald-100 text-emerald-700',
  SUSPENSO: 'bg-amber-100 text-amber-700',
  ENCERRADO: 'bg-rose-100 text-rose-700',
}

export const CATEGORY_LABELS: Record<string, string> = {
  BALANCETE: 'Balancete',
  FOLHA_PAGAMENTO: 'Folha de Pagamento',
  GUIAS: 'Guias',
  NOTAS_FISCAIS: 'Notas Fiscais',
  EXTRATOS: 'Extratos',
  BOLETOS: 'Boletos',
  CONTRATOS: 'Contratos',
  OUTROS: 'Outros',
}

export const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i] ?? 'B'}`
}

export function formatDatePt(date: string | Date): string {
  try {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
    })
  } catch {
    return ''
  }
}

export function formatDateTimePt(date: string | Date): string {
  try {
    const d = new Date(date)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
    })
  } catch {
    return ''
  }
}

export function generatePassword(length = 10): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return out
}
