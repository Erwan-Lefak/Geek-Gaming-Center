/**
 * Configuration de navigation du dashboard - inspirée de next-shadcn-admin-dashboard
 * Groupes de navigation avec icônes lucide + filtrage par rôle.
 */

import {
  LayoutDashboard,
  Banknote,
  Users,
  Gamepad2,
  ShoppingBag,
  FileText,
  Package,
  Wrench,
  Film,
  UtensilsCrossed,
  CalendarDays,
  Hammer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  roles: string[]
  description?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Général',
    items: [
      {
        name: 'Tableau de bord',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['CASHIER', 'TECHNICIAN', 'MANAGER', 'SHAREHOLDER', 'ADMIN'],
        description: "Vue d'ensemble de l'activité",
      },
      {
        name: 'Caisse',
        href: '/dashboard/caisse',
        icon: Banknote,
        roles: ['CASHIER', 'MANAGER', 'ADMIN'],
        description: 'Encaissements',
      },
    ],
  },
  {
    label: 'Activité',
    items: [
      {
        name: 'Sessions',
        href: '/dashboard/sessions',
        icon: Gamepad2,
        roles: ['CASHIER', 'MANAGER', 'ADMIN'],
        description: 'Sessions de jeu en cours',
      },
      {
        name: 'Commandes',
        href: '/dashboard/orders',
        icon: ShoppingBag,
        roles: ['MANAGER', 'ADMIN', 'SHAREHOLDER'],
        description: 'Commandes boutique',
      },
      {
        name: 'Clients',
        href: '/dashboard/customers',
        icon: Users,
        roles: ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'],
        description: 'Fichier clients',
      },
      {
        name: 'Factures',
        href: '/dashboard/invoices',
        icon: FileText,
        roles: ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'],
        description: 'Factures et paiements',
      },
    ],
  },
  {
    label: 'Gestion',
    items: [
      {
        name: 'Produits',
        href: '/dashboard/products',
        icon: Package,
        roles: ['MANAGER', 'ADMIN'],
        description: 'Catalogue et stock',
      },
      {
        name: 'Équipements',
        href: '/dashboard/equipment',
        icon: Wrench,
        roles: ['TECHNICIAN', 'MANAGER', 'ADMIN'],
        description: 'Consoles, PC, VR',
      },
      {
        name: 'Cinéma',
        href: '/dashboard/cinema',
        icon: Film,
        roles: ['MANAGER', 'ADMIN'],
        description: 'Films et séances',
      },
      {
        name: 'Restaurant',
        href: '/dashboard/restaurant',
        icon: UtensilsCrossed,
        roles: ['CASHIER', 'MANAGER', 'ADMIN'],
        description: 'Menu et commandes',
      },
      {
        name: 'Événements',
        href: '/dashboard/events',
        icon: CalendarDays,
        roles: ['CASHIER', 'MANAGER', 'ADMIN'],
        description: 'Tournois et soirées',
      },
      {
        name: 'Maintenance',
        href: '/dashboard/maintenance',
        icon: Hammer,
        roles: ['TECHNICIAN', 'MANAGER', 'ADMIN'],
        description: 'Tickets techniques',
      },
    ],
  },
  {
    label: 'Analyse',
    items: [
      {
        name: 'Rapports',
        href: '/dashboard/reports',
        icon: TrendingUp,
        roles: ['MANAGER', 'SHAREHOLDER', 'ADMIN'],
        description: 'Performances et CA',
      },
    ],
  },
]

export const roleLabels: Record<string, string> = {
  CASHIER: 'Caissière',
  TECHNICIAN: 'Technicien',
  MANAGER: 'Gérant',
  SHAREHOLDER: 'Actionnaire',
  ADMIN: 'Administrateur',
}

export const roleColors: Record<string, string> = {
  CASHIER: 'from-emerald-500 to-green-500',
  TECHNICIAN: 'from-orange-500 to-amber-500',
  MANAGER: 'from-sky-500 to-cyan-500',
  SHAREHOLDER: 'from-violet-500 to-purple-500',
  ADMIN: 'from-rose-500 to-red-500',
}

/** Retrouve le titre de page + description à partir du pathname */
export function getPageMeta(pathname: string) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/dashboard') {
        if (pathname === '/dashboard') return item
        continue
      }
      if (pathname.startsWith(item.href)) return item
    }
  }
  return null
}
