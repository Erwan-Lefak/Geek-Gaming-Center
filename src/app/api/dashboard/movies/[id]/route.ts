import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const movieUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  duration: z.number().min(1).optional(),
  genre: z.string().optional(),
  rating: z.string().optional(),
  posterUrl: z.string().url().optional().or(z.literal('')),
  trailerUrl: z.string().url().optional().or(z.literal('')),
  director: z.string().optional(),
  actors: z.array(z.string()).optional(),
  language: z.string().optional(),
  isActive: z.boolean().optional(),
  nowShowing: z.boolean().optional(),
  comingSoon: z.boolean().optional(),
})

// GET /api/dashboard/movies/[id] - Get single movie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    const { id } = await params

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        screenings: {
          where: { isActive: true },
          orderBy: { screenTime: 'asc' },
        },
        _count: {
          select: { screenings: true },
        },
      },
    })

    if (!movie) {
      return NextResponse.json({ error: 'Film non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ movie })
  } catch (error: any) {
    console.error('Get movie error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du film' },
      { status: 500 }
    )
  }
}

// PATCH /api/dashboard/movies/[id] - Update movie
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params

    const body = await request.json()
    const validatedData = movieUpdateSchema.parse(body)

    const movie = await prisma.movie.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      movie,
      message: 'Film mis à jour avec succès',
    })

  } catch (error: any) {
    console.error('Update movie error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du film' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/movies/[id] - Delete movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { id } = await params

    // Check if movie has screenings
    const screeningCount = await prisma.movieScreening.count({
      where: {
        movieId: id,
        isActive: true,
      },
    })

    if (screeningCount > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un film avec des séances programmées' },
        { status: 400 }
      )
    }

    await prisma.movie.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Film supprimé avec succès',
    })

  } catch (error: any) {
    console.error('Delete movie error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du film' },
      { status: 500 }
    )
  }
}
