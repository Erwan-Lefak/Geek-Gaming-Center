import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

// Schéma de création d'équipement
const createEquipmentSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['PS5', 'PS4', 'XBOX_SERIES_X', 'PC_GAMING', 'OCULUS_VR', 'VR_PS4', 'SIMU_RACING']),
  code: z.string().min(1, 'Le code est requis'),
  status: z.enum(['AVAILABLE', 'IN_USE', 'RESERVED', 'MAINTENANCE', 'BROKEN']).default('AVAILABLE'),
  healthScore: z.number().min(0).max(100).default(100),
  location: z.string().optional(),
  hourlyRate: z.number().min(0).default(0),
})

// GET /api/equipment - Liste des équipements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const withPricing = searchParams.get('withPricing')

    // Allow public access when withPricing is true (for booking page)
    // Otherwise require authentication
    if (!withPricing) {
      await requireAuth()
    }

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
    } as any)

    return NextResponse.json({ equipment } as any)
  } catch (error: any) {
    console.error('Error fetching equipment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/equipment - Créer un nouvel équipement
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const data = createEquipmentSchema.parse(body)

    // Vérifier si le code est unique
    const existing = await prisma.equipment.findUnique({
      where: { code: data.code },
    } as any)

    if (existing) {
      return NextResponse.json(
        { error: 'Un équipement avec ce code existe déjà' },
        { status: 400 }
      )
    }

    // Créer l'équipement
    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        type: data.type,
        code: data.code,
        status: data.status,
        healthScore: data.healthScore,
        location: data.location,
        hourlyRate: data.hourlyRate,
      },
    } as any)

    return NextResponse.json(equipment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating equipment:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Erreur de validation', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
