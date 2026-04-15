import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// Schéma de validation pour la mise à jour
const updateCustomerSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(9).optional(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  howDidYouFindUs: z.string().optional().nullable(),
  howDidYouFindUsDetails: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['NEW', 'REGULAR', 'VIP', 'INACTIVE']).optional(),
})

// GET /api/customers/[id] - Récupérer un client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    // Vérification des permissions
    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 } as any)
    }

    return NextResponse.json({ customer })
  } catch (error: any) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Mettre à jour un client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    // Seuls la caissière, gérant et admin peuvent modifier des clients
    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const { id } = await params
    const body = await request.json()

    console.log('📝 Body reçu pour PUT:', JSON.stringify(body, null, 2))

    const data = updateCustomerSchema.parse(body)
    console.log('✅ Data validée:', JSON.stringify(data, null, 2))

    // Vérifier que le client existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 } as any
      )
    }

    // Préparer les données de mise à jour
    const updateData: any = {}

    if (data.firstName !== undefined) updateData.firstName = data.firstName
    if (data.lastName !== undefined) updateData.lastName = data.lastName
    if (data.email !== undefined) updateData.email = data.email
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null
    }
    if (data.address !== undefined) updateData.address = data.address
    if (data.city !== undefined) updateData.city = data.city
    if (data.howDidYouFindUs !== undefined) updateData.howDidYouFindUs = data.howDidYouFindUs
    if (data.howDidYouFindUsDetails !== undefined) updateData.howDidYouFindUsDetails = data.howDidYouFindUsDetails
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.status !== undefined) updateData.status = data.status

    console.log('🔧 Données de mise à jour:', JSON.stringify(updateData, null, 2))

    // Mettre à jour le client
    const customer = await prisma.customer.update({
      where: { id },
      data: updateData
    })

    console.log('✅ Client mis à jour:', customer)

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer
    })
  } catch (error: any) {
    console.error('❌ Error updating customer:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Supprimer un client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    // Tous les rôles authentifiés peuvent supprimer des clients
    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const { id } = await params

    const customer = await prisma.customer.findUnique({
      where: { id }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 } as any)
    }

    // Supprimer le client (cascade delete supprimera aussi les sessions et factures liées)
    await prisma.customer.delete({ where: { id } })

    return NextResponse.json({
      message: 'Customer deleted successfully',
      deletedCustomer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`
      }
    } as any)
  } catch (error: any) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
