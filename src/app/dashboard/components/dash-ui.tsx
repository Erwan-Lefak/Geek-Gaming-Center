'use client'

/**
 * Primitives UI du dashboard - thème sombre unifié pour toutes les pages
 * (/dashboard/*). Source unique : cartes, badges de statut, stats compactes,
 * en-têtes de page et styles de formulaires.
 */

import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

// ============================================================
// Badges
// ============================================================

export type DashTone = 'emerald' | 'amber' | 'sky' | 'violet' | 'rose' | 'cyan' | 'slate'

const toneClasses: Record<DashTone, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-300',
  amber: 'bg-amber-500/15 text-amber-300',
  sky: 'bg-sky-500/15 text-sky-300',
  violet: 'bg-violet-500/15 text-violet-300',
  rose: 'bg-rose-500/15 text-rose-300',
  cyan: 'bg-cyan-500/15 text-cyan-300',
  slate: 'bg-slate-500/15 text-slate-300',
}

export function DashBadge({
  label,
  tone = 'slate',
  className,
}: {
  label: string
  tone?: DashTone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className
      )}
    >
      {label}
    </span>
  )
}

// ---- Métadonnées de statut (label FR + ton) : source unique ----

export type StatusMeta = { label: string; tone: DashTone }

export const orderStatusMeta: Record<string, StatusMeta> = {
  PENDING: { label: 'En attente', tone: 'amber' },
  CONFIRMED: { label: 'Confirmée', tone: 'sky' },
  PREPARING: { label: 'En préparation', tone: 'violet' },
  READY: { label: 'Prête', tone: 'cyan' },
  COMPLETED: { label: 'Terminée', tone: 'emerald' },
  CANCELLED: { label: 'Annulée', tone: 'rose' },
}

export const paymentStatusMeta: Record<string, StatusMeta> = {
  PAID: { label: 'Payé', tone: 'emerald' },
  PENDING: { label: 'En attente', tone: 'amber' },
  PARTIALLY_PAID: { label: 'Partiel', tone: 'sky' },
  FAILED: { label: 'Échoué', tone: 'rose' },
  CANCELLED: { label: 'Annulé', tone: 'rose' },
  REFUNDED: { label: 'Remboursé', tone: 'slate' },
}

export const sessionStatusMeta: Record<string, StatusMeta> = {
  PENDING: { label: 'En attente', tone: 'amber' },
  ACTIVE: { label: 'En cours', tone: 'emerald' },
  PAUSED: { label: 'En pause', tone: 'amber' },
  COMPLETED: { label: 'Terminée', tone: 'slate' },
  EXPIRED: { label: 'Expirée', tone: 'rose' },
  CANCELLED: { label: 'Annulée', tone: 'rose' },
}

export const reservationStatusMeta: Record<string, StatusMeta> = {
  PENDING: { label: 'En attente', tone: 'amber' },
  CONFIRMED: { label: 'Confirmée', tone: 'sky' },
  CHECKED_IN: { label: 'Présent', tone: 'violet' },
  ACTIVE: { label: 'En cours', tone: 'emerald' },
  COMPLETED: { label: 'Terminée', tone: 'slate' },
  CANCELLED: { label: 'Annulée', tone: 'rose' },
  NO_SHOW: { label: 'Absent', tone: 'amber' },
}

export const equipmentStatusMeta: Record<string, StatusMeta> = {
  AVAILABLE: { label: 'Disponible', tone: 'emerald' },
  IN_USE: { label: 'Occupé', tone: 'sky' },
  RESERVED: { label: 'Réservé', tone: 'violet' },
  MAINTENANCE: { label: 'Maintenance', tone: 'amber' },
  BROKEN: { label: 'En panne', tone: 'rose' },
  RETIRED: { label: 'Retiré', tone: 'slate' },
}

export const customerStatusMeta: Record<string, StatusMeta> = {
  NEW: { label: 'Nouveau', tone: 'sky' },
  REGULAR: { label: 'Régulier', tone: 'slate' },
  VIP: { label: 'VIP', tone: 'emerald' },
  INACTIVE: { label: 'Inactif', tone: 'amber' },
  BLOCKED: { label: 'Bloqué', tone: 'rose' },
}

export function StatusBadge({
  status,
  meta,
}: {
  status: string
  meta: Record<string, StatusMeta>
}) {
  const m = meta[status] ?? { label: status, tone: 'slate' as DashTone }
  return <DashBadge label={m.label} tone={m.tone} />
}

// ============================================================
// Structure de page
// ============================================================

export function DashPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-50 lg:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function DashCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <section className={cn('dash-card flex flex-col p-5 lg:p-6', className)}>
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-slate-100">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={cn('min-w-0 flex-1', contentClassName)}>{children}</div>
    </section>
  )
}

export function DashStat({
  icon: Icon,
  label,
  value,
  tone = 'slate',
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  tone?: DashTone
  hint?: string
}) {
  return (
    <div className="dash-card flex items-center gap-4 p-5">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
          toneClasses[tone].replace('/15', '/10')
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-slate-50 tabular-nums">
          {value}
        </p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  )
}

export function DashEmpty({
  icon: Icon,
  title,
  hint,
  className,
}: {
  icon: LucideIcon
  title: string
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-12 text-center',
        className
      )}
    >
      <Icon className="h-8 w-8 text-slate-600" />
      <p className="text-sm text-slate-500">{title}</p>
      {hint && <p className="text-xs text-slate-600">{hint}</p>}
    </div>
  )
}

// ============================================================
// Formulaires & boutons (chaînes de classes partagées)
// ============================================================

export const dashInputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 transition-colors focus:border-primary-500/50 focus:outline-none focus:ring-1 focus:ring-primary-500/30'

export const dashSelectCls = cn(dashInputCls, 'appearance-none pr-8')

export const dashBtnPrimaryCls =
  'inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-colors hover:bg-primary-500'

export const dashBtnOutlineCls =
  'inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-primary-500/40 hover:text-primary-300'

export const dashBtnGhostCls =
  'inline-flex items-center gap-1.5 rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200'

// ============================================================
// Tableau
// ============================================================

export const dashTableHeadCls =
  'border-b border-white/5 pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500'

export const dashTableRowCls =
  'border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]'
