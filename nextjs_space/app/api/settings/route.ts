import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getStorageProvider } from '@/lib/storage'

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
    try {
      const storage = await getStorageProvider()
      logoUrl = await storage.getUrl(settings.logoPath, 'image/png')
    } catch { /* ignora */ }
  }
  return NextResponse.json({
    officeName: settings.officeName,
    primaryColor: settings.primaryColor,
    logoUrl,
    storageProvider: settings.storageProvider,
    googleDriveFolderId: settings.googleDriveFolderId,
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
    if (body?.storageProvider !== undefined) data.storageProvider = body.storageProvider
    if (body?.googleDriveFolderId !== undefined) data.googleDriveFolderId = body.googleDriveFolderId?.toString().trim() || null
    if (body?.googleServiceAccountJson !== undefined) data.googleServiceAccountJson = body.googleServiceAccountJson?.toString().trim() || null

    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data,
    })
    let logoUrl: string | null = null
    if (updated.logoPath) {
      try {
        const storage = await getStorageProvider()
        logoUrl = await storage.getUrl(updated.logoPath, 'image/png')
      } catch { /* ignora */ }
    }
    return NextResponse.json({
      officeName: updated.officeName,
      primaryColor: updated.primaryColor,
      logoUrl,
      storageProvider: updated.storageProvider,
      googleDriveFolderId: updated.googleDriveFolderId,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao salvar configurações.' }, { status: 500 })
  }
}