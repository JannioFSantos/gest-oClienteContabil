import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './db'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { client: true },
  })
  return user
}

export async function requireContador() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'CONTADOR') return null
  return user
}
