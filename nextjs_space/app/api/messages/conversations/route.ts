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
  const clients = await prisma.client.findMany({
    orderBy: { razaoSocial: 'asc' },
    select: {
      id: true,
      razaoSocial: true,
      nomeFantasia: true,
      status: true,
    },
  })

  const conversations = await Promise.all(
    clients.map(async (c) => {
      const [lastMessage, unread] = await Promise.all([
        prisma.message.findFirst({
          where: { clientId: c.id },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.message.count({
          where: { clientId: c.id, senderRole: 'CLIENTE', isRead: false },
        }),
      ])
      return {
        clientId: c.id,
        razaoSocial: c.razaoSocial,
        nomeFantasia: c.nomeFantasia,
        status: c.status,
        lastMessage: lastMessage?.content ?? null,
        lastMessageAt: lastMessage?.createdAt ?? null,
        unread,
      }
    })
  )

  conversations.sort((a, b) => {
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return tb - ta
  })

  return NextResponse.json({ conversations })
}
