import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

/**
 * GET /api/dashboard/stats
 * Agrégats temps réel pour la page d'accueil du dashboard :
 * CA du jour, sessions actives, clients, stock, séries de CA,
 * dernières commandes, sessions en cours, événements à venir.
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

// Clé locale AAAA-MM-JJ (indépendante de l'UTC)
function dayKey(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const round1 = (n: number) => Math.round(n * 10) / 10

export async function GET() {
  try {
    const user = await requireAuth()

    if (
      !hasRole(user, [
        'CASHIER',
        'TECHNICIAN',
        'MANAGER',
        'SHAREHOLDER',
        'ADMIN',
      ])
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const today = startOfDay(now)
    const tomorrow = addDays(today, 1)
    const yesterday = addDays(today, -1)
    const d14 = addDays(today, -13) // 14 jours incluant aujourd'hui
    const d30 = addDays(today, -29)
    const prev30Start = addDays(today, -59)
    const prev30End = addDays(today, -30)

    const lowStockWhere = {
      currentStock: { lte: prisma.product.fields.minStock },
    }

    const [
      invoicesToday,
      invoicesYesterday,
      invoices14d,
      ordersToday,
      orders14d,
      restoToday,
      invoices30Sum,
      orders30Sum,
      resto30Sum,
      activeSessionsCount,
      pausedSessionsCount,
      activeSessionsList,
      newCustomers30,
      newCustomersPrev30,
      lowStockCount,
      lowStockList,
      recentOrders,
      upcomingEvents,
      openRestoOrders,
    ] = await Promise.all([
      // CA caisse du jour (factures payées)
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          invoiceDate: { gte: today, lt: tomorrow },
        },
      }),
      // CA caisse d'hier (pour la tendance)
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          invoiceDate: { gte: yesterday, lt: today },
        },
      }),
      // Factures payées 14 derniers jours (série journalière)
      prisma.invoice.findMany({
        where: { paymentStatus: 'PAID', invoiceDate: { gte: d14 } },
        select: { total: true, invoiceDate: true, createdAt: true },
      }),
      // Commandes boutique payées du jour
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      // Commandes boutique payées 14 derniers jours
      prisma.order.findMany({
        where: { paymentStatus: 'PAID', createdAt: { gte: d14 } },
        select: { totalAmount: true, createdAt: true },
      }),
      // Restaurant payé du jour
      prisma.restaurantOrder.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: 'PAID',
          orderedAt: { gte: today, lt: tomorrow },
        },
      }),
      // Répartition CA 30 jours
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID', invoiceDate: { gte: d30 } },
      }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID', createdAt: { gte: d30 } },
      }),
      prisma.restaurantOrder.aggregate({
        _sum: { total: true },
        where: { paymentStatus: 'PAID', orderedAt: { gte: d30 } },
      }),
      // Sessions de jeu
      prisma.gamingSession.count({ where: { status: 'ACTIVE' } }),
      prisma.gamingSession.count({ where: { status: 'PAUSED' } }),
      prisma.gamingSession.findMany({
        where: { status: { in: ['ACTIVE', 'PAUSED'] } },
        orderBy: { scheduledEndAt: 'asc' },
        take: 6,
        select: {
          id: true,
          sessionNumber: true,
          status: true,
          startedAt: true,
          scheduledEndAt: true,
          price: true,
          equipment: { select: { name: true } },
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      // Nouveaux clients
      prisma.customer.count({ where: { createdAt: { gte: d30 } } }),
      prisma.customer.count({
        where: { createdAt: { gte: prev30Start, lt: prev30End } },
      }),
      // Produits sous le stock mini
      prisma.product.count({ where: lowStockWhere }),
      prisma.product.findMany({
        where: lowStockWhere,
        select: { id: true, name: true, currentStock: true, minStock: true },
        orderBy: { currentStock: 'asc' },
        take: 5,
      }),
      // Dernières commandes boutique
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          createdAt: true,
          customer: { select: { firstName: true, lastName: true } },
        },
      }),
      // Événements à venir
      prisma.event.findMany({
        where: { eventDate: { gte: now }, isActive: true },
        orderBy: { eventDate: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          eventDate: true,
          maxCapacity: true,
          bookedCount: true,
        },
      }),
      // Commandes restaurant en cours
      prisma.restaurantOrder.count({
        where: {
          status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] },
        },
      }),
    ])

    // ---- Séries journalières (14 jours) ----
    const caisseByDay = new Map<string, number>()
    for (const inv of invoices14d) {
      const key = dayKey(new Date(inv.invoiceDate ?? inv.createdAt ?? now))
      caisseByDay.set(key, (caisseByDay.get(key) ?? 0) + Number(inv.total))
    }
    const boutiqueByDay = new Map<string, number>()
    for (const o of orders14d) {
      const key = dayKey(new Date(o.createdAt ?? now))
      boutiqueByDay.set(
        key,
        (boutiqueByDay.get(key) ?? 0) + Number(o.totalAmount)
      )
    }

    const series: { date: string; caisse: number; boutique: number }[] = []
    for (let i = 0; i < 14; i++) {
      const day = addDays(d14, i)
      const key = dayKey(day)
      series.push({
        date: key,
        caisse: Math.round(caisseByDay.get(key) ?? 0),
        boutique: Math.round(boutiqueByDay.get(key) ?? 0),
      })
    }

    // ---- KPIs ----
    const caToday =
      Number(invoicesToday._sum.total ?? 0) +
      Number(ordersToday._sum.totalAmount ?? 0) +
      Number(restoToday._sum.total ?? 0)
    const caYesterday = Number(invoicesYesterday._sum.total ?? 0)
    const trendRevenue =
      caYesterday > 0 ? round1(((caToday - caYesterday) / caYesterday) * 100) : null
    const trendCustomers =
      newCustomersPrev30 > 0
        ? round1(((newCustomers30 - newCustomersPrev30) / newCustomersPrev30) * 100)
        : null

    return NextResponse.json({
      kpis: {
        revenueToday: Math.round(caToday),
        revenueYesterday: Math.round(caYesterday),
        trendRevenue,
        activeSessions: activeSessionsCount,
        pausedSessions: pausedSessionsCount,
        newCustomers30,
        trendCustomers,
        lowStockCount,
        openRestaurantOrders: openRestoOrders,
      },
      series,
      revenueSplit30d: {
        caisse: Math.round(Number(invoices30Sum._sum.total ?? 0)),
        boutique: Math.round(Number(orders30Sum._sum.totalAmount ?? 0)),
        restaurant: Math.round(Number(resto30Sum._sum.total ?? 0)),
      },
      activeSessionsList: activeSessionsList.map((s) => ({
        id: s.id,
        sessionNumber: s.sessionNumber,
        status: s.status,
        startedAt: s.startedAt,
        scheduledEndAt: s.scheduledEndAt,
        price: Number(s.price),
        equipmentName: s.equipment?.name ?? '—',
        customerName: s.customer
          ? `${s.customer.firstName} ${s.customer.lastName}`.trim()
          : 'Client de passage',
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt,
        customerName: o.customer
          ? `${o.customer.firstName} ${o.customer.lastName}`.trim()
          : '—',
      })),
      lowStockProducts: lowStockList.map((p) => ({
        id: p.id,
        name: p.name,
        currentStock: p.currentStock ?? 0,
        minStock: p.minStock ?? 5,
      })),
      upcomingEvents: upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        eventDate: e.eventDate,
        maxCapacity: e.maxCapacity,
        bookedCount: e.bookedCount,
        availableSlots: Math.max(0, e.maxCapacity - e.bookedCount),
      })),
    })
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      {
        error:
          error.message ||
          'Erreur lors de la récupération des statistiques',
      },
      { status: 500 }
    )
  }
}
