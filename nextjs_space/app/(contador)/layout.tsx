import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'

export const dynamic = 'force-dynamic'

export default async function ContadorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'CONTADOR') redirect('/portal')
  return (
    <AppShell role="CONTADOR" userName="Administrador">
      {children}
    </AppShell>
  )
}
