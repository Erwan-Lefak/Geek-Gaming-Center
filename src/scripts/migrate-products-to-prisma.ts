import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateProducts() {
  try {
    // Read the JSON file
    const jsonPath = join(process.cwd(), 'backend/data/products.json')
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'))

    console.log(`Found ${jsonData.products.length} products in JSON file`)

    let migrated = 0
    let skipped = 0
    let errors = 0

    for (const product of jsonData.products) {
      try {
        // Check if product already exists
        const existing = await prisma.product.findUnique({
          where: { id: product.id }
        })

        if (existing) {
          console.log(`⏭️  Skipping existing product: ${product.name}`)
          skipped++
          continue
        }

        // Transform JSON product to Prisma format
        await prisma.product.create({
          data: {
            id: product.id,
            name: product.name,
            description: product.description || null,
            category: product.category || 'divers',
            subcategory: product.subcategory || null,
            brand: product.brand || null,
            sku: product.sku || null,
            costPrice: product.costPrice || product.price || 0,
            sellingPrice: product.sellingPrice || product.price || 0,
            currency: 'XAF',
            currentStock: product.currentStock || product.stock || 0,
            minStock: product.minStock || 5,
            maxStock: product.maxStock || 50,
            reorderPoint: product.reorderPoint || 10,
            images: product.images || (product.image ? [product.image] : []),
            thumbnail: product.thumbnail || product.image || null,
            isActive: product.isActive !== undefined ? product.isActive : true,
            isFeatured: product.featured || false,
            specifications: product.specifications || null,
            createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
            updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          }
        })

        console.log(`✅ Migrated: ${product.name}`)
        migrated++
      } catch (error: any) {
        console.error(`❌ Error migrating ${product.name}:`, error.message)
        errors++
      }
    }

    console.log('\n=== Migration Summary ===')
    console.log(`✅ Migrated: ${migrated}`)
    console.log(`⏭️  Skipped (already exists): ${skipped}`)
    console.log(`❌ Errors: ${errors}`)
    console.log(`📦 Total processed: ${jsonData.products.length}`)

  } catch (error) {
    console.error('Fatal error during migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateProducts()
  .then(() => {
    console.log('\n✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })
