import { prisma } from '../src/lib/prisma/client'

async function deleteTestCustomer() {
  const email = 'erwan.lefak@gmail.com'

  console.log(`🗑️  Deleting test customer: ${email}`)

  try {
    const deleted = await prisma.customer.deleteMany({
      where: { email }
    })

    if (deleted.count > 0) {
      console.log(`✅ Deleted ${deleted.count} test account(s)`)
    } else {
      console.log('ℹ️  No test account found')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteTestCustomer()
