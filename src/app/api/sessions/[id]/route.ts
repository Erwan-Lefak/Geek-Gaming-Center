import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

// GET /api/sessions/[id] - Détails d'une session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const session = await prisma.gamingSession.findUnique({
      where: { id },
      include: {
        customer: true,
        equipment: true,
        createdBy: {
          select: {
            name: true,
            role: true,
          },
        },
        extensions: {
          orderBy: { extendedAt: 'desc' },
        },
        invoice: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculer le temps restant
    let timeRemaining = 0
    let isExpired = false

    if (session.status === 'ACTIVE') {
      const now = new Date()
      const endTime = session.actualEndAt || session.scheduledEndAt
      timeRemaining = Math.max(0, endTime.getTime() - now.getTime())
      isExpired = timeRemaining === 0 && session.actualEndAt === null
    }

    return NextResponse.json({
      ...session,
      timeRemaining,
      isExpired,
    })
  } catch (error: any) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/sessions/[id] - Modifier une session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, ...data } = body
    const { id } = await params

    const session = await prisma.gamingSession.findUnique({
      where: { id },
      include: { equipment: true },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    let updatedSession

    switch (action) {
      case 'START':
        // Démarrer la session
        if (session.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Session cannot be started' },
            { status: 400 }
          )
        }

        updatedSession = await prisma.gamingSession.update({
          where: { id: id },
          data: {
            status: 'ACTIVE',
            startedAt: new Date(),
          },
          include: {
            customer: true,
            equipment: true,
          },
        })

        // Mettre à jour l'équipement
        await prisma.equipment.update({
          where: { id: session.equipmentId },
          data: { status: 'IN_USE' },
        })

        // Mettre à jour le client
        await prisma.customer.update({
          where: { id: session.customerId },
          data: {
            lastVisit: new Date(),
            visitCount: { increment: 1 },
          },
        })

        break

      case 'EXTEND':
        // Étendre la session
        if (session.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Cannot extend non-active session' },
            { status: 400 }
          )
        }

        const { additionalMinutes, additionalPrice } = data

        const extension = await prisma.sessionExtension.create({
          data: {
            sessionId: id,
            additionalMinutes,
            additionalPrice,
          },
        })

        // Calculer nouvelle fin
        const currentEnd = session.actualEndAt || session.scheduledEndAt
        const newEnd = new Date(currentEnd.getTime() + additionalMinutes * 60 * 1000)

        updatedSession = await prisma.gamingSession.update({
          where: { id: id },
          data: {
            scheduledEndAt: newEnd,
          },
          include: {
            customer: true,
            equipment: true,
            extensions: true,
          },
        })

        break

      case 'PAUSE':
        // Mettre en pause
        if (session.status !== 'ACTIVE') {
          return NextResponse.json(
            { error: 'Cannot pause non-active session' },
            { status: 400 }
          )
        }

        updatedSession = await prisma.gamingSession.update({
          where: { id: id },
          data: { status: 'PAUSED' },
        })

        break

      case 'RESUME':
        // Reprendre
        if (session.status !== 'PAUSED') {
          return NextResponse.json(
            { error: 'Cannot resume non-paused session' },
            { status: 400 }
          )
        }

        updatedSession = await prisma.gamingSession.update({
          where: { id: id },
          data: { status: 'ACTIVE' },
        })

        break

      case 'END':
        // Terminer la session
        if (session.status !== 'ACTIVE' && session.status !== 'PAUSED') {
          return NextResponse.json(
            { error: 'Session cannot be ended' },
            { status: 400 }
          )
        }

        updatedSession = await prisma.gamingSession.update({
          where: { id: id },
          data: {
            status: 'COMPLETED',
            actualEndAt: new Date(),
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

        // Mettre à jour les stats du client
        const totalHours = session.duration / 60
        await prisma.customer.update({
          where: { id: session.customerId },
          data: {
            totalSpent: { increment: session.price },
            totalHours: { increment: totalHours },
          },
        })

        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json(updatedSession)
  } catch (error: any) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
