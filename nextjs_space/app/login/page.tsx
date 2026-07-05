import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LoginForm } from './login-form'

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    redirect(session.user.role === 'CONTADOR' ? '/dashboard' : '/portal')
  }
  return <LoginForm />
}
