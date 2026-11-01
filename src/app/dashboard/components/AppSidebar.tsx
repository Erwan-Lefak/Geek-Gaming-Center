'use client'

/**
 * Sidebar du dashboard - inspirée du composant Sidebar de shadcn/ui
 * (next-shadcn-admin-dashboard) : groupes de navigation, mode icône replié,
 * drawer mobile, footer utilisateur.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  navGroups,
  roleColors,
  roleLabels,
  type NavItem,
} from './nav'

export type SidebarUser = {
  name: string
  role: string
  email: string
}

interface AppSidebarProps {
  user: SidebarUser | null
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
  onLogout: () => void
}

function NavItems({
  collapsed,
  onNavigate,
  userRole,
}: {
  collapsed: boolean
  onNavigate?: () => void
  userRole: string
}) {
  const pathname = usePathname()

  const isActive = (item: NavItem) =>
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href)

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 dash-scroll">
      {navGroups.map((group) => {
        const items = group.items.filter((item) =>
          item.roles.includes(userRole)
        )
        if (items.length === 0) return null

        return (
          <div key={group.label} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {group.label}
              </p>
            )}
            {collapsed && (
              <div className="mx-3 mb-2 h-px bg-white/5" aria-hidden />
            )}
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActive(item)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.name : undefined}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-colors duration-150',
                        collapsed && 'justify-center px-0',
                        active
                          ? 'bg-primary-500/12 text-primary-300'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary-400" />
                      )}
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

function SidebarFooter({
  user,
  collapsed,
  onLogout,
}: {
  user: SidebarUser | null
  collapsed: boolean
  onLogout: () => void
}) {
  if (!user) return null

  return (
    <div className="border-t border-white/5 p-3">
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl bg-white/[0.04] p-3',
          collapsed && 'justify-center bg-transparent p-0'
        )}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white',
            roleColors[user.role] ?? 'from-primary-500 to-accent-500'
          )}
          title={!collapsed ? undefined : user.name}
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-100">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {roleLabels[user.role] ?? user.role}
            </p>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onLogout}
            title="Déconnexion"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Déconnexion</span>
          </button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={onLogout}
          title="Déconnexion"
          className="mt-2 flex w-full items-center justify-center rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-rose-400"
        >
          <LogOut className="h-4 w-4" />
          <span className="sr-only">Déconnexion</span>
        </button>
      )}
    </div>
  )
}

export function AppSidebar({
  user,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: AppSidebarProps) {
  const userRole = user?.role ?? 'CASHIER'

  const brand = (isCollapsed: boolean) => (
    <div
      className={cn(
        'flex h-16 shrink-0 items-center gap-3 border-b border-white/5 px-4',
        isCollapsed && 'justify-center px-0'
      )}
    >
      <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
        <div className="relative h-9 w-9 shrink-0">
          <Image
            src="/logo.png"
            alt="Geek Gaming Center"
            fill
            className="object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-bold text-slate-100">GGC CRM</p>
            <p className="truncate text-[11px] text-slate-500">
              Geek Gaming Center
            </p>
          </div>
        )}
      </Link>
      {!isCollapsed && (
        <button
          onClick={onToggleCollapse}
          title="Replier la navigation (Ctrl+B)"
          className="ml-auto hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200 lg:block"
        >
          <PanelLeftClose className="h-4 w-4" />
          <span className="sr-only">Replier la sidebar</span>
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* ======= Desktop (fixe, repliable en mode icône) ======= */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/5 bg-[#0d0d14]/95 backdrop-blur-xl transition-[width] duration-200 ease-linear lg:flex',
          collapsed ? 'w-[68px]' : 'w-64'
        )}
      >
        {brand(collapsed)}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            title="Déplier la navigation (Ctrl+B)"
            className="mx-auto mt-2 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <PanelLeftOpen className="h-4 w-4" />
            <span className="sr-only">Déplier la sidebar</span>
          </button>
        )}
        <NavItems collapsed={collapsed} userRole={userRole} />
        <SidebarFooter user={user} collapsed={collapsed} onLogout={onLogout} />
      </aside>

      {/* ======= Mobile (drawer overlay) ======= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-white/10 bg-[#0d0d14] shadow-2xl">
            {brand(false)}
            <NavItems
              collapsed={false}
              onNavigate={onCloseMobile}
              userRole={userRole}
            />
            <SidebarFooter user={user} collapsed={false} onLogout={onLogout} />
          </aside>
        </div>
      )}
    </>
  )
}
