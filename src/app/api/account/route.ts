import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

// GET /api/account - Get current customer profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if ((session.user as any).role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Accès réservé aux clients' }, { status: 403 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        createdAt: true,
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération du profil' },
      { status: 500 }
    )
  }
}

// PUT /api/account - Update profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if ((session.user as any).role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Accès réservé aux clients' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const customer = await prisma.customer.update({
      where: { id: session.user.id },
      data: validatedData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
      },
    })

    return NextResponse.json({ customer, message: 'Profil mis à jour avec succès' })
  } catch (error: any) {
    console.error('Update profile error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}

// DELETE /api/account - Delete account
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if ((session.user as any).role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Accès réservé aux clients' }, { status: 403 })
    }

    // Soft delete - just mark as inactive
    await prisma.customer.update({
      where: { id: session.user.id },
      data: {
        is_active: false,
        email: `deleted_${session.user.id}_${Date.now()}@deleted.com`, // Anonymize email
      },
    })

    return NextResponse.json({ message: 'Compte supprimé avec succès' })
  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la suppression du compte' },
      { status: 500 }
    )
  }
}
