import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generatePassword } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const accountants = await prisma.user.findMany({
    where: { role: 'CONTADOR' },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ accountants })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const email = (body?.email ?? '').toString().toLowerCase().trim()
    const name = (body?.name ?? '').toString().trim()
    const password = (body?.password ?? '').toString().trim()

    if (!email || !name) {
      return NextResponse.json({ error: 'Nome e e-mail são obrigatórios.' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Já existe um usuário com este e-mail.' }, { status: 409 })
    }

    const generatedPassword = password || generatePassword(10)
    const hashed = await bcrypt.hash(generatedPassword, 10)

    await prisma.user.create({
      data: { email, password: hashed, name, role: 'CONTADOR' },
    })

    return NextResponse.json({
      success: true,
      credentials: { email, password: generatedPassword },
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao criar contador.' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'ID do contador é obrigatório.' }, { status: 400 })
  }

  if (id === session.user.id) {
    return NextResponse.json({ error: 'Você não pode remover seu próprio acesso.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user || user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Contador não encontrado.' }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })

  return NextResponse.json({ success: true })
}