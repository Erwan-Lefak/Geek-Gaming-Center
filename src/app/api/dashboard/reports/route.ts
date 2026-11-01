import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

/**
 * GET /api/dashboard/reports
 * Données réelles pour la page Rapports : KPIs, série CA gaming/boutique,
 * top clients, utilisation des équipements, répartition des paiements.
 * Période analysée : 30 derniers jours.
 */

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function dayKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Espèces',
  MOBILE_MONEY_ORANGE: 'Orange Money',
  MOBILE_MONEY_MTN: 'MTN MoMo',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement',
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'SHAREHOLDER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') ?? 'month'
    const days = period === 'week' ? 7 : period === 'quarter' ? 90 : period === 'year' ? 365 : 30

    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = addDays(today, 1)
    const periodStart = addDays(today, -(days - 1))
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const [
      invoicesToday,
      invoicesPeriod,
      sessionsCount,
      customersCount,
      topCustomers,
      equipmentList,
      sessionsByEquipment,
      paymentsByMethod,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID', invoiceDate: { gte: today, lt: tomorrow } },
      }),
      prisma.invoice.findMany({
        where: { paymentStatus: 'PAID', invoiceDate: { gte: periodStart } },
        select: { total: true, type: true, invoiceDate: true, createdAt: true, paymentMethod: true },
      }),
      prisma.gamingSession.count({ where: { createdAt: { gte: periodStart } } }),
      prisma.customer.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.customer.findMany({
        orderBy: { totalSpent: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, visitCount: true, totalSpent: true },
      }),
      prisma.equipment.findMany({ select: { id: true, name: true } }),
      prisma.gamingSession.groupBy({
        by: ['equipmentId'],
        _sum: { duration: true },
        _count: true,
        where: { createdAt: { gte: periodStart } },
      }),
      prisma.invoice.groupBy({
        by: ['paymentMethod'],
        _sum: { total: true },
        where: { paymentStatus: 'PAID', invoiceDate: { gte: periodStart } },
      }),
    ])

    // ---- Série journalière gaming / boutique ----
    const gamingByDay = new Map<string, number>()
    const boutiqueByDay = new Map<string, number>()
    for (const inv of invoicesPeriod) {
      const key = dayKey(new Date(inv.invoiceDate ?? inv.createdAt ?? now))
      const isGaming = inv.type === 'GAMING_SESSION' || inv.type === 'RESERVATION'
      const target = isGaming ? gamingByDay : boutiqueByDay
      target.set(key, (target.get(key) ?? 0) + Number(inv.total))
    }

    const revenueByDay: { date: string; gaming: number; boutique: number; total: number }[] = []
    for (let i = 0; i < days; i++) {
      const day = addDays(periodStart, i)
      const key = dayKey(day)
      const gaming = Math.round(gamingByDay.get(key) ?? 0)
      const boutique = Math.round(boutiqueByDay.get(key) ?? 0)
      revenueByDay.push({ date: key, gaming, boutique, total: gaming + boutique })
    }

    // ---- Utilisation des équipements ----
    const equipmentNameById = new Map(equipmentList.map(e => [e.id, e.name]))
    const equipmentUsage = sessionsByEquipment
      .map(row => ({
        name: equipmentNameById.get(row.equipmentId) ?? 'Inconnu',
        hours: Math.round(((row._sum.duration ?? 0) / 60) * 10) / 10,
        count: row._count,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8)

    // ---- Modes de paiement ----
    const paymentsTotal = paymentsByMethod.reduce(
      (sum, p) => sum + Number(p._sum.total ?? 0),
      0
    )
    const paymentMethods = paymentsByMethod
      .map(p => ({
        method: paymentMethodLabels[p.paymentMethod] ?? p.paymentMethod,
        amount: Math.round(Number(p._sum.total ?? 0)),
        percentage: paymentsTotal > 0
          ? Math.round((Number(p._sum.total ?? 0) / paymentsTotal) * 100)
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    const monthRevenue = invoicesPeriod
      .filter(i => new Date(i.invoiceDate ?? i.createdAt ?? 0) >= monthStart)
      .reduce((sum, i) => sum + Number(i.total), 0)

    return NextResponse.json({
      todayRevenue: Math.round(Number(invoicesToday._sum.total ?? 0)),
      monthRevenue: Math.round(monthRevenue),
      periodRevenue: Math.round(
        invoicesPeriod.reduce((sum, i) => sum + Number(i.total), 0)
      ),
      periodDays: days,
      sessionCount: sessionsCount,
      customerCount: customersCount,
      topCustomers: topCustomers.map(c => ({
        id: c.id,
        name: `${c.firstName} ${c.lastName}`.trim(),
        visits: c.visitCount ?? 0,
        spent: Number(c.totalSpent ?? 0),
      })),
      equipmentUsage,
      revenueByDay,
      paymentMethods,
    })
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    console.error('Get dashboard reports error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des rapports' },
      { status: 500 }
    )
  }
}
