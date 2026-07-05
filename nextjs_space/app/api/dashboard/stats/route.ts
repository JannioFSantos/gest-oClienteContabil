import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const [activeClients, totalClients, unreadMessages, totalNotices, totalDocuments] =
    await Promise.all([
      prisma.client.count({ where: { status: 'ATIVO' } }),
      prisma.client.count(),
      prisma.message.count({ where: { senderRole: 'CLIENTE', isRead: false } }),
      prisma.notice.count(),
      prisma.document.count(),
    ])

  // "documentos pendentes" = documentos enviados pelo cliente aguardando (proxy: docs do cliente no mês atual)
  const pendingDocuments = await prisma.document.count({
    where: { uploadedByRole: 'CLIENTE' },
  })

  return NextResponse.json({
    activeClients,
    totalClients,
    unreadMessages,
    totalNotices,
    totalDocuments,
    pendingDocuments,
  })
}
