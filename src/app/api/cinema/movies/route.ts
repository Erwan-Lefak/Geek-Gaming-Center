import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/cinema/movies - Get all active movies for public cinema page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nowShowing = searchParams.get('nowShowing') === 'true'

    const movies = await prisma.movie.findMany({
      where: {
        isActive: true,
        nowShowing: nowShowing || undefined,
      },
      include: {
        screenings: {
          where: {
            isActive: true,
            screenTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            screenTime: 'asc',
          },
          take: 4, // Limit to next 4 screenings
        },
        _count: {
          select: { screenings: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format the response to match the cinema page structure
    const formattedMovies = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      subtitle: movie.director ? `${movie.director} - 2025` : '2025',
      poster: movie.posterUrl,
      duration: movie.duration >= 60
        ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60 > 0 ? `${movie.duration % 60}min` : ''}`
        : `${movie.duration} min`,
      episodes: movie.director ? 'Film' : 'Série',
      genre: movie.genre || 'Non spécifié',
      rating: movie.rating || 'Tous publics',
      synopsis: movie.description || '',
      sessions: movie.screenings.map((screening) => {
        const availablePercentage = (screening.availableSeats / screening.totalSeats) * 100
        let status: 'available' | 'limited' | 'full' = 'available'

        if (availablePercentage === 0) {
          status = 'full'
        } else if (availablePercentage < 20) {
          status = 'limited'
        }

        return {
          time: new Date(screening.screenTime).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }),
          status,
          screeningId: screening.id,
          price: Number(screening.price),
        }
      }),
      type: movie.director ? ('movie' as const) : ('series' as const),
      colors: movie.director ? 'from-purple-600 to-pink-500' : 'from-blue-600 to-cyan-500',
    }))

    return NextResponse.json({ movies: formattedMovies })
  } catch (error: any) {
    console.error('Get public movies error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des films' },
      { status: 500 }
    )
  }
}
