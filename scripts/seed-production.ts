#!/usr/bin/env node

/**
 * Script pour peupler la base de données de production Vercel Postgres
 * Usage: node scripts/seed-production.ts
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { config } from 'dotenv'

// Charger les variables d'environnement de production
config({ path: '.env.production' })

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  console.log('🌱 Seeding production database...')

  // 1. Créer l'administrateur
  console.log('📝 Creating admin user...')
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ggc.cm' },
    update: {},
    create: {
      email: 'admin@ggc.cm',
      password: adminPassword,
      name: 'Administrateur GGC',
      role: 'ADMIN',
      phone: '+237 600 000 001',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // 2. Créer les autres utilisateurs
  console.log('📝 Creating test users...')

  // Gérant
  const managerPassword = await hash('manager123', 12)
  const manager = await prisma.user.upsert({
    where: { email: 'manager@ggc.cm' },
    update: {},
    create: {
      email: 'manager@ggc.cm',
      password: managerPassword,
      name: 'Gérant GGC',
      role: 'MANAGER',
      phone: '+237 600 000 002',
    },
  })
  console.log('✅ Manager created:', manager.email)

  // Caissière
  const cashierPassword = await hash('cashier123', 12)
  const cashier = await prisma.user.upsert({
    where: { email: 'caissiere@ggc.cm' },
    update: {},
    create: {
      email: 'caissiere@ggc.cm',
      password: cashierPassword,
      name: 'Caissière GGC',
      role: 'CASHIER',
      phone: '+237 600 000 003',
    },
  })
  console.log('✅ Cashier created:', cashier.email)

  console.log('✨ Production database seeded successfully!')
  console.log('')
  console.log('📋 Test accounts:')
  console.log('   Admin: admin@ggc.cm / admin123')
  console.log('   Manager: manager@ggc.cm / manager123')
  console.log('   Cashier: caissiere@ggc.cm / cashier123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
