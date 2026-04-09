import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getCurrentUser } from '@/lib/auth/utils'

// GET - Récupérer tous les événements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includePast = searchParams.get('includePast') === 'true'

    const where: any = {
      isActive: true,
      isPublished: true,
    }

    // Filtre par type
    if (type && type !== 'all') {
      where.type = type
    }

    // Filtre par date
    if (!includePast) {
      where.eventDate = {
        gte: new Date().toISOString().split('T')[0]
      }
    } else if (startDate && endDate) {
      where.eventDate = {
        gte: startDate,
        lte: endDate
      }
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: {
        eventDate: 'asc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements' },
      { status: 500 }
    )
  }
}

// POST - Créer un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validation
    if (!data.title || !data.description || !data.type || !data.eventDate || !data.startTime || !data.maxCapacity) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price || 0,
        maxCapacity: parseInt(data.maxCapacity),
        imageUrl: data.imageUrl,
        location: data.location,
        isActive: true,
        isPublished: data.isPublished ?? false,
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'événement' },
      { status: 500 }
    )
  }
}
