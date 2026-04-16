import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

// GET /api/sessions/all - Get all sessions (gaming sessions + reservations)
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch both GamingSessions and Reservations
    const [gamingSessions, reservations] = await Promise.all([
      prisma.gamingSession.findMany({
        take: 100,
        orderBy: { paidAt: 'desc' },
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
        },
      }),
      prisma.reservation.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        where: {
          status: { not: 'CANCELLED' }
        },
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
        },
      }),
    ])

    // Transform reservations to look like gaming sessions
    const transformedSessions = [
      ...gamingSessions.map(session => ({
        ...session,
        sessionType: 'GAMING_SESSION' as const,
        sessionNumber: session.sessionNumber,
        price: parseFloat(session.price.toString()),
        paidAt: session.paidAt,
        scheduledEndAt: session.scheduledEndAt,
        timeRemaining: session.timeRemaining || undefined,
      })),
      ...reservations.map(reservation => ({
        ...reservation,
        id: reservation.id,
        sessionType: 'RESERVATION' as const,
        sessionNumber: reservation.reservationNumber,
        status: mapReservationStatus(reservation.status),
        price: parseFloat(reservation.estimatedPrice.toString()),
        paidAt: reservation.createdAt,
        scheduledEndAt: reservation.endTime,
        duration: reservation.duration,
      })),
    ]

    // Sort by date (most recent first)
    transformedSessions.sort((a, b) =>
      new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
    )

    return NextResponse.json({
      sessions: transformedSessions,
    })
  } catch (error: any) {
    console.error('Get all sessions error:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching sessions' },
      { status: 500 }
    )
  }
}

function mapReservationStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'PENDING': 'PENDING',
    'CONFIRMED': 'ACTIVE',
    'IN_PROGRESS': 'ACTIVE',
    'COMPLETED': 'COMPLETED',
    'NO_SHOW': 'EXPIRED',
    'CANCELLED': 'CANCELLED',
  }
  return statusMap[status] || 'PENDING'
}
