import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CLIENTE') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  })
  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }
  try {
    await prisma.noticeRead.upsert({
      where: { noticeId_clientId: { noticeId: params.id, clientId: client.id } },
      update: {},
      create: { noticeId: params.id, clientId: client.id },
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao confirmar leitura.' }, { status: 500 })
  }
}
