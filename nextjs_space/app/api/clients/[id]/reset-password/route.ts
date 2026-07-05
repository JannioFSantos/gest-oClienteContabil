import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generatePassword } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'CONTADOR') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: { userId: true, email: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }

  const newPassword = generatePassword(10)
  const hashed = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: client.userId },
    data: { password: hashed },
  })

  return NextResponse.json({
    success: true,
    email: client.email,
    password: newPassword,
  })
}