'use client'

/**
 * Page d'accueil du dashboard - inspirée de la page "default"
 * de next-shadcn-admin-dashboard : metric cards, graphiques recharts,
 * dernières commandes et sessions en cours — avec données réelles
 * via /api/dashboard/stats.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
} from 'recharts'
import {
  ArrowUpRight,
  Banknote,
  CalendarDays,
  ChevronRight,
  Gamepad2,
  Package,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  UtensilsCrossed,
  Wrench,
  FileText,
  TriangleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

// ============================================================
// Types & helpers
// ============================================================

type Stats = {
  kpis: {
    revenueToday: number
    revenueYesterday: number
    trendRevenue: number | null
    activeSessions: number
    pausedSessions: number
    newCustomers30: number
    trendCustomers: number | null
    lowStockCount: number
    openRestaurantOrders: number
  }
  series: { date: string; caisse: number; boutique: number }[]
  revenueSplit30d: { caisse: number; boutique: number; restaurant: number }
  activeSessionsList: {
    id: string
    sessionNumber: string
    status: string
    startedAt: string | null
    scheduledEndAt: string
    price: number
    equipmentName: string
    customerName: string
  }[]
  recentOrders: {
    id: string
    orderNumber: string
    status: string
    paymentStatus: string
    totalAmount: number
    createdAt: string
    customerName: string
  }[]
  lowStockProducts: {
    id: string
    name: string
    currentStock: number
    minStock: number
  }[]
  upcomingEvents: {
    id: string
    title: string
    eventDate: string
    maxCapacity: number
    bookedCount: number
    availableSlots: number
  }[]
}

const fcfa = (n: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} FCFA`

const fcfaCompact = (n: number) => {
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toLocaleString('fr-FR', {
      maximumFractionDigits: 1,
    })} M`
  if (n >= 1_000)
    return `${(n / 1_000).toLocaleString('fr-FR', {
      maximumFractionDigits: 0,
    })} k`
  return String(n)
}

const orderStatusMeta: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'En attente', cls: 'bg-amber-500/15 text-amber-300' },
  CONFIRMED: { label: 'Confirmée', cls: 'bg-sky-500/15 text-sky-300' },
  PREPARING: { label: 'En préparation', cls: 'bg-violet-500/15 text-violet-300' },
  READY: { label: 'Prête', cls: 'bg-cyan-500/15 text-cyan-300' },
  COMPLETED: { label: 'Terminée', cls: 'bg-emerald-500/15 text-emerald-300' },
  CANCELLED: { label: 'Annulée', cls: 'bg-rose-500/15 text-rose-300' },
}

const paymentStatusMeta: Record<string, { label: string; cls: string }> = {
  PAID: { label: 'Payé', cls: 'bg-emerald-500/15 text-emerald-300' },
  PENDING: { label: 'En attente', cls: 'bg-amber-500/15 text-amber-300' },
  PARTIALLY_PAID: { label: 'Partiel', cls: 'bg-sky-500/15 text-sky-300' },
  CANCELLED: { label: 'Annulé', cls: 'bg-rose-500/15 text-rose-300' },
  REFUNDED: { label: 'Remboursé', cls: 'bg-slate-500/15 text-slate-300' },
}

// ============================================================
// Blocs UI
// ============================================================

function TrendBadge({ trend }: { trend: number | null }) {
  if (trend === null) return null
  const up = trend >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold',
        up
          ? 'bg-emerald-500/15 text-emerald-300'
          : 'bg-rose-500/15 text-rose-300'
      )}
    >
      <Icon className="h-3 w-3" />
      {up ? '+' : ''}
      {trend.toLocaleString('fr-FR')}%
    </span>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  hint,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  trend?: number | null
  hint: string
  accent: 'sky' | 'emerald' | 'violet' | 'amber'
}) {
  const accents = {
    sky: 'text-sky-300 bg-sky-500/10 border-sky-500/20',
    emerald: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-300 bg-violet-500/10 border-violet-500/20',
    amber: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  }
  return (
    <div className="dash-card flex flex-col gap-3 p-5">
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-lg border',
          accents[accent]
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-2xl font-semibold tracking-tight text-slate-50 tabular-nums lg:text-3xl">
            {value}
          </span>
          {trend !== undefined && <TrendBadge trend={trend} />}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      </div>
    </div>
  )
}

function CardShell({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('dash-card flex flex-col p-5 lg:p-6', className)}>
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

function SkeletonCards() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="dash-card h-[148px] animate-pulse p-5">
            <div className="mb-4 h-8 w-8 rounded-lg bg-white/5" />
            <div className="mb-2 h-3 w-24 rounded bg-white/5" />
            <div className="h-7 w-32 rounded bg-white/5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="dash-card h-80 animate-pulse lg:col-span-2" />
        <div className="dash-card h-80 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="dash-card h-72 animate-pulse lg:col-span-2" />
        <div className="dash-card h-72 animate-pulse" />
      </div>
    </div>
  )
}

// ============================================================
// Graphiques
// ============================================================

const revenueChartConfig = {
  caisse: { label: 'Caisse (salles & boutique)', color: 'var(--chart-1)' },
  boutique: { label: 'Boutique en ligne', color: 'var(--chart-2)' },
} satisfies ChartConfig

const splitChartConfig = {
  caisse: { label: 'Caisse', color: 'var(--chart-1)' },
  boutique: { label: 'Boutique en ligne', color: 'var(--chart-2)' },
  restaurant: { label: 'Restaurant', color: 'var(--chart-3)' },
} satisfies ChartConfig

function RevenueAreaChart({ series }: { series: Stats['series'] }) {
  return (
    <ChartContainer
      config={revenueChartConfig}
      className="h-72 w-full sm:h-80"
    >
      <AreaChart data={series} margin={{ top: 4 }}>
        <defs>
          <linearGradient id="fillCaisse" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-caisse)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-caisse)" stopOpacity={0.04} />
          </linearGradient>
          <linearGradient id="fillBoutique" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-boutique)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-boutique)"
              stopOpacity={0.03}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeOpacity={0.12} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value: string) =>
            new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
            })
          }
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(value) =>
                new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              }
              formatter={(value) => fcfa(Number(value))}
            />
          }
        />
        <ChartLegend
          verticalAlign="top"
          content={<ChartLegendContent className="mb-4 justify-end" />}
        />
        <Area
          dataKey="caisse"
          type="natural"
          fill="url(#fillCaisse)"
          stroke="var(--color-caisse)"
          strokeWidth={1.6}
          dot={false}
        />
        <Area
          dataKey="boutique"
          type="natural"
          fill="url(#fillBoutique)"
          stroke="var(--color-boutique)"
          strokeWidth={1.4}
          dot={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

function RevenueSplitDonut({ split }: { split: Stats['revenueSplit30d'] }) {
  const data = [
    { key: 'caisse', value: split.caisse },
    { key: 'boutique', value: split.boutique },
    { key: 'restaurant', value: split.restaurant },
  ].filter((d) => d.value > 0)

  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
        <Banknote className="h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">
          Aucun chiffre d&apos;affaires enregistré
          <br />
          sur les 30 derniers jours
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <ChartContainer
        config={splitChartConfig}
        className="mx-auto aspect-square max-h-56 w-full"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      {splitChartConfig[name as keyof typeof splitChartConfig]
                        ?.label ?? name}
                    </span>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {fcfa(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="key"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={4}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={`var(--color-${entry.key})`}
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] uppercase tracking-wider text-slate-500">
          Total 30 j
        </span>
        <span className="text-lg font-semibold text-slate-100 tabular-nums">
          {fcfaCompact(total)}
        </span>
        <span className="text-[11px] text-slate-500">FCFA</span>
      </div>
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {data.map((d) => (
          <li
            key={d.key}
            className="flex items-center gap-1.5 text-xs text-slate-400"
          >
            <span
              className="h-2 w-2 rounded-[2px]"
              style={{ backgroundColor: `var(--color-${d.key})` }}
            />
            {splitChartConfig[d.key as keyof typeof splitChartConfig].label}
            <span className="text-slate-500">
              {total > 0
                ? `${Math.round((d.value / total) * 100)} %`
                : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================
// Listes
// ============================================================

function RecentOrdersTable({ orders }: { orders: Stats['recentOrders'] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Package className="h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">Aucune commande pour le moment</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto dash-scroll">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
            <th className="pb-3 pr-4 font-medium">Commande</th>
            <th className="pb-3 pr-4 font-medium">Client</th>
            <th className="pb-3 pr-4 font-medium">Statut</th>
            <th className="pb-3 pr-4 font-medium">Paiement</th>
            <th className="pb-3 pr-4 text-right font-medium">Montant</th>
            <th className="pb-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const st = orderStatusMeta[o.status] ?? {
              label: o.status,
              cls: 'bg-slate-500/15 text-slate-300',
            }
            const pay = paymentStatusMeta[o.paymentStatus] ?? {
              label: o.paymentStatus,
              cls: 'bg-slate-500/15 text-slate-300',
            }
            return (
              <tr
                key={o.id}
                className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
              >
                <td className="py-3 pr-4 font-medium text-slate-200">
                  {o.orderNumber}
                </td>
                <td className="py-3 pr-4 text-slate-400">{o.customerName}</td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      'inline-block rounded-md px-2 py-0.5 text-xs font-medium',
                      st.cls
                    )}
                  >
                    {st.label}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={cn(
                      'inline-block rounded-md px-2 py-0.5 text-xs font-medium',
                      pay.cls
                    )}
                  >
                    {pay.label}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right font-medium text-slate-200 tabular-nums">
                  {fcfa(o.totalAmount)}
                </td>
                <td className="py-3 text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ActiveSessionsList({ sessions }: { sessions: Stats['activeSessionsList'] }) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Gamepad2 className="h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">Aucune session en cours</p>
        <Link
          href="/dashboard/caisse"
          className="text-sm font-medium text-primary-300 hover:text-primary-200"
        >
          Ouvrir une session →
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {sessions.map((s) => {
        const paused = s.status === 'PAUSED'
        const end = new Date(s.scheduledEndAt)
        const soon = end.getTime() - Date.now() < 15 * 60 * 1000
        return (
          <li
            key={s.id}
            className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3"
          >
            <span
              className={cn(
                'relative flex h-2.5 w-2.5 shrink-0 rounded-full',
                paused ? 'bg-amber-400' : soon ? 'bg-rose-400' : 'bg-emerald-400'
              )}
            >
              {!paused && (
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-200">
                {s.equipmentName}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {s.customerName}
                </span>
              </p>
              <p className="text-xs text-slate-500">
                {paused ? 'En pause' : 'Jusqu’à'}{' '}
                {end.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' · '}
                {fcfa(s.price)}
              </p>
            </div>
            <Link
              href="/dashboard/sessions"
              className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/5 hover:text-primary-300"
              aria-label="Voir les sessions"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function EventsCard({ events }: { events: Stats['upcomingEvents'] }) {
  const alerts = events.filter((e) => e.availableSlots <= 10)

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <CalendarDays className="h-8 w-8 text-slate-600" />
        <p className="text-sm text-slate-500">Aucun événement à venir</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {events.slice(0, 4).map((e) => {
        const full = e.availableSlots === 0
        const almost = e.availableSlots > 0 && e.availableSlots <= 10
        const fillPct = Math.min(
          100,
          Math.round((e.bookedCount / Math.max(1, e.maxCapacity)) * 100)
        )
        return (
          <li key={e.id} className="rounded-xl bg-white/[0.03] p-3">
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <p className="truncate text-sm font-medium text-slate-200">
                {e.title}
              </p>
              {full ? (
                <span className="shrink-0 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-300">
                  Complet
                </span>
              ) : almost ? (
                <span className="shrink-0 rounded-md bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  Presque complet
                </span>
              ) : null}
            </div>
            <p className="mb-2 text-xs text-slate-500">
              {new Date(e.eventDate).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}{' '}
              · {e.availableSlots} / {e.maxCapacity} places
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  full
                    ? 'bg-rose-400'
                    : almost
                      ? 'bg-amber-400'
                      : 'bg-primary-400'
                )}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </li>
        )
      })}
      {alerts.length > 0 && (
        <li className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {alerts.length} événement{alerts.length > 1 ? 's' : ''} presque
          complet{alerts.length > 1 ? 's' : ''} — pensez à augmenter la capacité
        </li>
      )}
    </ul>
  )
}

// ============================================================
// Actions rapides
// ============================================================

const quickActions = [
  {
    name: 'Nouvelle session',
    href: '/dashboard/caisse',
    icon: Gamepad2,
    roles: ['CASHIER', 'MANAGER', 'ADMIN'],
  },
  {
    name: 'Nouveau client',
    href: '/dashboard/customers',
    icon: UserPlus,
    roles: ['CASHIER', 'MANAGER', 'ADMIN'],
  },
  {
    name: 'Factures',
    href: '/dashboard/invoices',
    icon: FileText,
    roles: ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'],
  },
  {
    name: 'Équipements',
    href: '/dashboard/equipment',
    icon: Wrench,
    roles: ['TECHNICIAN', 'MANAGER', 'ADMIN'],
  },
  {
    name: 'Produits',
    href: '/dashboard/products',
    icon: Package,
    roles: ['MANAGER', 'ADMIN'],
  },
  {
    name: 'Rapports',
    href: '/dashboard/reports',
    icon: TrendingUp,
    roles: ['MANAGER', 'SHAREHOLDER', 'ADMIN'],
  },
]

function QuickActions({ role }: { role: string }) {
  const actions = quickActions.filter((a) => a.roles.includes(role))
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="group flex flex-col items-center justify-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500/30 hover:bg-primary-500/5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500/10 text-primary-300 transition-colors group-hover:bg-primary-500/20">
            <a.icon className="h-4.5 w-4.5" />
          </span>
          <span className="text-center text-xs font-medium text-slate-300 group-hover:text-slate-100">
            {a.name}
          </span>
        </Link>
      ))}
    </div>
  )
}

// ============================================================
// Page
// ============================================================

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)

  const user = session?.user
    ? {
        name: session.user.name || '',
        role: (session.user as any).role || 'CASHIER',
      }
    : null

  useEffect(() => {
    if (status !== 'authenticated') return
    let cancelled = false
    fetch('/api/dashboard/stats')
      .then(async (res) => {
        if (!res.ok) throw new Error('Échec du chargement des statistiques')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setStats(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [status])

  if (status === 'loading' || (!stats && !error)) {
    return <SkeletonCards />
  }

  const greeting = new Date().getHours() >= 18 ? 'Bonsoir' : 'Bonjour'
  const todayLabel = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const k = stats?.kpis
  const split = stats?.revenueSplit30d ?? {
    caisse: 0,
    boutique: 0,
    restaurant: 0,
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* En-tête de page */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-50">
            {greeting}
            {user?.name ? `, ${user.name}` : ''} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 first-letter:uppercase">
            {todayLabel} — voici l&apos;activité du Geek Gaming Center
          </p>
        </div>
        {k && k.openRestaurantOrders > 0 && (
          <Link
            href="/dashboard/restaurant"
            className="flex items-center gap-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/15"
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {k.openRestaurantOrders} commande
            {k.openRestaurantOrders > 1 ? 's' : ''} restaurant en cours
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {error && (
        <div className="dash-card border-rose-500/30 p-4 text-sm text-rose-300">
          {error} —{' '}
          <button
            className="underline"
            onClick={() => {
              setError(null)
              fetch('/api/dashboard/stats')
                .then((r) => r.json())
                .then(setStats)
                .catch(() => setError('Nouvelle tentative échouée'))
            }}
          >
            réessayer
          </button>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Banknote}
          label="CA aujourd'hui"
          value={fcfa(k?.revenueToday ?? 0)}
          trend={k?.trendRevenue ?? null}
          hint={`Hier : ${fcfa(k?.revenueYesterday ?? 0)}`}
          accent="emerald"
        />
        <MetricCard
          icon={Gamepad2}
          label="Sessions actives"
          value={String(k?.activeSessions ?? 0)}
          hint={
            (k?.pausedSessions ?? 0) > 0
              ? `${k?.pausedSessions} en pause`
              : 'Toutes les sessions tournent'
          }
          accent="sky"
        />
        <MetricCard
          icon={Users}
          label="Nouveaux clients (30 j)"
          value={String(k?.newCustomers30 ?? 0)}
          trend={k?.trendCustomers ?? null}
          hint="Comparé aux 30 jours précédents"
          accent="violet"
        />
        <MetricCard
          icon={TriangleAlert}
          label="Alertes stock"
          value={String(k?.lowStockCount ?? 0)}
          hint={
            (k?.lowStockCount ?? 0) > 0
              ? (stats?.lowStockProducts ?? [])
                  .slice(0, 2)
                  .map((p) => p.name)
                  .join(', ')
              : 'Stocks au niveau minimal'
          }
          accent="amber"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardShell
          title="Chiffre d'affaires"
          description="Caisse et boutique en ligne — 14 derniers jours"
          className="lg:col-span-2"
          action={
            <Link
              href="/dashboard/reports"
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-primary-500/40 hover:text-primary-300 sm:flex"
            >
              Voir les rapports
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <RevenueAreaChart series={stats?.series ?? []} />
        </CardShell>

        <CardShell
          title="Répartition du CA"
          description="30 derniers jours par activité"
        >
          <RevenueSplitDonut split={split} />
        </CardShell>
      </div>

      {/* Commandes + sessions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardShell
          title="Dernières commandes"
          description="Commandes boutique récentes"
          className="lg:col-span-2"
          action={
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-1 text-xs font-medium text-primary-300 hover:text-primary-200"
            >
              Tout voir
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <RecentOrdersTable orders={stats?.recentOrders ?? []} />
        </CardShell>

        <CardShell
          title="Sessions en cours"
          description={
            k
              ? `${k.activeSessions} active${k.activeSessions > 1 ? 's' : ''}${
                  k.pausedSessions > 0 ? ` · ${k.pausedSessions} en pause` : ''
                }`
              : undefined
          }
          action={
            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-1 text-xs font-medium text-primary-300 hover:text-primary-200"
            >
              Gérer
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <ActiveSessionsList sessions={stats?.activeSessionsList ?? []} />
        </CardShell>
      </div>

      {/* Événements + actions rapides */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CardShell
          title="Événements à venir"
          description="Capacité et réservations"
          action={
            <Link
              href="/dashboard/events"
              className="flex items-center gap-1 text-xs font-medium text-primary-300 hover:text-primary-200"
            >
              Gérer
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <EventsCard events={stats?.upcomingEvents ?? []} />
        </CardShell>

        <CardShell
          title="Actions rapides"
          description="Raccourcis du quotidien"
          className="lg:col-span-2"
        >
          <QuickActions role={user?.role ?? 'CASHIER'} />
        </CardShell>
      </div>
    </div>
  )
}
