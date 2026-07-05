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
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { client: true },
  })
  if (!user) return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    client: user.client,
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const name = (body?.name ?? '').toString().trim()
    const secretWord = (body?.secretWord ?? '').toString().trim()
    const secretHint = (body?.secretHint ?? '').toString().trim()

    const data: any = {}
    if (name) data.name = name
    if (secretWord) data.secretWord = secretWord
    if (body?.secretHint !== undefined) data.secretHint = secretHint || null
    if (!name && !secretWord && body?.secretHint === undefined) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar.' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
    })
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar perfil.' }, { status: 500 })
  }
}