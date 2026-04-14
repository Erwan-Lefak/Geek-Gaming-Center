import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import { SmsService } from '@/lib/sms/sms-service'
import { MailService } from '@/lib/email/mail-service'
import crypto from 'crypto'

/**
 * POST /api/auth/verify-phone
 * Verify customer phone with SMS code
 *
 * Flow:
 * 1. Validate code and customerId
 * 2. Verify SMS code
 * 3. Mark phone as verified
 * 4. Check if email is also verified
 * 5. If both verified, send password setup email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { customerId, code } = body

    if (!customerId || !code) {
      return NextResponse.json(
        { error: 'Code de vérification ou ID client manquant' },
        { status: 400 }
      )
    }

    // Verify SMS code using SmsService
    const isValid = await SmsService.verifyPhoneCode(customerId, code)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Code de vérification invalide ou expiré' },
        { status: 400 }
      )
    }

    // Get customer to check email verification status
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Check if email is also verified
    const emailVerified = !!customer.email_verified
    const bothVerified = emailVerified

    let nextStep = ''
    let setupUrl = ''

    if (bothVerified) {
      // Both email and phone verified, send password setup email
      const setupToken = crypto.randomBytes(32).toString('hex')

      // Store setup token
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          password_reset_token: setupToken,
          password_reset_expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      })

      // Generate setup URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      setupUrl = `${baseUrl}/setup-password?token=${setupToken}`

      // Send password setup email
      await MailService.sendPasswordSetup(
        customer.email,
        `${customer.firstName} ${customer.lastName}`,
        setupUrl
      )

      nextStep = 'Crée ton mot de passe pour activer ton compte'
    } else {
      nextStep = 'Vérifie maintenant ton email avec le lien envoyé'
    }

    return NextResponse.json({
      success: true,
      message: 'Téléphone vérifié avec succès !',
      data: {
        customerId,
        phoneVerified: true,
        emailVerified,
        bothVerified,
        nextStep,
        setupUrl: bothVerified ? setupUrl : undefined
      }
    })

  } catch (error: any) {
    console.error('❌ Error verifying phone:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du téléphone' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/verify-phone
 * Resend SMS verification code
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const customerId = searchParams.get('customer')

    if (!customerId) {
      return NextResponse.json(
        { error: 'ID client manquant' },
        { status: 400 }
      )
    }

    // Get customer
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Client non trouvé' },
        { status: 404 }
      )
    }

    // Send new SMS verification code
    const smsResult = await SmsService.sendPhoneVerificationCode(
      customer.id,
      customer.phone,
      customer.firstName
    )

    if (!smsResult.success) {
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du SMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Code de vérification SMS renvoyé avec succès',
      data: {
        smsSent: true
      }
    })

  } catch (error: any) {
    console.error('❌ Error resending SMS code:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi du SMS' },
      { status: 500 }
    )
  }
}
