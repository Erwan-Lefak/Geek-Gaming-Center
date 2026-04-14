import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Erwan123!', 10)

  const user = await prisma.user.upsert({
    where: { email: 'erwan@lefak.com' },
    update: {},
    create: {
      email: 'erwan@lefak.com',
      password: hashedPassword,
      name: 'Erwan Lefak',
      phone: '+237 6XX XXX XXX',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Utilisateur Erwan Lefak créé:', {
    email: user.email,
    name: user.name,
    role: user.role,
  })
  console.log('\n📝 Identifiants de connexion:')
  console.log('   Email: erwan@lefak.com')
  console.log('   Mot de passe: Erwan123!')
  console.log('   Rôle: ADMIN')
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
