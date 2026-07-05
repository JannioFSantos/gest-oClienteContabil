import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getFileUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { client: true },
  })
  if (!doc) {
    return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 })
  }
  if (session.user.role === 'CLIENTE') {
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    })
    if (!client || client.id !== doc.clientId) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 })
    }
  }
  const url = await getFileUrl(doc.cloudStoragePath, doc.contentType, doc.isPublic)
  return NextResponse.json({ url, fileName: doc.fileName })
}
