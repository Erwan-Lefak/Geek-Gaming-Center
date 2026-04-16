import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPricing() {
  console.log('💰 Starting pricing seed...')

  // Get all equipment
  const equipment = await prisma.equipment.findMany()

  console.log(`Found ${equipment.length} equipment`)

  // Pricing data per equipment type
  const pricingByType: Record<string, any[]> = {
    'PS5': [
      { duration: 30, price: 1000, isWeekend: false },
      { duration: 30, price: 1500, isWeekend: true },
      { duration: 60, price: 2000, isWeekend: false },
      { duration: 60, price: 2500, isWeekend: true },
      { duration: 120, price: 3500, isWeekend: false },
      { duration: 120, price: 4500, isWeekend: true },
      { duration: 180, price: 5000, isWeekend: false },
      { duration: 180, price: 6000, isWeekend: true },
    ],
    'PS4': [
      { duration: 30, price: 500, isWeekend: false },
      { duration: 30, price: 750, isWeekend: true },
      { duration: 60, price: 1000, isWeekend: false },
      { duration: 60, price: 1500, isWeekend: true },
      { duration: 120, price: 2000, isWeekend: false },
      { duration: 120, price: 2500, isWeekend: true },
      { duration: 180, price: 3000, isWeekend: false },
      { duration: 180, price: 3500, isWeekend: true },
    ],
    'XBOX_SERIES_X': [
      { duration: 30, price: 750, isWeekend: false },
      { duration: 30, price: 1000, isWeekend: true },
      { duration: 60, price: 1500, isWeekend: false },
      { duration: 60, price: 2000, isWeekend: true },
      { duration: 120, price: 2500, isWeekend: false },
      { duration: 120, price: 3500, isWeekend: true },
      { duration: 180, price: 3500, isWeekend: false },
      { duration: 180, price: 4500, isWeekend: true },
    ],
    'PC_GAMING': [
      { duration: 30, price: 750, isWeekend: false },
      { duration: 30, price: 1000, isWeekend: true },
      { duration: 60, price: 1500, isWeekend: false },
      { duration: 60, price: 2000, isWeekend: true },
      { duration: 120, price: 2500, isWeekend: false },
      { duration: 120, price: 3500, isWeekend: true },
      { duration: 180, price: 3500, isWeekend: false },
      { duration: 180, price: 4500, isWeekend: true },
    ],
    'OCULUS_VR': [
      { duration: 30, price: 1250, isWeekend: false },
      { duration: 30, price: 1750, isWeekend: true },
      { duration: 60, price: 2500, isWeekend: false },
      { duration: 60, price: 3000, isWeekend: true },
      { duration: 120, price: 4500, isWeekend: false },
      { duration: 120, price: 5500, isWeekend: true },
    ],
    'VR_PS4': [
      { duration: 30, price: 1250, isWeekend: false },
      { duration: 30, price: 1750, isWeekend: true },
      { duration: 60, price: 2500, isWeekend: false },
      { duration: 60, price: 3000, isWeekend: true },
      { duration: 120, price: 4500, isWeekend: false },
      { duration: 120, price: 5500, isWeekend: true },
    ],
    'SIMU_RACING': [
      { duration: 30, price: 1000, isWeekend: false },
      { duration: 30, price: 1500, isWeekend: true },
      { duration: 60, price: 2000, isWeekend: false },
      { duration: 60, price: 2500, isWeekend: true },
      { duration: 120, price: 3500, isWeekend: false },
      { duration: 120, price: 4500, isWeekend: true },
      { duration: 180, price: 5000, isWeekend: false },
      { duration: 180, price: 6000, isWeekend: true },
    ],
  }

  let createdCount = 0
  for (const eq of equipment) {
    const pricingList = pricingByType[eq.type]

    if (!pricingList) {
      console.log(`⚠️  No pricing found for type: ${eq.type}`)
      continue
    }

    try {
      for (const price of pricingList) {
        await prisma.pricing.create({
          data: {
            equipmentId: eq.id,
            duration: price.duration,
            price: price.price,
            isWeekend: price.isWeekend,
          },
        })
      }

      createdCount++
      console.log(`✅ Added pricing for: ${eq.code} - ${eq.name}`)
    } catch (error) {
      console.error(`❌ Error adding pricing for ${eq.code}:`, error)
    }
  }

  console.log(`\n✅ Pricing seed complete! Added pricing for ${createdCount} equipment(s)`)
}

seedPricing()
  .catch((error) => {
    console.error('Error seeding pricing:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
