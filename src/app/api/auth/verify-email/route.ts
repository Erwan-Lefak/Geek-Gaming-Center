import { NextRequest, NextResponse } from 'next/server'
import { verifyEmail } from '@/lib/customer/auth'
import { prisma } from '@/lib/prisma/client'
import MailService from '@/lib/email/mail-service'

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

    // Get customer details to send account ready email
    const customer = await prisma.customer.findUnique({
      where: { email: result.email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      }
    })

    if (customer) {
      // Send account ready email
      try {
        await MailService.sendAccountReadyEmail(
          customer.email,
          customer.firstName,
          customer.lastName
        )
      } catch (emailError) {
        // Log error but don't fail the verification
        console.error('Failed to send account ready email:', emailError)
      }
    }

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
