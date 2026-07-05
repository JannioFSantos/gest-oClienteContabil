import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token
    const path = req.nextUrl.pathname
    const role = token?.role

    const contadorPaths = [
      '/dashboard',
      '/clientes',
      '/documentos',
      '/mensagens',
      '/avisos',
      '/configuracoes',
    ]
    const isContadorPath = contadorPaths.some(
      (p) => path === p || path.startsWith(p + '/')
    )
    const isPortalPath = path === '/portal' || path.startsWith('/portal/')

    if (isContadorPath && role !== 'CONTADOR') {
      return NextResponse.redirect(new URL('/portal', req.url))
    }
    if (isPortalPath && role !== 'CLIENTE') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clientes/:path*',
    '/documentos/:path*',
    '/mensagens/:path*',
    '/avisos/:path*',
    '/configuracoes/:path*',
    '/portal/:path*',
  ],
}
