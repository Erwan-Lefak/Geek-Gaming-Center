import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import { MailService } from '@/lib/email/mail-service'
import crypto from 'crypto'

/**
 * POST /api/auth/forgot-password
 * Request password reset
 *
 * Flow:
 * 1. Validate email
 * 2. Find customer by email
 * 3. Generate reset token
 * 4. Save token with expiration (1 hour)
 * 5. Send reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate email
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      )
    }

    // Find customer by email
    const customer = await prisma.customer.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration
    // But only send email if customer exists
    if (customer) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Save reset token
      await prisma.customer.update({
        where: { id: customer.id },
        data: {
          password_reset_token: resetToken,
          password_reset_expires: expiresAt
        }
      })

      // Generate reset URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

      // Send reset email
      if (customer.email) {
        await MailService.sendPasswordReset(
          customer.email,
          `${customer.firstName} ${customer.lastName}`,
          resetUrl
        )
      }

      console.log(`✅ Password reset email sent to ${email}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, tu recevras un lien de réinitialisation.',
      data: {
        email
      }
    })

  } catch (error: any) {
    console.error('❌ Error requesting password reset:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    )
  }
}
