import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const menuItemSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  category: z.string().min(1, 'La catégorie est requise'),
  price: z.number().min(0, 'Le prix est requis'),
  image: z.string().url().optional().or(z.literal('')),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
  preparationTime: z.number().min(1).default(15),
})

// GET /api/dashboard/menu-items - Get all menu items
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN', 'CASHIER'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const isAvailable = searchParams.get('isAvailable')

    const where: any = {}

    if (category) {
      where.category = category
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === 'true'
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    return NextResponse.json({ menuItems })
  } catch (error: any) {
    console.error('Get menu items error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du menu' },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/menu-items - Create menu item
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = menuItemSchema.parse(body)

    const menuItem = await prisma.menuItem.create({
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      menuItem,
      message: 'Article créé avec succès',
    }, { status: 201 })

  } catch (error: any) {
    console.error('Create menu item error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création de l\'article' },
      { status: 500 }
    )
  }
}
