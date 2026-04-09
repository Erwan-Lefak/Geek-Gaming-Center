import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

// GET /api/pricing - Get pricing ID for equipment and duration
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const equipmentId = searchParams.get('equipmentId')
    const duration = searchParams.get('duration')
    const isWeekend = searchParams.get('isWeekend') === 'true'

    if (!equipmentId || !duration) {
      return NextResponse.json(
        { error: 'equipmentId and duration are required' },
        { status: 400 }
      )
    }

    const durationNum = parseInt(duration)

    // Find pricing for this equipment, duration and weekend status
    const pricing = await prisma.pricing.findFirst({
      where: {
        equipmentId: equipmentId,
        duration: durationNum,
        isWeekend: isWeekend,
      },
    } as any)

    if (!pricing) {
      return NextResponse.json(
        { error: 'Pricing not found for this equipment and duration' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      pricingId: pricing.id,
      price: Number(pricing.price),
      currency: pricing.currency,
    } as any)
  } catch (error: any) {
    console.error('Get pricing error:', error)
    return NextResponse.json(
      { error: error.message || 'Error fetching pricing' },
      { status: 500 }
    )
  }
}
