import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function resolveClientScope(session: any, requestedClientId?: string | null) {
  if (session.user.role === 'CONTADOR') {
    return { clientId: requestedClientId || null, ok: true }
  }
  // cliente: force own client
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  })
  if (!client) return { clientId: null, ok: false }
  return { clientId: client.id, ok: true }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const requestedClientId = searchParams.get('clientId')
  const year = searchParams.get('year')
  const month = searchParams.get('month')

  const scope = await resolveClientScope(session, requestedClientId)
  if (!scope.ok) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }

  const documents = await prisma.document.findMany({
    where: {
      ...(scope.clientId ? { clientId: scope.clientId } : {}),
      ...(year ? { year: parseInt(year) } : {}),
      ...(month ? { month: parseInt(month) } : {}),
    },
    orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
    include: { uploadedBy: { select: { name: true, role: true } } },
  })
  return NextResponse.json({ documents })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const requestedClientId = (body?.clientId ?? '').toString()
    const scope = await resolveClientScope(session, requestedClientId)
    if (!scope.ok || !scope.clientId) {
      return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 })
    }

    const year = parseInt((body?.year ?? '').toString())
    const month = parseInt((body?.month ?? '').toString())
    const category = (body?.category ?? 'OUTROS').toString()
    const fileName = (body?.fileName ?? 'arquivo').toString()
    const cloudStoragePath = (body?.cloudStoragePath ?? '').toString()
    const fileSize = parseInt((body?.fileSize ?? '0').toString()) || 0
    const contentType = (body?.contentType ?? 'application/octet-stream').toString()

    if (!year || !month || !cloudStoragePath) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }

    const doc = await prisma.document.create({
      data: {
        clientId: scope.clientId,
        year,
        month,
        category: category as any,
        fileName,
        cloudStoragePath,
        isPublic: false,
        fileSize,
        contentType,
        uploadedByRole: session.user.role as any,
        uploadedById: session.user.id,
      },
    })
    return NextResponse.json({ document: doc })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao registrar documento.' }, { status: 500 })
  }
}
