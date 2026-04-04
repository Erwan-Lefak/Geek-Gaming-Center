import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { calculateSessionPrice } from '@/lib/data/pricing'
import { z } from 'zod'

// Schéma de création de session
const createSessionSchema = z.object({
  customerId: z.string(),
  equipmentId: z.string(),
  duration: z.number().positive(), // en minutes
  notes: z.string().optional(),
})

// GET /api/sessions - Liste des sessions
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const equipmentId = searchParams.get('equipmentId')
    const active = searchParams.get('active') === 'true'

    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (equipmentId) {
      where.equipmentId = equipmentId
    }

    if (active) {
      where.status = { in: ['PENDING', 'ACTIVE'] }
    }

    const [sessions, total] = await Promise.all([
      prisma.gamingSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          equipment: {
            select: {
              id: true,
              name: true,
              type: true,
              code: true,
              status: true,
            },
          },
          createdBy: {
            select: {
              name: true,
              role: true,
            },
          },
          extensions: true,
        },
      }),
      prisma.gamingSession.count({ where }),
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Créer une nouvelle session
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createSessionSchema.parse(body)

    // Récupérer le client
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Récupérer l'équipement
    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
      include: {
        pricing: {
          where: {
            duration: data.duration,
            isWeekend: isWeekend(),
          },
        },
      },
    })

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 })
    }

    if (equipment.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Equipment not available' },
        { status: 400 }
      )
    }

    // Calculer le prix
    const price = calculateSessionPrice(
      equipment.type,
      data.duration,
      new Date()
    )

    // Générer le numéro de session
    const sessionNumber = await generateSessionNumber()

    // Horaires
    const now = new Date()
    const scheduledEndAt = new Date(now.getTime() + data.duration * 60 * 1000)
    const gracePeriodEnd = new Date(now.getTime() + 5 * 60 * 1000) // 5 min de délai

    // Créer la session
    const session = await prisma.gamingSession.create({
      data: {
        sessionNumber,
        customerId: data.customerId,
        equipmentId: data.equipmentId,
        duration: data.duration,
        price,
        paidAt: now,
        scheduledEndAt,
        gracePeriodEnd,
        notes: data.notes,
        createdById: user.id,
        // Trouver ou créer le pricing
        pricingId: equipment.pricing[0]?.id || await createPricing(equipment.id, equipment.type, data.duration, price),
      },
      include: {
        customer: true,
        equipment: true,
        createdBy: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    })

    // Mettre à jour le statut de l'équipement
    await prisma.equipment.update({
      where: { id: data.equipmentId },
      data: { status: 'RESERVED' },
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error: any) {
    console.error('Error creating session:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fonctions utilitaires
function isWeekend(): boolean {
  const day = new Date().getDay()
  return day === 0 || day === 6
}

async function generateSessionNumber(): Promise<string> {
  const prefix = `SES-${new Date().getFullYear()}`
  const count = await prisma.gamingSession.count({
    where: {
      sessionNumber: {
        startsWith: prefix,
      },
    },
  })

  return `${prefix}-${String(count + 1).padStart(6, '0')}`
}

async function createPricing(
  equipmentId: string,
  equipmentType: string,
  duration: number,
  price: number
): Promise<string> {
  const pricing = await prisma.pricing.create({
    data: {
      equipmentId,
      duration,
      isWeekend: isWeekend(),
      price,
    },
  })

  return pricing.id
}
