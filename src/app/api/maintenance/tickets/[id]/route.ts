import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// Schéma de mise à jour de ticket
const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

// PATCH /api/maintenance/tickets/[id] - Mettre à jour un ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ticketId = params.id
    const body = await request.json()
    const data = updateTicketSchema.parse(body)

    // Vérifier que le ticket existe
    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        equipment: true,
      },
    })

    if (!existingTicket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      ...data,
    }

    // Gérer les dates automatiquement
    if (data.status === 'IN_PROGRESS' && existingTicket.status === 'OPEN') {
      updateData.startedAt = new Date()
    }

    if (data.status === 'RESOLVED' && existingTicket.status !== 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }

    if (data.status === 'CLOSED' && existingTicket.status !== 'CLOSED') {
      updateData.closedAt = new Date()
    }

    // Si le ticket est résolu/clos, remettre l'équipement disponible
    if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
      await prisma.equipment.update({
        where: { id: existingTicket.equipmentId },
        data: { status: 'AVAILABLE' },
      })
    }

    // Mettre à jour le ticket
    const ticket = await prisma.maintenanceTicket.update({
      where: { id: ticketId },
      data: updateData,
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

    // Générer le numéro de ticket
    const ticketCount = await prisma.maintenanceTicket.count({
      where: {
        createdAt: { lte: ticket.createdAt },
      },
    })
    const ticketNumber = `TKT-${String(ticketCount).padStart(6, '0')}`

    return NextResponse.json({
      ...ticket,
      ticketNumber,
    })
  } catch (error: any) {
    console.error('Error updating maintenance ticket:', error)

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

// DELETE /api/maintenance/tickets/[id] - Supprimer un ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const ticketId = params.id

    // Vérifier que le ticket existe
    const ticket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
      include: {
        equipment: true,
      },
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 })
    }

    // Si le ticket est encore ouvert ou en cours, avertir
    if (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer un ticket en cours',
          details: 'Le ticket doit être résolu ou fermé avant suppression',
        },
        { status: 400 }
      )
    }

    // Remettre l'équipement disponible si ce n'est pas déjà le cas
    if (ticket.equipment.status === 'MAINTENANCE') {
      await prisma.equipment.update({
        where: { id: ticket.equipmentId },
        data: { status: 'AVAILABLE' },
      })
    }

    // Supprimer le ticket
    await prisma.maintenanceTicket.delete({
      where: { id: ticketId },
    })

    return NextResponse.json({
      success: true,
      message: 'Ticket supprimé avec succès',
    })
  } catch (error: any) {
    console.error('Error deleting maintenance ticket:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
