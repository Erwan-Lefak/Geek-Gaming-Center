import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedEquipment() {
  console.log('🎮 Starting equipment seed...')

  // Simple equipment data without description
  const equipmentData = [
    { code: 'PS5-01', name: 'PlayStation 5', type: 'PS5' as const },
    { code: 'PS5-02', name: 'PlayStation 5', type: 'PS5' as const },
    { code: 'PS5-03', name: 'PlayStation 5', type: 'PS5' as const },
    { code: 'PS4-01', name: 'PlayStation 4', type: 'PS4' as const },
    { code: 'PS4-02', name: 'PlayStation 4', type: 'PS4' as const },
    { code: 'XBOX-01', name: 'Xbox Series X', type: 'XBOX_SERIES_X' as const },
    { code: 'XBOX-02', name: 'Xbox Series X', type: 'XBOX_SERIES_X' as const },
    { code: 'PC-01', name: 'PC Gamer', type: 'PC_GAMING' as const },
    { code: 'PC-02', name: 'PC Gamer', type: 'PC_GAMING' as const },
    { code: 'PC-03', name: 'PC Gamer', type: 'PC_GAMING' as const },
    { code: 'VR-OCU-01', name: 'Oculus Quest', type: 'OCULUS_VR' as const },
    { code: 'VR-PS4-01', name: 'VR PlayStation', type: 'VR_PS4' as const },
    { code: 'SIM-01', name: 'Simulateur Auto', type: 'SIMU_RACING' as const },
    { code: 'SIM-02', name: 'Simulateur Auto', type: 'SIMU_RACING' as const },
  ]

  let createdCount = 0
  for (const eq of equipmentData) {
    try {
      const existing = await prisma.equipment.findFirst({
        where: { code: eq.code },
      })

      if (!existing) {
        await prisma.equipment.create({
          data: {
            code: eq.code,
            name: eq.name,
            type: eq.type,
            status: 'AVAILABLE',
          },
        })

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
}

seedEquipment()
  .catch((error) => {
    console.error('Error seeding equipment:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
