import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const fileName = decodeURIComponent(params.name)
  // Sanitiza para evitar path traversal
  const safeName = path.basename(fileName)
  const filePath = path.join(process.cwd(), 'uploads', safeName)

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Arquivo não encontrado.', { status: 404 })
  }

  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(safeName).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.zip': 'application/zip',
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': mimeTypes[ext] ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeName}"`,
      'Content-Length': String(buffer.length),
    },
  })
}