import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma/client'
import { MailService } from '@/lib/email/mail-service'
import { SmsService } from '@/lib/sms/sms-service'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  howDidYouFindUs: z.string().optional(),
  howDidYouFindUsDetails: z.string().optional(),
  notes: z.string().optional(),
  acceptCGV: z.boolean().refine(val => val === true, 'Tu dois accepter les CGV'),
  acceptTerms: z.boolean().optional()
})

/**
 * POST /api/auth/register
 * Register a new customer and send verification emails/SMS
 *
 * Flow:
 * 1. Validate input
 * 2. Check if email/phone already exists
 * 3. Create customer account (inactive)
 * 4. Generate verification token and SMS code
 * 5. Send verification email
 * 6. Send verification SMS
 * 7. Return success with next steps
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if email already exists
    const existingEmail = await prisma.customer.findUnique({
      where: { email: validatedData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    const existingPhone = await prisma.customer.findFirst({
      where: { phone: validatedData.phone }
    })

    if (existingPhone) {
      return NextResponse.json(
        { error: 'Un compte avec ce numéro de téléphone existe déjà' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = SmsService.formatPhoneNumber(validatedData.phone)

    // Generate verification tokens
    const emailVerificationToken = SmsService.generateSecureToken()
    const smsVerificationCode = SmsService.generateVerificationCode()

    // Create customer account (inactive)
    const customer = await prisma.customer.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: formattedPhone,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        howDidYouFindUs: validatedData.howDidYouFindUs || null,
        howDidYouFindUsDetails: validatedData.howDidYouFindUsDetails || null,
        notes: validatedData.notes || null,
        acceptCGV: validatedData.acceptCGV || validatedData.acceptTerms || true,
        cgvAcceptedAt: new Date(),
        status: 'NEW', // New customer, needs verification
        is_active: false, // Inactive until verified
        password_reset_token: emailVerificationToken, // Store email verification token
        password_reset_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        createdById: 'system' // System registration
      }
    })

    // Generate verification URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const emailVerificationUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`
    const phoneVerificationUrl = `${baseUrl}/verify-phone?customer=${customer.id}`

    // Send verification email
    let emailSent = false
    if (customer.email) {
      emailSent = await MailService.sendEmailVerification(
        customer.email,
        `${customer.firstName} ${customer.lastName}`,
        emailVerificationUrl
      )
    }

    // Send verification SMS
    const smsResult = await SmsService.sendPhoneVerificationCode(
      customer.id,
      formattedPhone,
      customer.firstName
    )

    // Notify admin about new customer
    await MailService.sendAdminNotification('new_customer', {
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email || 'Non renseigné',
      phone: formattedPhone,
      how_did_you_find_us: customer.howDidYouFindUs || 'Inconnu',
      created_at: new Date().toLocaleString('fr-FR')
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès ! Vérifie ton email et ton téléphone.',
      data: {
        customerId: customer.id,
        email: customer.email,
        phone: formattedPhone,
        emailSent,
        smsSent: smsResult.success,
        nextSteps: [
          '1. Ouvre ton email et clique sur le lien de vérification',
          '2. Entre le code SMS que tu as reçu',
          '3. Crée ton mot de passe',
          '4. Ton compte sera activé !'
        ]
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Error during registration:', error)

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
