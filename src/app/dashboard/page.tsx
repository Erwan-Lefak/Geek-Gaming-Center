import { getCurrentUser } from '@/lib/auth/utils'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Récupérer les statistiques
  const [
    todayRevenue,
    activeSessions,
    totalCustomers,
    lowStockProducts,
    upcomingEvents,
  ] = await Promise.all([
    // CA du jour
    prisma.invoice.aggregate({
      where: {
        invoiceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        paymentStatus: 'PAID',
      },
      _sum: { total: true },
    }),

    // Sessions actives
    prisma.gamingSession.count({
      where: {
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    }),

    // Clients uniques ce mois
    prisma.customer.count({
      where: {
        lastVisit: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    // Produits en stock faible
    prisma.product.count({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStock,
        },
      },
    }),

    // Événements bientôt complets ou complets (7 prochains jours)
    prisma.event.findMany({
      where: {
        isActive: true,
        isPublished: true,
        eventDate: {
          gte: new Date().toISOString().split('T')[0],
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      },
      orderBy: { eventDate: 'asc' }
    }),
  ])

  const stats = [
    {
      name: 'CA Aujourd\'hui',
      value: `${todayRevenue._sum.total?.toLocaleString() || '0'} FCFA`,
      color: 'from-green-500 to-emerald-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
    },
    {
      name: 'Sessions Actives',
      value: activeSessions.toString(),
      color: 'from-blue-500 to-cyan-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
    },
    {
      name: 'Clients ce Mois',
      value: totalCustomers.toString(),
      color: 'from-purple-500 to-pink-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
    },
    {
      name: 'Alertes Stock',
      value: lowStockProducts.toString(),
      color: 'from-orange-500 to-red-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
    },
  ]

  const quickActions = [
    { name: 'Nouveau Client', href: '/dashboard/customers', icon: '👤', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', roles: ['CASHIER', 'MANAGER', 'ADMIN'] },
    { name: 'Nouvelle Session', href: '/dashboard/sessions', icon: '🎮', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', roles: ['CASHIER', 'MANAGER', 'ADMIN'] },
    { name: 'Factures', href: '/dashboard/invoices', icon: '📄', color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-50', roles: ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'] },
    { name: 'Équipements', href: '/dashboard/equipment', icon: '🔧', color: 'from-orange-500 to-amber-500', bgColor: 'bg-orange-50', roles: ['TECHNICIAN', 'MANAGER', 'ADMIN'] },
    { name: 'Rapports', href: '/dashboard/reports', icon: '📊', color: 'from-pink-500 to-rose-500', bgColor: 'bg-pink-50', roles: ['MANAGER', 'SHAREHOLDER', 'ADMIN'] },
    { name: 'Produits', href: '/dashboard/products', icon: '📦', color: 'from-indigo-500 to-violet-500', bgColor: 'bg-indigo-50', roles: ['MANAGER', 'ADMIN'] },
  ]

  const filteredActions = quickActions.filter(action =>
    action.roles.includes(user.role)
  )

  return (
    <div className="w-full space-y-6">
      {/* Welcome Banner */}
      <div className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJoLTRzLTIgMi0yIDRjMCAyIDIgNCAyIDRzLTIgMi00IDJoLTRzLTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bienvenue, {user.name} ! 👋
          </h1>
          <p className="text-purple-100 text-lg md:text-xl">
            Voici un aperçu de l'activité du jour
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="w-full group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 hover:border-slate-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <div className={`bg-gradient-to-br ${stat.color} bg-clip-text`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${stat.color}`}></div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">{stat.name}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Event Alerts */}
      {upcomingEvents.length > 0 && (
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800">Alertes Événements</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents
              .filter(event => {
                const availableSlots = event.maxCapacity - event.bookedCount
                return availableSlots <= 10
              })
              .map((event) => {
                const availableSlots = event.maxCapacity - event.bookedCount
                const isFull = availableSlots === 0
                const almostFull = availableSlots <= 10 && availableSlots > 0

                return (
                  <div
                    key={event.id}
                    className={`rounded-xl p-4 border-2 ${
                      isFull
                        ? 'bg-red-50 border-red-200'
                        : almostFull
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-slate-800 flex-1">{event.title}</h3>
                      {isFull && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse whitespace-nowrap">
                          COMPLET
                        </span>
                      )}
                      {almostFull && !isFull && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full whitespace-nowrap">
                          Presque complet
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {new Date(event.eventDate).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        Places: <span className={`font-bold ${isFull ? 'text-red-600' : almostFull ? 'text-orange-600' : 'text-slate-800'}`}>
                          {availableSlots} / {event.maxCapacity}
                        </span>
                      </span>
                      <Link
                        href="/dashboard/events"
                        className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                      >
                        Gérer →
                      </Link>
                    </div>
                  </div>
                )
              })}
          </div>

          {upcomingEvents.filter(e => (e.maxCapacity - e.bookedCount) <= 10).length === 0 && (
            <div className="text-center text-slate-500 py-8">
              <p>Aucune alerte d'événement pour les 7 prochains jours</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Actions Rapides</h2>
        </div>

        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {filteredActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className={`w-full group flex flex-col items-center justify-center p-6 ${action.bgColor} hover:opacity-80 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg`}
            >
              <span className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
                {action.icon}
              </span>
              <span className="text-sm font-semibold text-slate-900 text-center">
                {action.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Activité Récente</h2>
          </div>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Aucune activité récente</p>
            <p className="text-sm text-slate-500 mt-1">Les dernières sessions et factures apparaîtront ici</p>
          </div>
        </div>

        {/* System Status */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900">État du Système</h2>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Base de données', status: 'Opérationnel', color: 'green' },
              { name: 'Serveur Next.js', status: 'Opérationnel', color: 'green' },
              { name: 'Service d\'authentification', status: 'Opérationnel', color: 'green' },
              { name: 'Mode hors-ligne', status: 'Activé', color: 'blue' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-${item.color}-500`}></div>
                  <span className={`text-sm font-medium text-${item.color}-700`}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
