'use client'

/**
 * Layout Dashboard - coquille plein écran inspirée de
 * next-shadcn-admin-dashboard : sidebar repliable + header sticky.
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { AppSidebar } from './components/AppSidebar'
import { DashboardHeader } from './components/DashboardHeader'

const SIDEBAR_COLLAPSED_KEY = 'ggc-sidebar-collapsed'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const user = session?.user
    ? {
        name: session.user.name || '',
        role: (session.user as any).role || 'CASHIER',
        email: session.user.email || '',
      }
    : null

  // Rediriger vers /login si pas authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Restaurer l'état replié de la sidebar (persisté)
  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
      )
    } catch {
      /* localStorage indisponible : on garde l'état déplié */
    }
  }, [])

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [])

  // Raccourci Ctrl+B / ⌘B comme sur la démo shadcn
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleCollapsed()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggleCollapsed])

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // État de chargement pendant la récupération de la session
  if (status === 'loading') {
    return (
      <div className="dash-scope flex min-h-screen items-center justify-center bg-(--dash-bg)">
        <div className="text-center">
          <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="font-medium text-slate-500">Chargement…</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="dash-scope min-h-screen bg-(--dash-bg)">
      <AppSidebar
        user={user}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div
        className={cn(
          'flex min-h-screen flex-col transition-[padding] duration-200 ease-linear',
          collapsed ? 'lg:pl-[68px]' : 'lg:pl-64'
        )}
      >
        <DashboardHeader
          user={user}
          onToggleCollapse={toggleCollapsed}
          onOpenMobile={() => setSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-white/5 px-4 py-5 text-center text-xs text-slate-600 lg:px-8">
          <p>© 2026 Geek Gaming Center — Système de gestion CRM</p>
          <p className="mt-0.5">Yaoundé, Cameroun 🇨🇲</p>
        </footer>
      </div>
    </div>
  )
}
