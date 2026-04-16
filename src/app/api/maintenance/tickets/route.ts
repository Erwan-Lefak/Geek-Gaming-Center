import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// Schéma de création de ticket de maintenance
const createTicketSchema = z.object({
  equipmentId: z.string().min(1, 'L\'équipement est requis'),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
})

// Schéma de mise à jour de ticket
const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  resolvedAt: z.string().optional(),
  closedAt: z.string().optional(),
})

// GET /api/maintenance/tickets - Liste des tickets
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const equipmentId = searchParams.get('equipmentId')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (equipmentId) {
      where.equipmentId = equipmentId
    }

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            status: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    // Transformer les tickets pour inclure un numéro de ticket
    const formattedTickets = tickets.map((ticket, index) => ({
      ...ticket,
      ticketNumber: `TKT-${String(tickets.length - index).padStart(6, '0')}`,
    }))

    return NextResponse.json({
      tickets: formattedTickets,
      total: tickets.length,
    })
  } catch (error: any) {
    console.error('Error fetching maintenance tickets:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/maintenance/tickets - Créer un ticket
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createTicketSchema.parse(body)

    // Vérifier que l'équipement existe
    const equipment = await prisma.equipment.findUnique({
      where: { id: data.equipmentId },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Équipement non trouvé' },
        { status: 404 }
      )
    }

    // Créer le ticket
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        equipmentId: data.equipmentId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'OPEN',
        createdById: user.id,
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            status: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    })

    // Marquer l'équipement comme en maintenance si besoin
    if (equipment.status === 'AVAILABLE') {
      await prisma.equipment.update({
        where: { id: data.equipmentId },
        data: { status: 'MAINTENANCE' },
      })
    }

    // Générer un numéro de ticket
    const ticketCount = await prisma.maintenanceTicket.count()
    const ticketNumber = `TKT-${String(ticketCount).padStart(6, '0')}`

    return NextResponse.json(
      {
        ...ticket,
        ticketNumber,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating maintenance ticket:', error)

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
