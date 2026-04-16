import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const movieSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional(),
  duration: z.number().min(1, 'La durée est requise'),
  genre: z.string().optional(),
  rating: z.string().default('Tout public'),
  posterUrl: z.string().url().optional().or(z.literal('')),
  trailerUrl: z.string().url().optional().or(z.literal('')),
  director: z.string().optional(),
  actors: z.array(z.string()).default([]),
  language: z.string().default('VF'),
  isActive: z.boolean().default(true),
  nowShowing: z.boolean().default(false),
  comingSoon: z.boolean().default(false),
})

// GET /api/dashboard/movies - Get all movies
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const nowShowing = searchParams.get('nowShowing') === 'true'
    const comingSoon = searchParams.get('comingSoon') === 'true'

    const where: any = {}

    if (!includeInactive) {
      where.isActive = true
    }

    if (nowShowing) {
      where.nowShowing = true
    }

    if (comingSoon) {
      where.comingSoon = true
    }

    const movies = await prisma.movie.findMany({
      where,
      include: {
        screenings: {
          where: { isActive: true },
          orderBy: { screenTime: 'asc' },
          take: 5,
        },
        _count: {
          select: { screenings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ movies })
  } catch (error: any) {
    console.error('Get movies error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des films' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/movies - Create movie
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = movieSchema.parse(body)

    const movie = await prisma.movie.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      movie,
      message: 'Film créé avec succès',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create movie error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du film' },
      { status: 500 }
    )
  }
}
