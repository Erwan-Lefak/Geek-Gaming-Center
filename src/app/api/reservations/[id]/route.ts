import { NextRequest, NextResponse } from 'next/server'
import { cancelReservation } from '@/lib/reservations'

// DELETE /api/reservations/:id - Annuler une réservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customerId = request.cookies.get('customer_id')?.value

    if (!customerId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de réservation requis' },
        { status: 400 }
      )
    }

    const cancelledReservation = await cancelReservation(sessionId, customerId)

    return NextResponse.json({
      success: true,
      reservation: cancelledReservation,
      message: 'Réservation annulée avec succès',
    })
  } catch (error: any) {
    console.error('Cancel reservation error:', error)

    // Gérer les erreurs spécifiques
    if (error.message === 'Réservation non trouvée') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    if (error.message.includes('pas autorisé')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    if (error.message.includes('annulation gratuite')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'annulation de la réservation' },
      { status: 500 }
    )
  }
}

// GET /api/reservations/:id - Récupérer les détails d'une réservation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const customerId = request.cookies.get('customer_id')?.value

    if (!customerId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id: sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID de réservation requis' },
        { status: 400 }
      )
    }

    // TODO: Implémenter la récupération des détails d'une réservation
    return NextResponse.json({
      error: 'Non implémenté',
    }, { status: 501 })
  } catch (error: any) {
    console.error('Get reservation error:', error)

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de la réservation' },
      { status: 500 }
    )
  }
}
