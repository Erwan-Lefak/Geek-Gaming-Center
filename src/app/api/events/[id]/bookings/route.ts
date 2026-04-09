import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getCurrentUser } from '@/lib/auth/utils'

// GET - Récupérer les réservations d'un événement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookings = await prisma.eventBooking.findMany({
      where: { eventId: params.id },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

// POST - Créer une réservation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    const data = await request.json()

    // Vérifier que l'événement existe et a des places
    const event = await prisma.event.findUnique({
      where: { id: params.id }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    const availableSlots = event.maxCapacity - event.bookedCount
    const requestedTickets = parseInt(data.numberOfTickets)

    if (requestedTickets > availableSlots) {
      return NextResponse.json(
        { error: `Places insuffisantes. Il reste ${availableSlots} places.` },
        { status: 400 }
      )
    }

    // Créer la réservation
    const booking = await prisma.eventBooking.create({
      data: {
        eventId: params.id,
        customerId: user?.id || null,
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        attendeePhone: data.attendeePhone,
        numberOfTickets: requestedTickets,
        totalPrice: event.price * requestedTickets,
        status: 'confirmed'
      }
    })

    // Mettre à jour le compteur de réservations
    await prisma.event.update({
      where: { id: params.id },
      data: {
        bookedCount: {
          increment: requestedTickets
        }
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la réservation' },
      { status: 500 }
    )
  }
}
