import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generatePassword } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').trim()
  const status = searchParams.get('status') ?? ''

  const clients = await prisma.client.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(q
        ? {
            OR: [
              { razaoSocial: { contains: q, mode: 'insensitive' } },
              { nomeFantasia: { contains: q, mode: 'insensitive' } },
              { documento: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { documents: true } },
    },
  })
  return NextResponse.json({ clients })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const razaoSocial = (body?.razaoSocial ?? '').toString().trim()
    const nomeFantasia = (body?.nomeFantasia ?? '').toString().trim()
    const documento = (body?.documento ?? '').toString().trim()
    const regimeTributario = (body?.regimeTributario ?? 'SIMPLES_NACIONAL').toString()
    const email = (body?.email ?? '').toString().toLowerCase().trim()
    const telefone = (body?.telefone ?? '').toString().trim()

    if (!razaoSocial || !documento || !email) {
      return NextResponse.json(
        { error: 'Razão Social, CNPJ/CPF e E-mail são obrigatórios.' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um usuário com este e-mail.' },
        { status: 409 }
      )
    }

    const password = (body?.password ?? '').toString().trim()
    const generatedPassword = password || generatePassword(10)
    const hashed = await bcrypt.hash(generatedPassword, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: nomeFantasia || razaoSocial,
        role: 'CLIENTE',
      },
    })

    const client = await prisma.client.create({
      data: {
        userId: user.id,
        razaoSocial,
        nomeFantasia: nomeFantasia || null,
        documento,
        regimeTributario: regimeTributario as any,
        email,
        telefone: telefone || null,
        status: 'ATIVO',
      },
    })

    return NextResponse.json({
      client,
      credentials: { email, password: generatedPassword },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Erro ao cadastrar cliente.' },
      { status: 500 }
    )
  }
}
