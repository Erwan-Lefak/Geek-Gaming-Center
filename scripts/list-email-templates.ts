import { prisma } from '../src/lib/prisma/client'

async function listEmailTemplates() {
  console.log('📧 Email Templates in Database')
  console.log('=================================\n')

  const templates = await prisma.mailTemplate.findMany({
    orderBy: { id: 'asc' }
  })

  console.log(`Total: ${templates.length} templates\n`)

  templates.forEach((template, index) => {
    console.log(`${index + 1}. ${template.mailType}`)
    console.log(`   Subject: ${template.mailSubject}`)
    console.log(`   Active: ${template.isActive ? '✅' : '❌'}`)
    console.log('')
  })

  await prisma.$disconnect()
}

listEmailTemplates()
