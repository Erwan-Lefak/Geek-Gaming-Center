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

// POST /api/admin/orders - Create a new order (admin dashboard - for cash payments)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN', 'CASHIER', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { customerEmail, items, totalAmount, paymentMethod, status, shippingAddress } = body

    // Validation
    if (!customerEmail || !items || items.length === 0 || !totalAmount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Champs obligatoires manquants' },
        { status: 400 }
      )
    }

    // Find or create customer by email
    let customer = await prisma.customer.findUnique({
      where: { email: customerEmail },
    })

    if (!customer) {
      // Create a new customer
      const emailParts = customerEmail.split('@')
      const displayName = emailParts[0] || 'Client'

      customer = await prisma.customer.create({
        data: {
          email: customerEmail,
          firstName: displayName,
          lastName: '',
          phone: '',
        },
      })
    }

    // Generate order number
    const orderCount = await prisma.order.count()
    const orderNumber = `CMD-${String(orderCount + 1).padStart(6, '0')}`

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        totalAmount,
        paymentMethod,
        paymentStatus: 'PAID', // Cash payments are considered paid
        status,
        shippingAddress: shippingAddress || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.quantity * item.price,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    })

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        totalAmount: parseFloat(order.totalAmount.toString()),
        items: order.items.map(item => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice.toString()),
          totalPrice: parseFloat(item.totalPrice.toString()),
        })),
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la commande' },
      { status: 500 }
    )
  }
}
