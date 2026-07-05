import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ unread: 0 })
  }
  if (session.user.role === 'CONTADOR') {
    const unread = await prisma.message.count({
      where: { senderRole: 'CLIENTE', isRead: false },
    })
    return NextResponse.json({ unread })
  }
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  })
  if (!client) return NextResponse.json({ unread: 0 })
  const unread = await prisma.message.count({
    where: { clientId: client.id, senderRole: 'CONTADOR', isRead: false },
  })
  return NextResponse.json({ unread })
}
