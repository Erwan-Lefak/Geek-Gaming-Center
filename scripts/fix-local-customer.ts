import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixLocalCustomer() {
  try {
    const email = 'erwan.lefak@gmail.com'
    const password = 'Dragonfreeze1995*'

    console.log('🔧 Mise à jour du customer en local...')

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Mettre à jour le customer
    const customer = await prisma.customer.update({
      where: { email },
      data: {
        password: hashedPassword,
        is_active: true,
        email_verified: new Date(),
      },
    })

    console.log('✅ Customer mis à jour:', {
      id: customer.id,
      email: customer.email,
      is_active: customer.is_active,
      has_password: !!customer.password,
    })

    await prisma.$disconnect()
  } catch (error) {
    console.error('❌ Erreur:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

fixLocalCustomer()
