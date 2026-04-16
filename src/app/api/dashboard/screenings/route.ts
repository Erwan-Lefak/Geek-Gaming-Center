import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const screeningSchema = z.object({
  movieId: z.string().min(1, 'Le film est requis'),
  screenTime: z.string().datetime('Format de date invalide'),
  duration: z.number().min(1, 'La durée est requise'),
  screenNumber: z.number().min(1).default(1),
  totalSeats: z.number().min(1).default(50),
  price: z.number().min(0, 'Le prix est requis'),
  isActive: z.boolean().default(true),
})

// GET /api/dashboard/screenings - Get all screenings
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN', 'CASHIER'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const movieId = searchParams.get('movieId')
    const isActive = searchParams.get('isActive')
    const fromDate = searchParams.get('fromDate')

    const where: any = {}

    if (movieId) {
      where.movieId = movieId
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (fromDate) {
      where.screenTime = {
        gte: new Date(fromDate),
      }
    }

    const screenings = await prisma.movieScreening.findMany({
      where,
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
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { screenTime: 'asc' },
    })

    return NextResponse.json({ screenings })
  } catch (error: any) {
    console.error('Get screenings error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des séances' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/screenings - Create screening
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = screeningSchema.parse(body)

    // Get movie duration
    const movie = await prisma.movie.findUnique({
      where: { id: validatedData.movieId },
      select: { duration: true },
    })

    if (!movie) {
      return NextResponse.json({ error: 'Film non trouvé' }, { status: 404 })
    }

    // Calculate end date
    const screenTime = new Date(validatedData.screenTime)
    const endDate = new Date(screenTime.getTime() + movie.duration * 60000)

    const screening = await prisma.movieScreening.create({
      data: {
        ...validatedData,
        screenTime,
        endDate,
        availableSeats: validatedData.totalSeats,
      },
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
      message: 'Séance créée avec succès',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create screening error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la séance' },
      { status: 500 }
    )
  }
}
