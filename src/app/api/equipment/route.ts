import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'

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
      include: {
        pricing: {
          orderBy: [{ isWeekend: 'asc' }, { duration: 'asc' }],
        },
      },
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
