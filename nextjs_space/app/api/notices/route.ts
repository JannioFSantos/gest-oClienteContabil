import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  if (session.user.role === 'CONTADOR') {
    const totalClients = await prisma.client.count()
    const notices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { reads: true } } },
    })
    return NextResponse.json({
      notices: notices.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description,
        createdAt: n.createdAt,
        readCount: n._count.reads,
        totalClients,
      })),
    })
  }

  // cliente
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  })
  if (!client) return NextResponse.json({ notices: [] })
  const notices = await prisma.notice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { reads: { where: { clientId: client.id } } },
  })
  return NextResponse.json({
    notices: notices.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      createdAt: n.createdAt,
      read: (n.reads?.length ?? 0) > 0,
      readAt: n.reads?.[0]?.readAt ?? null,
    })),
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const title = (body?.title ?? '').toString().trim()
    const description = (body?.description ?? '').toString().trim()
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título e descrição são obrigatórios.' },
        { status: 400 }
      )
    }
    const notice = await prisma.notice.create({ data: { title, description } })
    return NextResponse.json({ notice })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao publicar aviso.' }, { status: 500 })
  }
}
