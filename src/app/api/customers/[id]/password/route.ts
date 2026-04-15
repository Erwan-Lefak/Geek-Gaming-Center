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
        password_plain: true,
        password: true,
      }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (!customer.password_plain) {
      return NextResponse.json({
        password: null,
        message: 'No password set'
      })
    }

    // Decrypt password
    const plainPassword = decrypt(customer.password_plain)

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
