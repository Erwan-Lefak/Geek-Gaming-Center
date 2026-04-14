import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { z } from 'zod'
import { MailService } from '@/lib/email/mail-service'
import { SmsService } from '@/lib/sms/sms-service'
import crypto from 'crypto'

// Schéma de validation pour la création de client
const createCustomerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(9),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  howDidYouFindUs: z.string().optional(),
  howDidYouFindUsDetails: z.string().optional(),
  notes: z.string().optional(),
  acceptCGV: z.boolean().optional(),
  acceptTerms: z.boolean().optional(),
} as any)

// GET /api/customers - Liste des clients
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Vérification des permissions
    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    // Filtre de recherche
    const where: any = {}
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }
    if (status) {
      where.status = status
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          totalSpent: true,
          totalHours: true,
          visitCount: true,
          lastVisit: true,
          createdAt: true,
          createdById: true,
        },
      } as any),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as any)
  } catch (error: any) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Créer un client
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    // Seuls la caissière, gérant et admin peuvent créer des clients
    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const body = await request.json()
    console.log('📥 Body reçu:', JSON.stringify(body, null, 2))

    const data = createCustomerSchema.parse(body)
    console.log('✅ Data validée:', JSON.stringify(data, null, 2))

    // Handle both acceptCGV and acceptTerms (from CustomerForm)
    const acceptedCGV = data.acceptCGV || data.acceptTerms

    if (!acceptedCGV) {
      return NextResponse.json(
        { error: 'Customer must accept CGV' },
        { status: 400 }
      )
    }

    const createData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth as string) : null,
      address: data.address || null,
      city: data.city || null,
      howDidYouFindUs: data.howDidYouFindUs || null,
      howDidYouFindUsDetails: data.howDidYouFindUsDetails || null,
      notes: data.notes || null,
      acceptCGV: acceptedCGV,
      cgvAcceptedAt: new Date(),
      createdById: user.id,
      status: 'NEW',
    }

    console.log('🔧 Données pour Prisma:', JSON.stringify(createData, null, 2))

    const customer = await prisma.customer.create({
      data: createData,
    } as any)

    console.log('✅ Client créé:', customer)

    // Send SMS verification code
    if (customer.phone) {
      try {
        const formattedPhone = SmsService.formatPhoneNumber(customer.phone)
        const smsResult = await SmsService.sendPhoneVerificationCode(
          customer.id,
          formattedPhone,
          customer.firstName
        )

        if (smsResult.success) {
          console.log('✅ SMS de vérification envoyé au:', formattedPhone)
        } else {
          console.error('⚠️ Erreur lors de l\'envoi du SMS de vérification')
        }
      } catch (smsError) {
        console.error('⚠️ Erreur lors de l\'envoi du SMS:', smsError)
        // Don't fail the request if SMS fails
      }
    }

    // If customer has an email, send setup password email
    if (customer.email) {
      try {
        // Generate setup token
        const setupToken = crypto.randomBytes(32).toString('hex')

        // Store setup token in database
        await prisma.customer.update({
          where: { id: customer.id },
          data: {
            password_reset_token: setupToken,
            password_reset_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          }
        })

        // Generate setup URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const setupUrl = `${baseUrl}/setup-password?token=${setupToken}`

        // Send setup password email
        await MailService.sendPasswordSetup(
          customer.email,
          `${customer.firstName} ${customer.lastName}`,
          setupUrl
        )

        console.log('✅ Email de setup password envoyé à:', customer.email)
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'email de setup password:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      ...customer,
      message: customer.email
        ? 'Client créé avec succès. Un email de configuration de mot de passe et un SMS de vérification ont été envoyés.'
        : 'Client créé avec succès. Un SMS de vérification a été envoyé.'
    }, { status: 201 } as any)
  } catch (error: any) {
    console.error('❌ Error creating customer:', error)
    console.error('❌ Error meta:', error.meta)
    console.error('❌ Error code:', error.code)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error', meta: error.meta },
      { status: 500 }
    )
  }
}
