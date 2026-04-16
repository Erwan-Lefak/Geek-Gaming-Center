import { NextRequest, NextResponse } from 'next/server'
import { isEmailVerified } from '@/lib/customer/auth'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID manquant' },
        { status: 400 }
      )
    }

    const emailVerified = await isEmailVerified(userId)

    return NextResponse.json({
      emailVerified,
    })
  } catch (error: any) {
    console.error('Email verification check error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}
