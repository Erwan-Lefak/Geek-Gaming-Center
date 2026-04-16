import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

// PATCH /api/equipment/[id] - Mettre à jour un équipement
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const equipmentId = params.id
    const body = await request.json()

    // Vérifier si l'équipement existe
    const existing = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    } as any)

    if (!existing) {
      return NextResponse.json({ error: 'Équipement non trouvé' }, { status: 404 })
    }

    // Si nouveau code, vérifier qu'il est unique
    if (body.code && body.code !== existing.code) {
      const codeExists = await prisma.equipment.findUnique({
        where: { code: body.code },
      } as any)

      if (codeExists) {
        return NextResponse.json(
          { error: 'Un équipement avec ce code existe déjà' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour l'équipement
    const equipment = await prisma.equipment.update({
      where: { id: equipmentId },
      data: body,
    } as any)

    return NextResponse.json(equipment)
  } catch (error: any) {
    console.error('Error updating equipment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/equipment/[id] - Supprimer un équipement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const equipmentId = params.id

    // Vérifier si l'équipement existe
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        _count: {
          select: {
            reservations: true,
            sessions: true,
          },
        },
      },
    } as any)

    if (!equipment) {
      return NextResponse.json({ error: 'Équipement non trouvé' }, { status: 404 })
    }

    // Vérifier si l'équipement a des réservations ou sessions actives
    const hasActiveReservations = equipment._count.reservations > 0
    const hasActiveSessions = equipment._count.sessions > 0

    if (hasActiveReservations || hasActiveSessions) {
      return NextResponse.json(
        {
          error: 'Impossible de supprimer cet équipement',
          details: hasActiveReservations
            ? `Il a ${equipment._count.reservations} réservation(s) associée(s)`
            : `Il a ${equipment._count.sessions} session(s) associée(s)`,
        },
        { status: 400 }
      )
    }

    // Supprimer l'équipement
    await prisma.equipment.delete({
      where: { id: equipmentId },
    } as any)

    return NextResponse.json({ success: true, message: 'Équipement supprimé avec succès' })
  } catch (error: any) {
    console.error('Error deleting equipment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
