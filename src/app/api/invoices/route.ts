import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import { generateInvoiceNumber, calculateTaxAmounts, MobileMoneyPayment, validateMobilePhoneNumber } from '@/lib/data/invoices'
import { z } from 'zod'

// Schéma de création de facture
const createInvoiceSchema = z.object({
  customerId: z.string(),
  type: z.enum(['GAMING_SESSION', 'BOUTIQUE_SALE', 'RESERVATION']),
  sessionId: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })),
  paymentMethod: z.enum(['CASH', 'MOBILE_MONEY_ORANGE', 'MOBILE_MONEY_MTN', 'CARD', 'BANK_TRANSFER']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID']).default('PAID'),
  discount: z.number().default(0),
  notes: z.string().optional(),
  // Mobile Money spécifique
  mobileMoneyProvider: z.enum(['ORANGE', 'MTN']).optional(),
  mobileMoneyPhone: z.string().optional(),
  mobileMoneyRef: z.string().optional(),
} as any)

// GET /api/invoices - Liste des factures
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    const where: any = {}

    if (customerId) {
      where.customerId = customerId
    }

    if (status) {
      where.paymentStatus = status
    }

    if (startDate || endDate) {
      where.invoiceDate = {}
      if (startDate) {
        where.invoiceDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.invoiceDate.lte = new Date(endDate)
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              name: true,
              role: true,
            },
          },
          items: true,
        },
      } as any),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } as any)
  } catch (error: any) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Créer une facture
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 } as any)
    }

    const body = await request.json()
    const data = createInvoiceSchema.parse(body)

    // Validation Mobile Money
    if ((data.paymentMethod as string).startsWith('MOBILE_MONEY')) {
      if (!data.mobileMoneyPhone || !data.mobileMoneyProvider) {
        return NextResponse.json(
          { error: 'Mobile Money phone number and provider are required' },
          { status: 400 }
        )
      }

      if (!validateMobilePhoneNumber(data.mobileMoneyPhone as string, data.mobileMoneyProvider as 'ORANGE' | 'MTN')) {
        return NextResponse.json(
          { error: 'Invalid phone number for selected Mobile Money provider' },
          { status: 400 }
        )
      }
    }

    // Récupérer le client
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    } as any)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 } as any)
    }

    // Calculer les montants
    const subtotal = (data.items as any[]).reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice)
    }, 0)

    const { taxAmount, total } = calculateTaxAmounts(subtotal - (data.discount as number))

    // Générer le numéro de facture
    const invoiceNumber = await generateInvoiceNumber(prisma)

    // Créer la facture
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        subtotal: subtotal - (data.discount as number),
        taxRate: 19.25,
        taxAmount,
        total,
        discount: data.discount as number,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        paidAt: data.paymentStatus === 'PAID' ? new Date() : null,
        mobileMoneyProvider: data.mobileMoneyProvider,
        mobileMoneyPhone: data.mobileMoneyPhone,
        mobileMoneyRef: data.mobileMoneyRef,
        type: data.type,
        notes: data.notes,
        createdById: user.id,
        sessionId: data.sessionId,
        items: {
          create: (data.items as any[]).map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    } as any)

    // Si c'est une facture de session, lier la session
    if (data.sessionId && data.type === 'GAMING_SESSION') {
      await prisma.gamingSession.update({
        where: { id: data.sessionId },
        data: { invoiceId: invoice.id },
      } as any)
    }

    return NextResponse.json(invoice, { status: 201 } as any)
  } catch (error: any) {
    console.error('Error creating invoice:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
