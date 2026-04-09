import { NextRequest, NextResponse } from 'next/server'
import { createReservation, getCustomerReservations, generateSessionNumber } from '@/lib/reservations'
import { z } from 'zod'

const createReservationSchema = z.object({
  equipmentId: z.string().min(1, 'L\'équipement est requis'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide'),
  startTime: z.string().regex(/^\d{1,2}:\d{2}$/, 'Format d\'heure invalide (HH:MM)'),
  duration: z.number().min(60, 'La durée minimum est de 60 minutes'),
  pricingId: z.string().min(1, 'Le tarif est requis'),
})

// GET /api/reservations - Récupérer les réservations du client connecté
export async function GET(request: NextRequest) {
  try {
    const customerId = request.cookies.get('customer_id')?.value

    if (!customerId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const reservations = await getCustomerReservations(customerId)

    return NextResponse.json({
      reservations,
    })
  } catch (error: any) {
    console.error('Get reservations error:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

// POST /api/reservations - Créer une nouvelle réservation
export async function POST(request: NextRequest) {
  try {
    const customerId = request.cookies.get('customer_id')?.value

    if (!customerId) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer une réservation' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Valider les données
    const validatedData = createReservationSchema.parse(body)

    // Créer la réservation
    const sessionNumber = await generateSessionNumber()
    const reservation = await createReservation({
      customerId: customerId,
      equipmentId: validatedData.equipmentId,
      date: new Date(validatedData.date),
      startTime: validatedData.startTime,
      duration: validatedData.duration,
      pricingId: validatedData.pricingId,
    })

    return NextResponse.json({
      success: true,
      reservation: {
        ...reservation,
        sessionNumber,
      },
      message: 'Réservation créée avec succès !',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create reservation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la réservation' },
      { status: 500 }
    )
  }
}
