'use client'

/**
 * Header du dashboard - inspiré de next-shadcn-admin-dashboard :
 * trigger sidebar + séparateur + titre de page, actions à droite.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ExternalLink, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPageMeta, roleColors, roleLabels } from './nav'
import type { SidebarUser } from './AppSidebar'

interface DashboardHeaderProps {
  user: SidebarUser | null
  onToggleCollapse: () => void
  onOpenMobile: () => void
}

export function DashboardHeader({
  user,
  onToggleCollapse,
  onOpenMobile,
}: DashboardHeaderProps) {
  const pathname = usePathname()
  const page = getPageMeta(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-4 lg:px-6">
        {/* Gauche : triggers + titre */}
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onOpenMobile}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 lg:hidden"
            aria-label="Ouvrir la navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            title="Replier/déplier la navigation (Ctrl+B)"
            className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100 lg:block"
            aria-label="Replier ou déplier la navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span
            className="mx-1 hidden h-5 w-px bg-white/10 lg:block"
            aria-hidden
          />

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-100 lg:text-lg">
              {page?.name ?? 'Tableau de bord'}
            </h1>
            {page?.description && (
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {page.description}
              </p>
            )}
          </div>
        </div>

        {/* Droite : actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-primary-500/40 hover:text-primary-300 md:flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Voir le site
          </Link>

          <button
            className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0a0a0f]" />
          </button>

          {user && (
            <div
              className={cn(
                'ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white',
                roleColors[user.role] ?? 'from-primary-500 to-accent-500'
              )}
              title={`${user.name} — ${roleLabels[user.role] ?? user.role}`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
