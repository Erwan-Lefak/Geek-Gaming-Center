import { NextRequest, NextResponse } from 'next/server'
import { checkAvailability, getAvailableEquipment } from '@/lib/reservations'
import { z } from 'zod'

const availabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  equipmentId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')
    const equipmentId = searchParams.get('equipmentId')

    if (!dateParam) {
      return NextResponse.json(
        { error: 'Le paramètre date est requis' },
        { status: 400 }
      )
    }

    // Valider les paramètres
    const validatedData = availabilitySchema.parse({
      date: dateParam,
      equipmentId: equipmentId || undefined,
    })

    const date = new Date(validatedData.date)

    // Vérifier que la date n'est pas dans le passé
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    if (compareDate < today) {
      return NextResponse.json(
        { error: 'La date ne peut pas être dans le passé' },
        { status: 400 }
      )
    }

    // Récupérer les disponibilités
    const slots = await checkAvailability(date, validatedData.equipmentId)

    // Récupérer les équipements disponibles si pas de filtre
    let equipment: any[] = []
    if (!validatedData.equipmentId) {
      equipment = await getAvailableEquipment()
    }

    return NextResponse.json({
      date: validatedData.date,
      slots,
      equipment: equipment.length > 0 ? equipment : undefined,
    })
  } catch (error: any) {
    console.error('Availability check error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification des disponibilités' },
      { status: 500 }
    )
  }
}
