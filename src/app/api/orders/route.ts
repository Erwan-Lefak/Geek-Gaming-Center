import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'

// GET /api/orders - Récupérer les commandes du client connecté
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que c'est un customer
    if ((session.user as any).role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Accès réservé aux clients' },
        { status: 403 }
      )
    }

    // Récupérer les commandes avec les items
    const orders = await prisma.order.findMany({
      where: {
        customerId: session.user.id,
      },
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
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      orders,
    })
  } catch (error: any) {
    console.error('Get orders error:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des commandes' },
      { status: 500 }
    )
  }
}
