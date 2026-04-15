import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import { MailService } from '@/lib/email/mail-service'
import { encrypt } from '@/lib/crypto'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Password validation schema
const passwordSchema = z.object({
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
 * POST /api/auth/setup-password
 * Setup password for first-time connection
 *
 * Flow:
 * 1. Validate token and password
 * 2. Find customer by token
 * 3. Check if token is not expired
 * 4. Hash password
 * 5. Save password and activate account
 * 6. Send account ready email
 * 7. Clear verification tokens
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = passwordSchema.parse(body)

    // Find customer by setup token
    const customer = await prisma.customer.findFirst({
      where: {
        password_reset_token: validatedData.token
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Token de configuration invalide' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (customer.password_reset_expires && new Date() > customer.password_reset_expires) {
      return NextResponse.json(
        { error: 'Token expiré. Veuillez demander un nouveau lien de configuration.' },
        { status: 400 }
      )
    }

    // Check if email and phone are verified
    if (!customer.email_verified) {
      return NextResponse.json(
        { error: 'Veuillez d\'abord vérifier ton email avant de créer ton mot de passe' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Encrypt plain password for staff viewing
    const encryptedPassword = encrypt(validatedData.password)

    // Update customer with password and activate account
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        password: hashedPassword,
        password_plain: encryptedPassword, // Store encrypted plain password
        is_active: true, // Activate account
        status: 'ACTIVE', // Change status to ACTIVE
        password_reset_token: null, // Clear setup token
        password_reset_expires: null
      }
    })

    // Send account ready email
    await MailService.sendEmail({
      to: customer.email,
      templateType: 'customer_account_ready',
      data: {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        website_title: 'Geek Gaming Center'
      }
    })

    // Notify admin about new activated customer
    await MailService.sendAdminNotification('customer_activated', {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      activated_at: new Date().toLocaleString('fr-FR')
    })

    return NextResponse.json({
      success: true,
      message: 'Compte activé avec succès ! Tu peux maintenant te connecter.',
      data: {
        customerId: customer.id,
        email: customer.email,
        accountActive: true,
        loginUrl: '/login'
      }
    })

  } catch (error: any) {
    console.error('❌ Error setting up password:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la configuration du mot de passe' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/auth/setup-password
 * Verify setup token and show form
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

    // Find customer by setup token
    const customer = await prisma.customer.findFirst({
      where: {
        password_reset_token: token
      }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Token de configuration invalide' },
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
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`
      }
    })

  } catch (error: any) {
    console.error('❌ Error verifying setup token:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la vérification du token' },
      { status: 500 }
    )
  }
}
