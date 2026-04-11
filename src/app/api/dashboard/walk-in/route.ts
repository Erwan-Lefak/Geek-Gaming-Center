import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// Schéma de création de session walk-in
const walkInSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().min(8, 'Le téléphone est requis'),
  equipmentType: z.string().min(1, 'Le type d\'équipement est requis'),
  duration: z.number().min(60, 'La durée minimum est de 60 minutes'),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'CARD', 'BANK_TRANSFER']),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
})

// POST /api/dashboard/walk-in - Créer une session walk-in (client sur place)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()

    // Valider les données
    const validatedData = walkInSchema.parse(body)

    // Trouver ou créer le client
    let customer = await prisma.customer.findFirst({
      where: {
        phone: validatedData.phone,
      },
    })

    if (!customer) {
      // Créer un nouveau client
      customer = await prisma.customer.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email || null,
          phone: validatedData.phone,
          createdById: user.id,
          status: 'NEW',
          acceptCGV: true,
          cgvAcceptedAt: new Date(),
        },
      })
    }

    // Trouver un équipement disponible du type demandé
    const equipment = await prisma.equipment.findFirst({
      where: {
        type: validatedData.equipmentType as any,
        status: 'AVAILABLE',
      },
      include: {
        pricing: {
          where: {
            duration: validatedData.duration,
          },
        },
      },
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Aucun équipement disponible de ce type' },
        { status: 400 }
      )
    }

    if (!equipment.pricing || equipment.pricing.length === 0) {
      return NextResponse.json(
        { error: 'Aucun tarif trouvé pour cette durée' },
        { status: 400 }
      )
    }

    const pricing = equipment.pricing[0]
    const price = pricing.price

    // Générer un numéro de session
    const sessionCount = await prisma.gamingSession.count()
    const sessionNumber = `SES-${String(sessionCount + 1).padStart(6, '0')}`

    // Calculer les heures
    const now = new Date()
    const scheduledEndAt = new Date(now.getTime() + validatedData.duration * 60000)

    // Créer la session
    const session = await prisma.gamingSession.create({
      data: {
        sessionNumber,
        customerId: customer.id,
        equipmentId: equipment.id,
        pricingId: pricing.id,
        duration: validatedData.duration,
        price,
        status: validatedData.isPaid ? 'ACTIVE' : 'PENDING',
        paidAt: validatedData.isPaid ? now : undefined,
        startedAt: validatedData.isPaid ? now : undefined,
        scheduledEndAt,
        notes: validatedData.notes,
        createdById: user.id,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
        equipment: {
          select: {
            id: true,
            name: true,
            type: true,
            code: true,
            status: true,
          },
        },
        pricing: {
          select: {
            duration: true,
            price: true,
          },
        },
      },
    })

    // Marquer l'équipement comme utilisé
    await prisma.equipment.update({
      where: { id: equipment.id },
      data: { status: 'IN_USE' },
    })

    // Mettre à jour les stats du client
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpent: { increment: price },
        totalHours: { increment: validatedData.duration / 60 },
        visitCount: { increment: 1 },
        lastVisit: now,
      },
    })

    return NextResponse.json({
      success: true,
      session,
      message: 'Session walk-in créée avec succès',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Walk-in creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de la session walk-in' },
      { status: 500 }
    )
  }
}
