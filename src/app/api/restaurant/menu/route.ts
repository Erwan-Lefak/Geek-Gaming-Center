import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/restaurant/menu - Get menu items grouped by category
export async function GET(request: NextRequest) {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    })

    // Group by category
    const groupedMenu = menuItems.reduce((acc, item) => {
      const category = item.category.toLowerCase()

      if (!acc[category]) {
        acc[category] = []
      }

      acc[category].push({
        id: item.id,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        category: item.category,
        image: item.image,
        ingredients: item.ingredients,
        allergens: item.allergens,
        isVegetarian: item.isVegetarian,
        isVegan: item.isVegan,
        isSpicy: item.isSpicy,
        preparationTime: item.preparationTime,
      })

      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      menu: groupedMenu,
      categories: Object.keys(groupedMenu),
    })
  } catch (error: any) {
    console.error('Get restaurant menu error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du menu' },
      { status: 500 }
    )
  }
}
