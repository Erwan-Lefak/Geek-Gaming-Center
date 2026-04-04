import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import { config } from 'dotenv'

// Charger les variables d'environnement
config({ path: '.env.local' })

// Prisma 7 - Utilisation de l'objet de configuration standard
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

/**
 * Seed pour le CRM Geek Gaming Center
 * Initialise: utilisateurs admin, équipements, tarifs
 */

async function main() {
  console.log('🌱 Starting seed...')

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

  // 2. Créer les utilisateurs de test
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

  // Technicien
  const techPassword = await hash('tech123', 12)
  const technician = await prisma.user.upsert({
    where: { email: 'technicien@ggc.cm' },
    update: {},
    create: {
      email: 'technicien@ggc.cm',
      password: techPassword,
      name: 'Technicien GGC',
      role: 'TECHNICIAN',
      phone: '+237 600 000 004',
    },
  })
  console.log('✅ Technician created:', technician.email)

  // Actionnaire
  const shareholderPassword = await hash('shareholder123', 12)
  const shareholder = await prisma.user.upsert({
    where: { email: 'actionnaire@ggc.cm' },
    update: {},
    create: {
      email: 'actionnaire@ggc.cm',
      password: shareholderPassword,
      name: 'Actionnaire GGC',
      role: 'SHAREHOLDER',
      phone: '+237 600 000 005',
    },
  })
  console.log('✅ Shareholder created:', shareholder.email)

  // 3. Créer les équipements
  console.log('🎮 Creating equipment...')

  const equipmentData = [
    // PS5 (3 unités)
    { name: 'PlayStation 5 - Station 1', type: 'PS5', code: 'PS5-01', location: 'Zone A - Poste 01' },
    { name: 'PlayStation 5 - Station 2', type: 'PS5', code: 'PS5-02', location: 'Zone A - Poste 02' },
    { name: 'PlayStation 5 - Station 3', type: 'PS5', code: 'PS5-03', location: 'Zone A - Poste 03' },

    // PS4 (2 unités)
    { name: 'PlayStation 4 - Station 1', type: 'PS4', code: 'PS4-01', location: 'Zone B - Poste 01' },
    { name: 'PlayStation 4 - Station 2', type: 'PS4', code: 'PS4-02', location: 'Zone B - Poste 02' },

    // Xbox Series X (2 unités)
    { name: 'Xbox Series X - Station 1', type: 'XBOX_SERIES_X', code: 'XBOX-01', location: 'Zone C - Poste 01' },
    { name: 'Xbox Series X - Station 2', type: 'XBOX_SERIES_X', code: 'XBOX-02', location: 'Zone C - Poste 02' },

    // PC Gaming (5 unités)
    { name: 'PC Gaming - Station 1', type: 'PC_GAMING', code: 'PC-01', location: 'Zone D - Poste 01' },
    { name: 'PC Gaming - Station 2', type: 'PC_GAMING', code: 'PC-02', location: 'Zone D - Poste 02' },
    { name: 'PC Gaming - Station 3', type: 'PC_GAMING', code: 'PC-03', location: 'Zone D - Poste 03' },
    { name: 'PC Gaming - Station 4', type: 'PC_GAMING', code: 'PC-04', location: 'Zone D - Poste 04' },
    { name: 'PC Gaming - Station 5', type: 'PC_GAMING', code: 'PC-05', location: 'Zone D - Poste 05' },

    // Oculus VR (2 unités)
    { name: 'Oculus Quest 2 - Station 1', type: 'OCULUS_VR', code: 'VR-01', location: 'Zone E - Poste 01' },
    { name: 'Oculus Quest 2 - Station 2', type: 'OCULUS_VR', code: 'VR-02', location: 'Zone E - Poste 02' },

    // VR PS4 (1 unité)
    { name: 'PS4 VR - Station 1', type: 'VR_PS4', code: 'VR-PS4-01', location: 'Zone F - Poste 01' },

    // Simulateur Racing (2 unités)
    { name: 'Simulateur Racing - Station 1', type: 'SIMU_RACING', code: 'SIMU-01', location: 'Zone G - Cockpit 1' },
    { name: 'Simulateur Racing - Station 2', type: 'SIMU_RACING', code: 'SIMU-02', location: 'Zone G - Cockpit 2' },
  ]

  for (const eq of equipmentData) {
    const equipment = await prisma.equipment.upsert({
      where: { code: eq.code },
      update: {},
      create: {
        name: eq.name,
        type: eq.type,
        code: eq.code,
        location: eq.location,
        status: 'AVAILABLE',
        healthScore: 100,
      },
    })
    console.log(`✅ Equipment created: ${equipment.code}`)

    // Créer les tarifs pour chaque équipement
    const pricing = getPricingForEquipment(eq.type)
    for (const p of pricing) {
      await prisma.pricing.upsert({
        where: {
          id: `${eq.code}-${p.duration}-${p.isWeekend ? 'weekend' : 'weekday'}`,
        },
        update: {},
        create: {
          equipmentId: equipment.id,
          duration: p.duration,
          isWeekend: p.isWeekend,
          price: p.price,
          currency: 'XAF',
        },
      })
    }
    console.log(`   💰 Pricing created for ${equipment.code}`)
  }

  // 4. Créer des clients de test
  console.log('👥 Creating test customers...')

  await prisma.customer.upsert({
    where: { email: 'client.test@example.com' },
    update: {},
    create: {
      firstName: 'Jean',
      lastName: 'Test',
      email: 'client.test@example.com',
      phone: '+237 671 234 567',
      status: 'NEW',
      acceptCGV: true,
      cgvAcceptedAt: new Date(),
      createdById: admin.id,
    },
  })
  console.log('✅ Test customer created')

  console.log('✨ Seed completed successfully!')
  console.log('')
  console.log('📋 Test accounts:')
  console.log('   Admin: admin@ggc.cm / admin123')
  console.log('   Manager: manager@ggc.cm / manager123')
  console.log('   Cashier: caissiere@ggc.cm / cashier123')
  console.log('   Technician: technicien@ggc.cm / tech123')
  console.log('   Shareholder: actionnaire@ggc.cm / shareholder123')
}

