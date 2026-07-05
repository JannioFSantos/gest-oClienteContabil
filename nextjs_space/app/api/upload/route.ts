import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStorageProvider } from '@/lib/storage'
import { generatePresignedUploadUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const storage = await getStorageProvider()
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const cloudStoragePath = await storage.upload(file.name, buffer, file.type || 'application/octet-stream')

    return NextResponse.json({ cloudStoragePath })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao fazer upload.' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('fileName') ?? 'arquivo'
    const contentType = searchParams.get('contentType') ?? 'application/octet-stream'
    const isPublic = searchParams.get('isPublic') === 'true'

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      fileName,
      contentType,
      isPublic
    )

    return NextResponse.json({ uploadUrl, cloudStoragePath: cloud_storage_path })
  } catch {
    return NextResponse.json({ error: 'Erro ao preparar upload.' }, { status: 500 })
  }
}