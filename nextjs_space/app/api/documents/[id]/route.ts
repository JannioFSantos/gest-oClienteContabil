import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { deleteFile } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const doc = await prisma.document.findUnique({ where: { id: params.id } })
  if (!doc) {
    return NextResponse.json({ error: 'Documento não encontrado.' }, { status: 404 })
  }
  // Contador pode remover qualquer; cliente só os próprios uploads
  if (session.user.role !== 'CONTADOR' && doc.uploadedById !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 })
  }
  try {
    await deleteFile(doc.cloudStoragePath).catch(() => {})
    await prisma.document.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao remover documento.' }, { status: 500 })
  }
}
