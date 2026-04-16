import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

// GET /api/admin/orders - Get all orders (admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (customerId) {
      where.customerId = customerId
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.order.count({ where }),
    ])

    // Convert Decimal fields to numbers for proper JSON serialization
    const serializedOrders = orders.map(order => ({
      ...order,
      totalAmount: parseFloat(order.totalAmount.toString()),
      items: order.items.map(item => ({
        ...item,
        unitPrice: parseFloat(item.unitPrice.toString()),
        totalPrice: parseFloat(item.totalPrice.toString()),
      })),
    }))

    return NextResponse.json({
      orders: serializedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}
