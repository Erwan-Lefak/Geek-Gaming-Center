import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { decrypt } from '@/lib/crypto'

/**
 * GET /api/customers/[id]/password
 * Get customer password in plain text (staff only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    // Only staff can view passwords
    if (!hasRole(user, ['MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: true,
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if password_plain exists (newer customers)
    // If not, return a message that password cannot be shown for legacy accounts
    const customerWithPlain = await prisma.customer.findUnique({
      where: { id },
      select: {
        password_plain: true,
      }
    })

    if (!customerWithPlain?.password_plain) {
      return NextResponse.json({
        password: null,
        message: 'Mot de passe non disponible pour les comptes créés avant le 15 avril 2026. Le client doit réinitialiser son mot de passe.',
        hasPassword: !!customer.password
      })
    }

    // Decrypt password
    const plainPassword = decrypt(customerWithPlain.password_plain)

    return NextResponse.json({
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      password: plainPassword,
      hasPassword: !!customer.password
    })
  } catch (error: any) {
    console.error('Error fetching customer password:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
