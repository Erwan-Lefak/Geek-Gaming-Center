import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const screeningUpdateSchema = z.object({
  screenTime: z.string().datetime().optional(),
  screenNumber: z.number().min(1).optional(),
  totalSeats: z.number().min(1).optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// GET /api/dashboard/screenings/[id] - Get single screening
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const screening = await prisma.movieScreening.findUnique({
      where: { id: params.id },
      include: {
        movie: true,
        bookings: {
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
          },
        },
      },
    })

    if (!screening) {
      return NextResponse.json({ error: 'Séance non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ screening })
  } catch (error: any) {
    console.error('Get screening error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de la séance' },
      { status: 500 }
    )
  }
}

// PATCH /api/dashboard/screenings/[id] - Update screening
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = screeningUpdateSchema.parse(body)

    // If screenTime is updated, recalculate endDate
    let updateData: any = { ...validatedData }
    if (validatedData.screenTime) {
      const screening = await prisma.movieScreening.findUnique({
        where: { id: params.id },
        include: { movie: { select: { duration: true } } },
      })

      if (!screening) {
        return NextResponse.json({ error: 'Séance non trouvée' }, { status: 404 })
      }

      const screenTime = new Date(validatedData.screenTime)
      updateData.endDate = new Date(screenTime.getTime() + screening.movie.duration * 60000)
    }

    const screening = await prisma.movieScreening.update({
      where: { id: params.id },
      data: updateData,
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            duration: true,
            posterUrl: true,
            rating: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      screening,
      message: 'Séance mise à jour avec succès',
    })

  } catch (error: any) {
    console.error('Update screening error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de la séance' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/screenings/[id] - Delete screening
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Check if screening has bookings
    const bookingCount = await prisma.cinemaBooking.count({
      where: {
        screeningId: params.id,
        status: { not: 'CANCELLED' },
      },
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une séance avec des réservations' },
        { status: 400 }
      )
    }

    await prisma.movieScreening.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Séance supprimée avec succès',
    })

  } catch (error: any) {
    console.error('Delete screening error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de la séance' },
      { status: 500 }
    )
  }
}
