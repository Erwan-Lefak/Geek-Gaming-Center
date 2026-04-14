// Test script pour créer un client directement
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    const customer = await prisma.customer.create({
      data: {
        firstName: 'Test',
        lastName: 'Direct',
        email: 'test@direct.com',
        phone: '612345678',
        acceptCGV: true,
        cgvAcceptedAt: new Date(),
        createdById: 'admin-id', // Vous devrez remplacer ceci
        status: 'NEW',
      },
    })
    console.log('✅ Client créé:', customer)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error('Détails:', error.meta)
  } finally {
    await prisma.$disconnect()
  }
}

test()
