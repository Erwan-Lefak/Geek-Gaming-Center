'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: '📊', roles: ['CASHIER', 'TECHNICIAN', 'MANAGER', 'SHAREHOLDER', 'ADMIN'] },
  { name: 'Caisse', href: '/dashboard/caisse', icon: '💰', roles: ['CASHIER', 'MANAGER', 'ADMIN'] },
  { name: 'Clients', href: '/dashboard/customers', icon: '👥', roles: ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'] },
  { name: 'Sessions', href: '/dashboard/sessions', icon: '🎮', roles: ['CASHIER', 'MANAGER', 'ADMIN'] },
  { name: 'Factures', href: '/dashboard/invoices', icon: '📄', roles: ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'] },
  { name: 'Produits', href: '/dashboard/products', icon: '📦', roles: ['MANAGER', 'ADMIN'] },
  { name: 'Équipements', href: '/dashboard/equipment', icon: '🔧', roles: ['TECHNICIAN', 'MANAGER', 'ADMIN'] },
  { name: 'Événements', href: '/dashboard/events', icon: '🎉', roles: ['CASHIER', 'MANAGER', 'ADMIN'] },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: '🔨', roles: ['TECHNICIAN', 'MANAGER', 'ADMIN'] },
  { name: 'Rapports', href: '/dashboard/reports', icon: '📈', roles: ['MANAGER', 'SHAREHOLDER', 'ADMIN'] },
]

const roleLabels: Record<string, string> = {
  CASHIER: 'Caissière',
  TECHNICIAN: 'Technicien',
  MANAGER: 'Gérant',
  SHAREHOLDER: 'Actionnaire',
  ADMIN: 'Administrateur',
}

const roleColors: Record<string, string> = {
  CASHIER: 'from-green-500 to-emerald-500',
  TECHNICIAN: 'from-orange-500 to-amber-500',
  MANAGER: 'from-blue-500 to-cyan-500',
  SHAREHOLDER: 'from-purple-500 to-pink-500',
  ADMIN: 'from-red-500 to-rose-500',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Afficher un état de chargement si la session n'est pas encore chargée
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  // Rediriger si pas de session
  if (status === 'unauthenticated') {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const filteredNav = navigation.filter(item =>
    user ? item.roles.includes(user.role) : true
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">GGC CRM</h1>
                    <p className="text-xs text-slate-400">Geek Gaming Center</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {filteredNav.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* User info */}
              {user && (
                <div className="p-4 border-t border-white/10">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center`}>
                        <span className="text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{roleLabels[user.role]}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:top-24 lg:flex lg:w-72 lg:flex-col lg:h-[calc(100vh-6rem)]">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl overflow-y-auto">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">GGC CRM</h1>
                <p className="text-sm text-slate-400">Geek Gaming Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User info */}
          {user && (
            <div className="p-4 border-t border-white/10">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{roleLabels[user.role]}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen pt-34 lg:pt-24">
        {/* Top Bar - Fixed below the top margin */}
        <header className="fixed top-34 lg:top-24 right-0 left-0 lg:left-72 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Page title */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {navigation.find(n => n.href === pathname)?.name || 'Tableau de bord'}
                  </h2>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User badge mobile */}
                {user && (
                  <div className="lg:hidden flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[user.role]} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200">
          <div className="text-center text-sm text-slate-500">
            <p>© 2026 Geek Gaming Center - Système de Gestion CRM</p>
            <p className="mt-1">Yaoundé, Cameroun 🇨🇲</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
