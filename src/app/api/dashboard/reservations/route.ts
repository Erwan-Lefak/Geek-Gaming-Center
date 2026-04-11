import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

// GET /api/dashboard/reservations - Réservations du jour pour la caissière
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const status = searchParams.get('status')

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const where: any = {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    }

    if (status) {
      where.status = status
    }

    const reservations = await prisma.reservation.findMany({
      where,
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
      orderBy: {
        startTime: 'asc',
      },
    })

    // Formater les réservations avec temps restant
    const formattedReservations = reservations.map(res => ({
      ...res,
      timeRemaining: res.startTime.getTime() - Date.now(),
      isLate: res.startTime.getTime() < Date.now() && res.status === 'PENDING',
    }))

    return NextResponse.json({
      reservations: formattedReservations,
      summary: {
        total: reservations.length,
        pending: reservations.filter(r => r.status === 'PENDING').length,
        confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
        checkedIn: reservations.filter(r => r.status === 'CHECKED_IN').length,
        completed: reservations.filter(r => r.status === 'COMPLETED').length,
        cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
        noShow: reservations.filter(r => r.status === 'NO_SHOW').length,
      },
    })

  } catch (error: any) {
    console.error('Get reservations error:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}
