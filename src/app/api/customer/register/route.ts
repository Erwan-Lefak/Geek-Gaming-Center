import { NextRequest, NextResponse } from 'next/server'
import { registerCustomer } from '@/lib/customer/auth'
import { z } from 'zod'
import { MailService } from '@/lib/email/mail-service'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  howDidYouFindUs: z.string(),
  howDidYouFindUsDetails: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate passwords match
    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Les mots de passe ne correspondent pas' },
        { status: 400 }
      )
    }

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Remove confirmPassword before passing to registerCustomer
    const { confirmPassword, ...customerData } = validatedData

    const customer = await registerCustomer(customerData)

    // Send welcome email to customer with verification link
    try {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
        ? `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL}`
        : 'http://localhost:3000'

      const verificationUrl = `${baseUrl}/verify-email?token=${customer.verificationToken}`

      await MailService.sendWelcomeEmail(
        customer.email,
        customer.firstName,
        customer.lastName,
        verificationUrl
      )
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail registration if email fails
    }

    // Send notification to admin
    try {
      await MailService.sendAdminNotification('new_customer_registration', {
        customer_name: `${customer.firstName} ${customer.lastName}`,
        customer_email: customer.email,
        customer_phone: customer.phone,
        customer_address: customerData.address,
        registration_date: new Date().toLocaleDateString('fr-FR'),
      })
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      customer,
      message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue lors de l\'inscription' },
      { status: 400 }
    )
  }
}
