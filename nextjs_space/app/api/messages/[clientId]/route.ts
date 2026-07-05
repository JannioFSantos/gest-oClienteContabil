import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function authorize(session: any, clientId: string) {
  if (session.user.role === 'CONTADOR') {
    const client = await prisma.client.findUnique({ where: { id: clientId } })
    return client ? { ok: true, client } : { ok: false, client: null }
  }
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  })
  if (!client || client.id !== clientId) return { ok: false, client: null }
  return { ok: true, client }
}

export async function GET(
  _req: Request,
  { params }: { params: { clientId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const auth = await authorize(session, params.clientId)
  if (!auth.ok) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 })
  }

  // marca como lidas as mensagens enviadas pela outra parte
  const otherRole = session.user.role === 'CONTADOR' ? 'CLIENTE' : 'CONTADOR'
  await prisma.message.updateMany({
    where: { clientId: params.clientId, senderRole: otherRole as any, isRead: false },
    data: { isRead: true },
  })

  const messages = await prisma.message.findMany({
    where: { clientId: params.clientId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ messages, currentUserId: session.user.id })
}

export async function POST(
  req: Request,
  { params }: { params: { clientId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const auth = await authorize(session, params.clientId)
  if (!auth.ok) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const content = (body?.content ?? '').toString().trim()
    if (!content) {
      return NextResponse.json({ error: 'Mensagem vazia.' }, { status: 400 })
    }
    const message = await prisma.message.create({
      data: {
        clientId: params.clientId,
        senderId: session.user.id,
        senderRole: session.user.role as any,
        content,
        isRead: false,
      },
    })
    return NextResponse.json({ message })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao enviar mensagem.' }, { status: 500 })
  }
}
