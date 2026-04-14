import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import bcrypt from 'bcryptjs'

// Password validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token manquant'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

/**
 * POST /api/auth/reset-password
 * Reset password with token
 *
 * Flow:
 * 1. Validate token and password
 * 2. Find customer by token
 * 3. Check if token is not expired
 * 4. Hash new password
 * 5. Save password and clear token
 * 6. Return success
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    // Find customer by reset token
    const customer = await prisma.customer.findFirst({
      where: {
        password_reset_token: validatedData.token
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Token de réinitialisation invalide' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (customer.password_reset_expires && new Date() > customer.password_reset_expires) {
      return NextResponse.json(
        { error: 'Token expiré. Veuillez demander un nouveau lien de réinitialisation.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Update customer password
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        password_reset_token: null, // Clear reset token
        password_reset_expires: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès ! Tu peux maintenant te connecter.',
      data: {
        email: customer.email,
        loginUrl: '/login'
      }
    })

  } catch (error: any) {
    console.error('❌ Error resetting password:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/reset-password
 * Verify reset token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Find customer by reset token
    const customer = await prisma.customer.findFirst({
      where: {
        password_reset_token: token
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Token de réinitialisation invalide' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (customer.password_reset_expires && new Date() > customer.password_reset_expires) {
      return NextResponse.json(
        { error: 'Token expiré' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        customerEmail: customer.email
      }
    })

  } catch (error: any) {
    console.error('❌ Error verifying reset token:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du token' },
      { status: 500 }
    )
  }
}
