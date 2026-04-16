import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const restaurantOrderSchema = z.object({
  customerId: z.string().optional(),
  tableNumber: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    notes: z.string().optional(),
  })),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'CARD', 'BANK_TRANSFER']).optional(),
  notes: z.string().optional(),
  specialRequests: z.string().optional(),
  isTakeAway: z.boolean().default(false),
})

// GET /api/dashboard/restaurant-orders - Get all orders
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN', 'CASHIER'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (fromDate || toDate) {
      where.orderedAt = {}
      if (fromDate) {
        where.orderedAt.gte = new Date(fromDate)
      }
      if (toDate) {
        where.orderedAt.lte = new Date(toDate)
      }
    }

    const orders = await prisma.restaurantOrder.findMany({
      where,
      include: {
        items: {
          include: {
            menuItem: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { orderedAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Get restaurant orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/restaurant-orders - Create order
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = restaurantOrderSchema.parse(body)

    // Get menu items and calculate totals
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: validatedData.items.map(item => item.menuItemId) },
        isActive: true,
        isAvailable: true,
      },
    })

    const menuItemMap = new Map(menuItems.map(item => [item.id, item]))

    let subtotal = 0
    const orderItems = validatedData.items.map(item => {
      const menuItem = menuItemMap.get(item.menuItemId)
      if (!menuItem) {
        throw new Error(`Article ${item.menuItemId} non disponible`)
      }

      const totalPrice = Number(menuItem.price) * item.quantity
      subtotal += totalPrice

      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        notes: item.notes,
      }
    })

    // Generate order number
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const orderNumber = `REST-${timestamp}-${random}`

    // Create order
    const order = await prisma.restaurantOrder.create({
      data: {
        orderNumber,
        customerId: validatedData.customerId,
        tableNumber: validatedData.tableNumber,
        paymentMethod: validatedData.paymentMethod,
        notes: validatedData.notes,
        specialRequests: validatedData.specialRequests,
        isTakeAway: validatedData.isTakeAway,
        subtotal,
        taxRate: 0,
        taxAmount: 0,
        total: subtotal,
        items: {
          create: orderItems,
        },
      },
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
      message: 'Commande créée avec succès',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create restaurant order error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}
