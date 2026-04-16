import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'

const menuItemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  image: z.string().url().optional().or(z.literal('')),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  isVegetarian: z.boolean().optional(),
  isVegan: z.boolean().optional(),
  isSpicy: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  preparationTime: z.number().min(1).optional(),
})

// GET /api/dashboard/menu-items/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
    })

    if (!menuItem) {
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ menuItem })
  } catch (error: any) {
    console.error('Get menu item error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération de l\'article' },
      { status: 500 }
    )
  }
}

// PATCH /api/dashboard/menu-items/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = menuItemUpdateSchema.parse(body)

    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      menuItem,
      message: 'Article mis à jour avec succès',
    })

  } catch (error: any) {
    console.error('Update menu item error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour de l\'article' },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/menu-items/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    await prisma.menuItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Article supprimé avec succès',
    })

  } catch (error: any) {
    console.error('Delete menu item error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression de l\'article' },
      { status: 500 }
    )
  }
}
