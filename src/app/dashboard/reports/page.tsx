'use client'

import { useState, useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { Banknote, Gamepad2, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  DashPageHeader,
  DashCard,
  DashStat,
  DashEmpty,
  dashSelectCls,
} from '../components/dash-ui'

interface ReportData {
  todayRevenue: number
  monthRevenue: number
  periodRevenue: number
  periodDays: number
  sessionCount: number
  customerCount: number
  topCustomers: Array<{
    id: string
    name: string
    visits: number
    spent: number
  }>
  equipmentUsage: Array<{
    name: string
    hours: number
    count: number
  }>
  revenueByDay: Array<{
    date: string
    gaming: number
    boutique: number
    total: number
  }>
  paymentMethods: Array<{
    method: string
    amount: number
    percentage: number
  }>
}

const revenueConfig = {
  gaming: { label: 'Gaming', color: 'var(--chart-1)' },
  boutique: { label: 'Boutique', color: 'var(--chart-2)' },
  total: { label: 'Total', color: 'var(--chart-3)' },
} satisfies ChartConfig

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const fcfa = (n: number) =>
  `${new Intl.NumberFormat('fr-FR').format(Math.round(n))} FCFA`

const fcfaCompact = (n: number) =>
  n >= 1000000
    ? `${(n / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`
    : n >= 1000
      ? `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k`
      : String(n)

const periodLabels: Record<string, string> = {
  week: '7 derniers jours',
  month: '30 derniers jours',
  quarter: 'Ce trimestre',
  year: 'Cette année',
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/dashboard/reports?period=${period}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Échec du chargement des rapports')
        return res.json()
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [period])

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Rapports"
        description={`Performances du Geek Gaming Center — ${periodLabels[period] ?? ''}`}
        actions={
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className={cn(dashSelectCls, 'w-auto')}
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        }
      />

      {error && (
        <div className="dash-card border-rose-500/30 p-4 text-sm text-rose-300">{error}</div>
      )}

      {!data && !error ? (
        <div className="dash-card py-16 text-center text-sm text-slate-500">
          Chargement des rapports…
        </div>
      ) : data ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashStat
              icon={Banknote}
              label="CA aujourd'hui"
              value={fcfa(data.todayRevenue)}
              tone="emerald"
            />
            <DashStat
              icon={TrendingUp}
              label="CA ce mois"
              value={`${fcfaCompact(data.monthRevenue)} FCFA`}
              tone="sky"
              hint={`${fcfaCompact(data.periodRevenue)} FCFA sur la période`}
            />
            <DashStat
              icon={Gamepad2}
              label="Sessions"
              value={data.sessionCount}
              tone="violet"
              hint="Sur la période"
            />
            <DashStat
              icon={Users}
              label="Nouveaux clients"
              value={data.customerCount}
              tone="amber"
              hint="Ce mois"
            />
          </div>

          {/* Graphiques CA */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DashCard
              title="Chiffre d'affaires par jour"
              description="Gaming vs boutique, factures payées"
              className="lg:col-span-2"
            >
              <ChartContainer config={revenueConfig} className="h-72 w-full sm:h-80">
                <BarChart data={data.revenueByDay}>
                  <CartesianGrid vertical={false} strokeOpacity={0.12} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                    tickFormatter={(value: string) =>
                      new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                      })
                    }
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(value: number) => fcfaCompact(value)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        formatter={(value) => fcfa(Number(value))}
                        labelFormatter={(label) =>
                          new Date(`${label}T00:00:00`).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })
                        }
                      />
                    }
                  />
                  <ChartLegend
                    verticalAlign="top"
                    content={<ChartLegendContent className="mb-4 justify-end" />}
                  />
                  <Bar dataKey="gaming" fill="var(--color-gaming)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="boutique" fill="var(--color-boutique)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </DashCard>

            <DashCard
              title="Modes de paiement"
              description="Répartition des encaissements"
            >
              {data.paymentMethods.length === 0 ? (
                <DashEmpty
                  icon={Banknote}
                  title="Aucun paiement sur la période"
                  className="py-16"
                />
              ) : (
                <>
                  <ChartContainer
                    config={{}}
                    className="mx-auto aspect-square max-h-52 w-full"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            hideLabel
                            formatter={(value, name) => (
                              <div className="flex w-full items-center justify-between gap-4">
                                <span className="text-muted-foreground">{String(name)}</span>
                                <span className="font-mono font-medium tabular-nums text-foreground">
                                  {fcfa(Number(value))}
                                </span>
                              </div>
                            )}
                          />
                        }
                      />
                      <Pie
                        data={data.paymentMethods}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={4}
                        strokeWidth={0}
                        nameKey="method"
                        dataKey="amount"
                      >
                        {data.paymentMethods.map((entry, index) => (
                          <Cell key={entry.method} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <ul className="mt-4 space-y-2">
                    {data.paymentMethods.map((p, index) => (
                      <li key={p.method} className="flex items-center gap-2 text-xs">
                        <span
                          className="h-2 w-2 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                        />
                        <span className="flex-1 text-slate-400">{p.method}</span>
                        <span className="font-medium text-slate-200 tabular-nums">
                          {p.percentage}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </DashCard>
          </div>

          {/* Top clients + équipements */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DashCard title="Top 5 clients" description="Par total dépensé (historique)">
              {data.topCustomers.length === 0 ? (
                <DashEmpty icon={Users} title="Aucun client enregistré" />
              ) : (
                <ol className="space-y-3">
                  {data.topCustomers.map((customer, index) => (
                    <li
                      key={customer.id}
                      className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/15 text-sm font-semibold text-primary-300">
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{customer.name}</p>
                          <p className="text-xs text-slate-500">{customer.visits} visites</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-100 tabular-nums">
                        {fcfa(customer.spent)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </DashCard>

            <DashCard
              title="Utilisation des équipements"
              description="Heures de jeu sur la période"
            >
              {data.equipmentUsage.length === 0 ? (
                <DashEmpty icon={Gamepad2} title="Aucune session sur la période" />
              ) : (
                <ChartContainer config={{ hours: { label: 'Heures' } }} className="h-72 w-full">
                  <BarChart data={data.equipmentUsage} layout="horizontal">
                    <CartesianGrid horizontal={false} strokeOpacity={0.12} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value: number) => `${value}h`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={110}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value, name, item) => (
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="text-muted-foreground">
                                {(item?.payload as any)?.name}
                              </span>
                              <span className="font-mono font-medium tabular-nums text-foreground">
                                {Number(value).toLocaleString('fr-FR')} h ·{' '}
                                {(item?.payload as any)?.count} sessions
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar dataKey="hours" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </DashCard>
          </div>

          {/* Tendance */}
          <DashCard
            title="Tendance du chiffre d'affaires"
            description="Évolution du total quotidien"
          >
            <ChartContainer config={revenueConfig} className="h-64 w-full sm:h-72">
              <LineChart data={data.revenueByDay}>
                <CartesianGrid vertical={false} strokeOpacity={0.12} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                  tickFormatter={(value: string) =>
                    new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })
                  }
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(value: number) => fcfaCompact(value)}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value) => fcfa(Number(value))}
                      labelFormatter={(label) =>
                        new Date(`${label}T00:00:00`).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })
                      }
                    />
                  }
                />
                <ChartLegend
                  verticalAlign="top"
                  content={<ChartLegendContent className="mb-4 justify-end" />}
                />
                <Line dataKey="total" stroke="var(--color-total)" strokeWidth={1.8} dot={false} type="monotone" />
                <Line dataKey="gaming" stroke="var(--color-gaming)" strokeWidth={1.4} dot={false} type="monotone" />
                <Line dataKey="boutique" stroke="var(--color-boutique)" strokeWidth={1.4} dot={false} type="monotone" />
              </LineChart>
            </ChartContainer>
          </DashCard>
        </>
      ) : null}
    </div>
  )
}
