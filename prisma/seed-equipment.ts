import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEquipment() {
  console.log('🎮 Starting equipment seed...')

  // Get default user
  const defaultUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!defaultUser) {
    console.error('❌ No admin user found')
    return
  }

  // Define equipment with their pricing
  const equipmentData = [
    {
      code: 'PS5-01',
      name: 'PlayStation 5',
      type: 'PS5' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console PS5 avec manette DualSense',
      pricing: [
        { duration: 30, price: 1000, isWeekend: false },
        { duration: 30, price: 1500, isWeekend: true },
        { duration: 60, price: 2000, isWeekend: false },
        { duration: 60, price: 2500, isWeekend: true },
        { duration: 120, price: 3500, isWeekend: false },
        { duration: 120, price: 4500, isWeekend: true },
        { duration: 180, price: 5000, isWeekend: false },
        { duration: 180, price: 6000, isWeekend: true },
      ],
    },
    {
      code: 'PS5-02',
      name: 'PlayStation 5',
      type: 'PS5' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console PS5 avec manette DualSense',
      pricing: [
        { duration: 30, price: 1000, isWeekend: false },
        { duration: 30, price: 1500, isWeekend: true },
        { duration: 60, price: 2000, isWeekend: false },
        { duration: 60, price: 2500, isWeekend: true },
        { duration: 120, price: 3500, isWeekend: false },
        { duration: 120, price: 4500, isWeekend: true },
        { duration: 180, price: 5000, isWeekend: false },
        { duration: 180, price: 6000, isWeekend: true },
      ],
    },
    {
      code: 'PS5-03',
      name: 'PlayStation 5',
      type: 'PS5' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console PS5 avec manette DualSense',
      pricing: [
        { duration: 30, price: 1000, isWeekend: false },
        { duration: 30, price: 1500, isWeekend: true },
        { duration: 60, price: 2000, isWeekend: false },
        { duration: 60, price: 2500, isWeekend: true },
        { duration: 120, price: 3500, isWeekend: false },
        { duration: 120, price: 4500, isWeekend: true },
        { duration: 180, price: 5000, isWeekend: false },
        { duration: 180, price: 6000, isWeekend: true },
      ],
    },
    {
      code: 'PS4-01',
      name: 'PlayStation 4',
      type: 'PS4' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console PS4 Pro avec manette',
      pricing: [
        { duration: 30, price: 500, isWeekend: false },
        { duration: 30, price: 750, isWeekend: true },
        { duration: 60, price: 1000, isWeekend: false },
        { duration: 60, price: 1500, isWeekend: true },
        { duration: 120, price: 2000, isWeekend: false },
        { duration: 120, price: 2500, isWeekend: true },
        { duration: 180, price: 3000, isWeekend: false },
        { duration: 180, price: 3500, isWeekend: true },
      ],
    },
    {
      code: 'PS4-02',
      name: 'PlayStation 4',
      type: 'PS4' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console PS4 Pro avec manette',
      pricing: [
        { duration: 30, price: 500, isWeekend: false },
        { duration: 30, price: 750, isWeekend: true },
        { duration: 60, price: 1000, isWeekend: false },
        { duration: 60, price: 1500, isWeekend: true },
        { duration: 120, price: 2000, isWeekend: false },
        { duration: 120, price: 2500, isWeekend: true },
        { duration: 180, price: 3000, isWeekend: false },
        { duration: 180, price: 3500, isWeekend: true },
      ],
    },
    {
      code: 'XBOX-01',
      name: 'Xbox Series X',
      type: 'XBOX_SERIES_X' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console Xbox Series X avec manette',
      pricing: [
        { duration: 30, price: 750, isWeekend: false },
        { duration: 30, price: 1000, isWeekend: true },
        { duration: 60, price: 1500, isWeekend: false },
        { duration: 60, price: 2000, isWeekend: true },
        { duration: 120, price: 2500, isWeekend: false },
        { duration: 120, price: 3500, isWeekend: true },
        { duration: 180, price: 3500, isWeekend: false },
        { duration: 180, price: 4500, isWeekend: true },
      ],
    },
    {
      code: 'XBOX-02',
      name: 'Xbox Series X',
      type: 'XBOX_SERIES_X' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Console Xbox Series X avec manette',
      pricing: [
        { duration: 30, price: 750, isWeekend: false },
        { duration: 30, price: 1000, isWeekend: true },
        { duration: 60, price: 1500, isWeekend: false },
        { duration: 60, price: 2000, isWeekend: true },
        { duration: 120, price: 2500, isWeekend: false },
        { duration: 120, price: 3500, isWeekend: true },
        { duration: 180, price: 3500, isWeekend: false },
        { duration: 180, price: 4500, isWeekend: true },
      ],
    },
    {
      code: 'PC-01',
      name: 'PC Gamer',
      type: 'PC_GAMING' as const,
      status: 'AVAILABLE' as const,
      specifications: 'PC Gamer haute performance',
      pricing: [
        { duration: 30, price: 750, isWeekend: false },
        { duration: 30, price: 1000, isWeekend: true },
        { duration: 60, price: 1500, isWeekend: false },
        { duration: 60, price: 2000, isWeekend: true },
        { duration: 120, price: 2500, isWeekend: false },
        { duration: 120, price: 3500, isWeekend: true },
        { duration: 180, price: 3500, isWeekend: false },
        { duration: 180, price: 4500, isWeekend: true },
      ],
    },
    {
      code: 'PC-02',
      name: 'PC Gamer',
      type: 'PC_GAMING' as const,
      status: 'AVAILABLE' as const,
      specifications: 'PC Gamer haute performance',
      pricing: [
        { duration: 30, price: 750, isWeekend: false },
        { duration: 30, price: 1000, isWeekend: true },
        { duration: 60, price: 1500, isWeekend: false },
        { duration: 60, price: 2000, isWeekend: true },
        { duration: 120, price: 2500, isWeekend: false },
        { duration: 120, price: 3500, isWeekend: true },
        { duration: 180, price: 3500, isWeekend: false },
        { duration: 180, price: 4500, isWeekend: true },
      ],
    },
    {
      code: 'PC-03',
      name: 'PC Gamer',
      type: 'PC_GAMING' as const,
      status: 'AVAILABLE' as const,
      specifications: 'PC Gamer haute performance',
      pricing: [
        { duration: 30, price: 750, isWeekend: false },
        { duration: 30, price: 1000, isWeekend: true },
        { duration: 60, price: 1500, isWeekend: false },
        { duration: 60, price: 2000, isWeekend: true },
        { duration: 120, price: 2500, isWeekend: false },
        { duration: 120, price: 3500, isWeekend: true },
        { duration: 180, price: 3500, isWeekend: false },
        { duration: 180, price: 4500, isWeekend: true },
      ],
    },
    {
      code: 'VR-OCU-01',
      name: 'Oculus Quest',
      type: 'OCULUS_VR' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Casque VR Oculus Quest',
      pricing: [
        { duration: 30, price: 1250, isWeekend: false },
        { duration: 30, price: 1750, isWeekend: true },
        { duration: 60, price: 2500, isWeekend: false },
        { duration: 60, price: 3000, isWeekend: true },
        { duration: 120, price: 4500, isWeekend: false },
        { duration: 120, price: 5500, isWeekend: true },
      ],
    },
    {
      code: 'VR-PS4-01',
      name: 'VR PlayStation',
      type: 'VR_PS4' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Casque VR PlayStation PS4',
      pricing: [
        { duration: 30, price: 1250, isWeekend: false },
        { duration: 30, price: 1750, isWeekend: true },
        { duration: 60, price: 2500, isWeekend: false },
        { duration: 60, price: 3000, isWeekend: true },
        { duration: 120, price: 4500, isWeekend: false },
        { duration: 120, price: 5500, isWeekend: true },
      ],
    },
    {
      code: 'SIM-01',
      name: 'Simulateur Auto',
      type: 'SIMU_RACING' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Simulateur de course automobile',
      pricing: [
        { duration: 30, price: 1000, isWeekend: false },
        { duration: 30, price: 1500, isWeekend: true },
        { duration: 60, price: 2000, isWeekend: false },
        { duration: 60, price: 2500, isWeekend: true },
        { duration: 120, price: 3500, isWeekend: false },
        { duration: 120, price: 4500, isWeekend: true },
        { duration: 180, price: 5000, isWeekend: false },
        { duration: 180, price: 6000, isWeekend: true },
      ],
    },
    {
      code: 'SIM-02',
      name: 'Simulateur Auto',
      type: 'SIMU_RACING' as const,
      status: 'AVAILABLE' as const,
      specifications: 'Simulateur de course automobile',
      pricing: [
        { duration: 30, price: 1000, isWeekend: false },
        { duration: 30, price: 1500, isWeekend: true },
        { duration: 60, price: 2000, isWeekend: false },
        { duration: 60, price: 2500, isWeekend: true },
        { duration: 120, price: 3500, isWeekend: false },
        { duration: 120, price: 4500, isWeekend: true },
        { duration: 180, price: 5000, isWeekend: false },
        { duration: 180, price: 6000, isWeekend: true },
      ],
    },
  ]

  // Create equipment and pricing
  let createdCount = 0
  for (const eq of equipmentData) {
    try {
      // Check if equipment already exists
      const existing = await prisma.equipment.findFirst({
        where: { code: eq.code },
      })

      if (!existing) {
        // Create equipment
        const equipment = await prisma.equipment.create({
          data: {
            code: eq.code,
            name: eq.name,
            type: eq.type,
            status: eq.status,
          },
        })

        // Create pricing
        for (const price of eq.pricing) {
          await prisma.equipmentPricing.create({
            data: {
              equipmentId: equipment.id,
              duration: price.duration,
              price: price.price,
              isWeekend: price.isWeekend,
            },
          })
        }

        createdCount++
        console.log(`✅ Created: ${eq.code} - ${eq.name}`)
      } else {
        console.log(`⏭️  Skipped: ${eq.code} - ${eq.name} (already exists)`)
      }
    } catch (error) {
      console.error(`❌ Error creating ${eq.code}:`, error)
    }
  }

  console.log(`\n✅ Equipment seed complete! Created ${createdCount} equipment(s)`)

  // Display summary
  const totalEquipment = await prisma.equipment.count()
  const totalPricing = await prisma.equipmentPricing.count()
  console.log(`\n📊 Database summary:`)
  console.log(`   Total equipment: ${totalEquipment}`)
  console.log(`   Total pricing entries: ${totalPricing}`)
}

seedEquipment()
  .catch((error) => {
    console.error('Error seeding equipment:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
