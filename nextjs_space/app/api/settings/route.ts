import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getFileUrl } from '@/lib/s3'

export const dynamic = 'force-dynamic'

async function getOrCreateSettings() {
  let settings = await prisma.settings.findFirst()
  if (!settings) {
    settings = await prisma.settings.create({ data: {} })
  }
  return settings
}

export async function GET() {
  const settings = await getOrCreateSettings()
  let logoUrl: string | null = null
  if (settings.logoPath) {
    logoUrl = await getFileUrl(settings.logoPath, 'image/png', true).catch(() => null)
  }
  return NextResponse.json({
    officeName: settings.officeName,
    primaryColor: settings.primaryColor,
    logoUrl,
  })
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  try {
    const body = await req.json().catch(() => ({}))
    const settings = await getOrCreateSettings()
    const data: any = {}
    if (body?.officeName !== undefined) data.officeName = body.officeName.toString().trim() || 'Gestão Contábil'
    if (body?.primaryColor !== undefined) data.primaryColor = body.primaryColor.toString()
    if (body?.logoPath !== undefined) data.logoPath = body.logoPath?.toString() || null
    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data,
    })
    let logoUrl: string | null = null
    if (updated.logoPath) {
      logoUrl = await getFileUrl(updated.logoPath, 'image/png', true).catch(() => null)
    }
    return NextResponse.json({
      officeName: updated.officeName,
      primaryColor: updated.primaryColor,
      logoUrl,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar configurações.' }, { status: 500 })
  }
}
