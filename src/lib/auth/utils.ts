import { auth } from './index'

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export function hasRole(user: any, roles: string[]) {
  return user && roles.includes(user.role)
}

export function isCashier(user: any) {
  return user?.role === 'CASHIER'
}

export function isTechnician(user: any) {
  return user?.role === 'TECHNICIAN'
}

export function isManager(user: any) {
  return user?.role === 'MANAGER' || user?.role === 'SHAREHOLDER' || user?.role === 'ADMIN'
}

export function isShareholder(user: any) {
  return user?.role === 'SHAREHOLDER' || user?.role === 'ADMIN'
}

export function isAdmin(user: any) {
  return user?.role === 'ADMIN'
}
