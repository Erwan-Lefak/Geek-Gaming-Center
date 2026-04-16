import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/cinema/screenings - Get screenings by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    const movieId = searchParams.get('movieId')

    // Parse date or use today
    let targetDate = new Date()
    if (dateParam) {
      targetDate = new Date(dateParam)
    }

    // Set start and end of the target date
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const screenings = await prisma.movieScreening.findMany({
      where: {
        isActive: true,
        screenTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(movieId && { movieId }),
      },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            duration: true,
            posterUrl: true,
            rating: true,
            genre: true,
            description: true,
            director: true,
          },
        },
      },
      orderBy: {
        screenTime: 'asc',
      },
    })

    // Format screenings
    const formattedScreenings = screenings.map((screening) => {
      const availablePercentage = (screening.availableSeats / screening.totalSeats) * 100
      let status: 'available' | 'limited' | 'full' = 'available'

      if (availablePercentage === 0) {
        status = 'full'
      } else if (availablePercentage < 20) {
        status = 'limited'
      }

      return {
        id: screening.id,
        time: new Date(screening.screenTime).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        status,
        screenNumber: screening.screenNumber,
        price: Number(screening.price),
        availableSeats: screening.availableSeats,
        totalSeats: screening.totalSeats,
        movie: screening.movie,
      }
    })

    return NextResponse.json({ screenings: formattedScreenings })
  } catch (error: any) {
    console.error('Get public screenings error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des séances' },
      { status: 500 }
    )
  }
}
