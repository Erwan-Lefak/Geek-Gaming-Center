import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// Schéma de mise à jour de commande
const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  notes: z.string().optional(),
  shippingAddress: z.string().optional(),
})

// PATCH /api/admin/orders/[id] - Mettre à jour une commande
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const orderId = params.id
    const body = await request.json()
    const data = updateOrderSchema.parse(body)

    // Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {}

    if (data.status) updateData.status = data.status
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus
    if (data.notes) updateData.notes = data.notes
    if (data.shippingAddress) updateData.shippingAddress = data.shippingAddress

    // Dates automatiques
    if (data.status === 'SHIPPED' && existingOrder.status !== 'SHIPPED') {
      updateData.shippedAt = new Date()
    }

    if (data.status === 'DELIVERED' && existingOrder.status !== 'DELIVERED') {
      updateData.deliveredAt = new Date()
    }

    if (data.status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      updateData.cancelledAt = new Date()
      // Remettre le stock si annulé
      for (const item of existingOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { increment: item.quantity },
          },
        })
      }
    }

    // Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Convertir Decimal en nombres
    const serializedOrder = {
      ...order,
      totalAmount: parseFloat(order.totalAmount.toString()),
      items: order.items.map(item => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
      })),
    }

    return NextResponse.json(serializedOrder)
  } catch (error: any) {
    console.error('Error updating order:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Erreur de validation', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/orders/[id] - Supprimer une commande
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const orderId = params.id

    // Vérifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    // Protection: ne pas supprimer les commandes payées et expédiées
    if (order.paymentStatus === 'PAID' && ['SHIPPED', 'DELIVERED'].includes(order.status)) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer cette commande',
          details: 'Les commandes payées et expédiées ne peuvent être supprimées',
        },
        { status: 400 }
      )
    }

    // Supprimer la commande (les items seront supprimés en cascade par Prisma)
    await prisma.order.delete({
      where: { id: orderId },
    })

    return NextResponse.json({
      success: true,
      message: 'Commande supprimée avec succès',
    })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
