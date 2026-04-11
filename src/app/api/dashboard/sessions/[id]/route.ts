import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// PUT /api/dashboard/sessions/[id] - Gestionnaire de sessions
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    const session = await prisma.gamingSession.findUnique({
      where: { id: params.id },
      include: {
        equipment: true,
        customer: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 })
    }

    // Actions disponibles
    switch (action) {
      case 'confirm': {
        // Confirmer une réservation en ligne et démarrer la session
        if (session.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Cette session ne peut pas être confirmée' },
            { status: 400 }
          )
        }

        const now = new Date()

        const updatedSession = await prisma.gamingSession.update({
          where: { id: params.id },
          data: {
            status: 'ACTIVE',
            startedAt: now,
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        // Marquer l'équipement comme utilisé
        await prisma.equipment.update({
          where: { id: session.equipmentId },
          data: { status: 'IN_USE' },
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Session confirmée et démarrée',
        })
      }

      case 'start': {
        // Démarrer une session payée
        if (session.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Cette session ne peut pas être démarrée' },
            { status: 400 }
          )
        }

        const now = new Date()

        const updatedSession = await prisma.gamingSession.update({
          where: { id: params.id },
          data: {
            status: 'ACTIVE',
            startedAt: now,
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        // Marquer l'équipement comme utilisé
        await prisma.equipment.update({
          where: { id: session.equipmentId },
          data: { status: 'IN_USE' },
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Session démarrée',
        })
      }

      case 'stop': {
        // Forcer l'arrêt d'une session
        if (session.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Cette session n\'est pas active' },
            { status: 400 }
          )
        }

        const now = new Date()

        const updatedSession = await prisma.gamingSession.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            actualEndAt: now,
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        // Libérer l'équipement
        await prisma.equipment.update({
          where: { id: session.equipmentId },
          data: { status: 'AVAILABLE' },
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Session arrêtée',
        })
      }

      case 'change_equipment': {
        // Changer l'équipement attribué
        const { newEquipmentId } = body

        if (!newEquipmentId) {
          return NextResponse.json(
            { error: 'L\'équipement est requis' },
            { status: 400 }
          )
        }

        // Vérifier que le nouvel équipement est disponible
        const newEquipment = await prisma.equipment.findUnique({
          where: { id: newEquipmentId },
        })

        if (!newEquipment || newEquipment.status !== 'AVAILABLE') {
          return NextResponse.json(
            { error: 'L\'équipement n\'est pas disponible' },
            { status: 400 }
          )
        }

        // Libérer l'ancien équipement
        await prisma.equipment.update({
          where: { id: session.equipmentId },
          data: { status: 'AVAILABLE' },
        })

        // Attribuer le nouvel équipement
        const updatedSession = await prisma.gamingSession.update({
          where: { id: params.id },
          data: {
            equipmentId: newEquipmentId,
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        // Marquer le nouvel équipement comme utilisé
        await prisma.equipment.update({
          where: { id: newEquipmentId },
          data: { status: 'IN_USE' },
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Équipement changé avec succès',
        })
      }

      case 'extend': {
        // Prolonger une session
        const { additionalMinutes, additionalPrice } = body

        if (!additionalMinutes || additionalMinutes <= 0) {
          return NextResponse.json(
            { error: 'La durée de prolongation est requise' },
            { status: 400 }
          )
        }

        const currentEnd = session.scheduledEndAt
        const newEnd = new Date(currentEnd.getTime() + additionalMinutes * 60000)

        const updatedSession = await prisma.gamingSession.update({
          where: { id: params.id },
          data: {
            scheduledEndAt: newEnd,
            duration: { increment: additionalMinutes },
            price: { increment: additionalPrice || 0 },
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Session prolongée avec succès',
        })
      }

      case 'mark_paid': {
        // Marquer la session comme payée
        if (session.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Cette session est déjà payée ou active' },
            { status: 400 }
          )
        }

        const { paymentMethod } = body

        if (!paymentMethod) {
          return NextResponse.json(
            { error: 'La méthode de paiement est requise' },
            { status: 400 }
          )
        }

        const now = new Date()

        const updatedSession = await prisma.gamingSession.update({
          where: { id: params.id },
          data: {
            paidAt: now,
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        return NextResponse.json({
          success: true,
          session: updatedSession,
          message: 'Paiement enregistré',
        })
      }

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Session management error:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la gestion de la session' },
      { status: 500 }
    )
  }
}
