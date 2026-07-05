import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const allClients = await prisma.client.findMany({
    orderBy: { razaoSocial: 'asc' },
    select: { id: true, razaoSocial: true, nomeFantasia: true },
  })
  const reads = await prisma.noticeRead.findMany({
    where: { noticeId: params.id },
  })
  const readMap = new Map(reads.map((r) => [r.clientId, r.readAt]))
  const result = allClients.map((c) => ({
    clientId: c.id,
    razaoSocial: c.razaoSocial,
    nomeFantasia: c.nomeFantasia,
    read: readMap.has(c.id),
    readAt: readMap.get(c.id) ?? null,
  }))
  return NextResponse.json({ clients: result })
}
