import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generatePresignedUploadUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const fileName = (body?.fileName ?? 'arquivo').toString()
    const contentType = (body?.contentType ?? 'application/octet-stream').toString()
    const isPublic = Boolean(body?.isPublic)
    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      isPublic
    )
    return NextResponse.json({ uploadUrl, cloudStoragePath: cloud_storage_path })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao preparar upload.' }, { status: 500 })
  }
}
