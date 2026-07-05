import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AppShell } from '@/components/app-shell'

export const dynamic = 'force-dynamic'

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'CLIENTE') redirect('/dashboard')

  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
    select: { nomeFantasia: true, razaoSocial: true },
  })
  const displayName = client?.nomeFantasia || client?.razaoSocial || session.user.name || 'Cliente'

  return (
    <AppShell role="CLIENTE" userName={displayName}>
      {children}
    </AppShell>
  )
}
