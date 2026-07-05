import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

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
    if (body?.title !== undefined) data.title = body.title.toString().trim()
    if (body?.description !== undefined) data.description = body.description.toString().trim()

    if (!data.title && !data.description) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar.' }, { status: 400 })
    }

    const notice = await prisma.notice.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ notice })
  } catch {
    return NextResponse.json({ error: 'Erro ao editar aviso.' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    await prisma.notice.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir aviso.' }, { status: 500 })
  }
}