/**
 * Retourne les tarifs pour un type d'équipement
 * Basé sur le cahier des charges GGC
 */
function getPricingForEquipment(type: string): Array<{ duration: number; isWeekend: boolean; price: number }> {
  const pricingMap: Record<string, any> = {
    PS5: [
      { duration: 60, isWeekend: false, price: 2000 },
      { duration: 60, isWeekend: true, price: 2500 },
    ],
    PS4: [
      { duration: 60, isWeekend: false, price: 1000 },
      { duration: 60, isWeekend: true, price: 1500 },
    ],
    XBOX_SERIES_X: [
      { duration: 60, isWeekend: false, price: 1500 },
      { duration: 60, isWeekend: true, price: 2000 },
    ],
    PC_GAMING: [
      { duration: 60, isWeekend: false, price: 1500 },
      { duration: 60, isWeekend: true, price: 2000 },
    ],
    OCULUS_VR: [
      { duration: 30, isWeekend: false, price: 1500 },
      { duration: 30, isWeekend: true, price: 2000 },
      { duration: 60, isWeekend: false, price: 2500 },
      { duration: 60, isWeekend: true, price: 3000 },
    ],
    VR_PS4: [
      { duration: 30, isWeekend: false, price: 1500 },
      { duration: 30, isWeekend: true, price: 2000 },
      { duration: 60, isWeekend: false, price: 2500 },
      { duration: 60, isWeekend: true, price: 3000 },
    ],
    SIMU_RACING: [
      { duration: 60, isWeekend: false, price: 2000 },
      { duration: 60, isWeekend: true, price: 2500 },
    ],
  }

  return pricingMap[type] || []
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
