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
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { _count: { select: { documents: true, messages: true } } },
  })
  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }
  return NextResponse.json({ client })
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const data: any = {}
    if (body?.razaoSocial !== undefined) data.razaoSocial = body.razaoSocial.toString().trim()
    if (body?.nomeFantasia !== undefined) data.nomeFantasia = body.nomeFantasia?.toString().trim() || null
    if (body?.documento !== undefined) data.documento = body.documento.toString().trim()
    if (body?.regimeTributario !== undefined) data.regimeTributario = body.regimeTributario
    if (body?.telefone !== undefined) data.telefone = body.telefone?.toString().trim() || null
    if (body?.status !== undefined) data.status = body.status
    if (body?.email !== undefined) data.email = body.email.toString().toLowerCase().trim()

    // Atualiza Client
    const client = await prisma.client.update({
      where: { id: params.id },
      data,
    })

    // Sincroniza email no User vinculado
    if (body?.email !== undefined) {
      const newEmail = body.email.toString().toLowerCase().trim()
      if (newEmail) {
        await prisma.user.update({
          where: { id: client.userId },
          data: { email: newEmail },
        })
      }
    }

    return NextResponse.json({ client })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao atualizar cliente.' }, { status: 500 })
  }
}
