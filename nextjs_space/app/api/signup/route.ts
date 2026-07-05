import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json(
      { error: 'Apenas contadores autorizados podem criar novas contas.' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json().catch(() => ({}))
    const email = (body?.email ?? '').toString().toLowerCase().trim()
    const password = (body?.password ?? '').toString()
    const name = (body?.name ?? '').toString().trim()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Preencha nome, e-mail e senha.' },
        { status: 400 }
      )
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter ao menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail.' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: { email, password: hashed, name, role: 'CONTADOR' },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao criar conta. Tente novamente.' },
      { status: 500 }
    )
  }
}
