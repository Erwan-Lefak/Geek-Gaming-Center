import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import { MailService } from '@/lib/email/mail-service'

/**
 * POST /api/auth/verify-email
 * Verify customer email with token
 *
 * Flow:
 * 1. Validate token
 * 2. Find customer by token
 * 3. Check if token is not expired
 * 4. Mark email as verified
 * 5. Check if phone is also verified
 * 6. If both verified, send password setup email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate token
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      )
    }

    // Find customer by verification token
    const customer = await prisma.customer.findFirst({
      where: {
        password_reset_token: token
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Token de vérification invalide' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (customer.password_reset_expires && new Date() > customer.password_reset_expires) {
      return NextResponse.json(
        { error: 'Token expiré. Veuillez demander un nouveau lien de vérification.' },
        { status: 400 }
      )
    }

    // Mark email as verified
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        emailVerified: new Date(),
        password_reset_token: null, // Clear email verification token
        password_reset_expires: null
      }
    })

    // Check if phone is also verified (we'll use a separate field for this)
    // For now, we'll assume phone is not verified yet

    // Send confirmation email
    await MailService.sendEmail({
      to: customer.email,
      templateType: 'customer_email_verified',
      data: {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        website_title: 'Geek Gaming Center'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès !',
      data: {
        customerId: customer.id,
        emailVerified: true,
        nextStep: 'Vérifie maintenant ton numéro de téléphone avec le code SMS',
        phoneVerificationUrl: `/verify-phone?customer=${customer.id}`
      }
    })

  } catch (error: any) {
    console.error('❌ Error verifying email:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/verify-email
 * Resend verification email
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email manquant' },
        { status: 400 }
      )
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Aucun compte trouvé avec cet email' },
        { status: 404 }
      )
    }

    // Generate new verification token
    const newToken = crypto.randomBytes(32).toString('hex')

    // Update customer with new token
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password_reset_token: newToken,
        password_reset_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    })

    // Generate verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailVerificationUrl = `${baseUrl}/verify-email?token=${newToken}`

    // Send verification email
    const emailSent = await MailService.sendEmailVerification(
      customer.email,
      `${customer.firstName} ${customer.lastName}`,
      emailVerificationUrl
    )

    return NextResponse.json({
      success: true,
      message: 'Email de vérification renvoyé avec succès',
      data: { emailSent }
    })

  } catch (error: any) {
    console.error('❌ Error resending verification email:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi de l\'email de vérification' },
      { status: 500 }
    )
  }
}
