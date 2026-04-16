import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const orderUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']).optional(),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'CARD', 'BANK_TRANSFER']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
})

// GET /api/dashboard/restaurant-orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const order = await prisma.restaurantOrder.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Get restaurant order error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de la commande' },
      { status: 500 }
    )
  }
}

// PATCH /api/dashboard/restaurant-orders/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = orderUpdateSchema.parse(body)

    const updateData: any = { ...validatedData }

    // Auto-timestamps
    if (validatedData.status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const order = await prisma.restaurantOrder.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      order,
      message: 'Commande mise à jour avec succès',
    })

  } catch (error: any) {
    console.error('Update restaurant order error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/restaurant-orders/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const order = await prisma.restaurantOrder.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    // Can only delete pending orders
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Impossible de supprimer une commande en cours ou terminée' },
        { status: 400 }
      )
    }

    await prisma.restaurantOrder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Commande supprimée avec succès',
    })

  } catch (error: any) {
    console.error('Delete restaurant order error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de la commande' },
      { status: 500 }
    )
  }
}
