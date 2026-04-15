import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { compare, hash } from 'bcryptjs'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if ((session.user as any).role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Accès réservé aux clients' }, { status: 403 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // Get current customer
    const customer = await prisma.customer.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!customer || !customer.password) {
      return NextResponse.json({ error: 'Mot de passe actuel non trouvé' }, { status: 400 })
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, customer.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.customer.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: 'Mot de passe changé avec succès' })
  } catch (error: any) {
    console.error('Change password error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    )
  }
}
