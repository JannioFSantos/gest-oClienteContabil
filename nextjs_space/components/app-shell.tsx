'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageSquare,
  Megaphone,
  Settings,
  Home,
  LogOut,
  Menu,
  X,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type NavItem = {
  href: string
  label: string
  icon: keyof typeof ICONS
  badgeKey?: 'messages'
}

const ICONS = {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageSquare,
  Megaphone,
  Settings,
  Home,
}

const CONTADOR_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Painel', icon: 'LayoutDashboard' },
  { href: '/clientes', label: 'Clientes', icon: 'Users' },
  { href: '/documentos', label: 'Documentos', icon: 'FolderOpen' },
  { href: '/mensagens', label: 'Mensagens', icon: 'MessageSquare', badgeKey: 'messages' },
  { href: '/avisos', label: 'Avisos', icon: 'Megaphone' },
  { href: '/configuracoes', label: 'Configurações', icon: 'Settings' },
]

const CLIENTE_NAV: NavItem[] = [
  { href: '/portal', label: 'Início', icon: 'Home' },
  { href: '/portal/documentos', label: 'Documentos', icon: 'FolderOpen' },
  { href: '/portal/mensagens', label: 'Mensagens', icon: 'MessageSquare', badgeKey: 'messages' },
  { href: '/portal/avisos', label: 'Avisos', icon: 'Megaphone' },
]

export function AppShell({
  role,
  userName,
  children,
}: {
  role: 'CONTADOR' | 'CLIENTE'
  userName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [officeName, setOfficeName] = useState('Gestão Contábil')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)

  const nav = role === 'CONTADOR' ? CONTADOR_NAV : CLIENTE_NAV

  useEffect(() => {
    let active = true
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return
        if (d?.officeName) setOfficeName(d.officeName)
        if (d?.logoUrl) setLogoUrl(d.logoUrl)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const load = () => {
      fetch('/api/messages/unread')
        .then((r) => r.json())
        .then((d) => {
          if (active) setUnread(d?.unread ?? 0)
        })
        .catch(() => {})
    }
    load()
    const t = setInterval(load, 15000)
    return () => {
      active = false
      clearInterval(t)
    }
  }, [pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.replace('/login')
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt="Logo do escritório"
            className="h-10 w-10 rounded-md object-contain bg-white"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold leading-tight text-foreground">
            {officeName}
          </p>
          <p className="text-xs text-muted-foreground">
            {role === 'CONTADOR' ? 'Painel do Contador' : 'Portal do Cliente'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const Icon = ICONS[item.icon]
          const active =
            pathname === item.href ||
            (item.href !== '/portal' &&
              item.href !== '/dashboard' &&
              pathname.startsWith(item.href))
          const showBadge = item.badgeKey === 'messages' && unread > 0
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-fast',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground">
            {role === 'CONTADOR' ? 'Contador' : 'Cliente'}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sair
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">{SidebarContent}</div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-display text-sm font-bold">{officeName}</span>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
