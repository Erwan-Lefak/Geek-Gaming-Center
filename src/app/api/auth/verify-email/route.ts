import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/customer/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      )
    }

    const result = await verifyEmail(token)

    return NextResponse.json({
      success: true,
      email: result.email,
    })
  } catch (error: any) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Lien de vérification invalide ou expiré' },
      { status: 400 }
    )
  }
}
