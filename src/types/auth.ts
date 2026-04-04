import { UserRole } from '@prisma/client'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

export interface Session {
  user: User
  expires: string
}

// Définition des rôles et permissions
export const ROLE_PERMISSIONS = {
  CASHIER: {
    label: 'Caissière',
    permissions: [
      'customers:create',
      'customers:read',
      'sessions:create',
      'sessions:read',
      'sessions:update',
      'invoices:create',
      'invoices:read',
      'products:read',
      'cart:create',
      'cart:read',
    ],
    canAccess: ['customers', 'sessions', 'invoices', 'store'],
  },
  TECHNICIAN: {
    label: 'Technicien',
    permissions: [
      'equipment:read',
      'equipment:update',
      'maintenance:create',
      'maintenance:read',
      'maintenance:update',
      'tickets:create',
      'tickets:read',
      'tickets:update',
      'inventory:read',
      'inventory:update',
    ],
    canAccess: ['equipment', 'maintenance', 'tickets', 'inventory'],
  },
  MANAGER: {
    label: 'Gérant',
    permissions: ['*'], // Tout accès
    canAccess: ['*'],
  },
  SHAREHOLDER: {
    label: 'Actionnaire',
    permissions: [
      'reports:read',
      'reports:export',
      'invoices:read',
      'customers:read',
      'sessions:read',
      'analytics:read',
    ],
    canAccess: ['reports', 'analytics', 'dashboard'],
  },
  ADMIN: {
    label: 'Administrateur',
    permissions: ['*'],
    canAccess: ['*'],
  },
} as const

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const role = ROLE_PERMISSIONS[userRole]
  return role.permissions.includes('*') || role.permissions.includes(permission)
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const role = ROLE_PERMISSIONS[userRole]
  return role.canAccess.includes('*') || role.canAccess.some(r => route.startsWith(r))
}
