import { prisma } from '../lib/prisma/client'
import { generateInvoiceHTML } from '../lib/invoices/generator'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

async function generateTestInvoice() {
  // Order ID from database
  const orderId = 'cmo1czvha0002fk37thsmg64t'

  // Get order with items and customer
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  })

  if (!order) {
    console.error('Order not found')
    return
  }

  // Get customer
  const customer = await prisma.customer.findUnique({
    where: { id: order.customerId },
  })

  if (!customer) {
    console.error('Customer not found')
    return
  }

  // Invoice data
  const invoiceNumber = 'FAC-202604-0001'
  const invoiceDate = new Date('2026-04-16')
  const dueDate = new Date('2026-04-16')
  const taxRate = 0 // Pas de TVA

  // Calculer le total à partir des items (plus fiable)
  const subtotal = order.items.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.totalPrice.toString())
  }, 0)

  const taxAmount = 0
  const total = subtotal // Total HT = Subtotal

  const items = order.items.map(item => ({
    productId: item.productId,
    description: item.productName,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice.toString()),
    totalPrice: parseFloat(item.totalPrice.toString()),
  }))

  // Generate HTML
  const html = generateInvoiceHTML({
    invoiceNumber,
    invoiceDate,
    dueDate,
    type: 'ORDER',
    customer: {
      name: `${customer.firstName} ${customer.lastName}`,
      email: customer.email || '',
      phone: customer.phone,
      address: customer.address,
    },
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paymentMethod: order.paymentMethod || 'CARD',
    paymentStatus: 'PAID',
    notes: `Commande N° ${order.orderNumber}`,
  })

  // Save to file
  const invoicesDir = path.join(process.cwd(), 'public/invoices')
  await mkdir(invoicesDir, { recursive: true })
  const filePath = path.join(invoicesDir, `${invoiceNumber}.html`)
  await writeFile(filePath, html)

  console.log(`✅ Facture générée: ${filePath}`)
  console.log(`📊 Montant TTC: ${total} FCFA`)
}

generateTestInvoice()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
