import { prisma } from '@/lib/prisma/client'
import { generateInvoiceHTML } from './generator'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { MailService } from '@/lib/email/mail-service'

interface InvoiceItem {
  productId?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface CreateInvoiceData {
  customerId: string
  createdById: string
  type: 'ORDER' | 'SESSION' | 'RESERVATION'
  items: InvoiceItem[]
  paymentMethod: string
  paymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID'
  notes?: string
  referenceId?: string // Order ID, Session ID, or Reservation ID
}

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')

  // Count invoices for this month
  const count = await prisma.invoice.count({
    where: {
      invoiceDate: {
        gte: new Date(currentYear, new Date().getMonth(), 1),
        lt: new Date(currentYear, new Date().getMonth() + 1, 1),
      },
    },
  })

  const sequentialNumber = String(count + 1).padStart(4, '0')
  return `FAC-${currentYear}${month}-${sequentialNumber}`
}

/**
 * Create invoice from order
 */
export async function createInvoiceFromOrder(order: any) {
  const invoiceNumber = await generateInvoiceNumber()
  const taxRate = 0 // Pas de TVA

  // Calculate totals
  const subtotal = parseFloat(order.totalAmount.toString())
  const taxAmount = 0
  const total = subtotal // Total HT = Subtotal (pas de TVA)

  // Prepare items
  const items = order.items.map((item: any) => ({
    productId: item.productId,
    description: item.productName,
    quantity: item.quantity,
    unitPrice: parseFloat(item.unitPrice.toString()),
    totalPrice: parseFloat(item.totalPrice.toString()),
  }))

  // Find a system user
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: order.customerId,
      createdById: systemUser?.id || 'system',
      type: 'BOUTIQUE_SALE',
      subtotal,
      taxRate,
      taxAmount,
      total,
      paymentMethod: order.paymentMethod || 'CARD',
      paymentStatus: 'PAID',
      paidAt: new Date(),
      items: {
        create: items,
      },
    },
    include: {
      items: true,
      customer: true,
    },
  })

  // Generate HTML invoice
  const html = generateInvoiceHTML({
    invoiceNumber,
    invoiceDate: invoice.invoiceDate!,
    dueDate: invoice.invoiceDate!,
    type: 'ORDER',
    customer: {
      name: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      email: invoice.customer.email || '',
      phone: invoice.customer.phone,
    },
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paymentMethod: order.paymentMethod || 'CARD',
    paymentStatus: 'PAID',
  })

  // Save HTML file
  const invoicesDir = path.join(process.cwd(), 'public/invoices')
  await mkdir(invoicesDir, { recursive: true })
  await writeFile(path.join(invoicesDir, `${invoiceNumber}.html`), html)

  // Link order to invoice if needed
  // (You may want to add invoiceId to the Order model)

  return invoice
}

/**
 * Create invoice from gaming session
 */
export async function createInvoiceFromSession(session: any, paymentMethod: string) {
  const invoiceNumber = await generateInvoiceNumber()
  const taxRate = 0 // Pas de TVA

  // Calculate totals
  const subtotal = parseFloat(session.price.toString())
  const taxAmount = 0
  const total = subtotal

  // Prepare item
  const itemDescription = `Session de gaming - ${session.equipment.type} (${session.equipment.name})`
  const items: InvoiceItem[] = [
    {
      description: itemDescription,
      quantity: 1,
      unitPrice: subtotal,
      totalPrice: subtotal,
    },
  ]

  // Find a system user
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: session.customerId,
      createdById: systemUser?.id || 'system',
      type: 'GAMING_SESSION',
      subtotal,
      taxRate,
      taxAmount,
      total,
      paymentMethod: paymentMethod as any,
      paymentStatus: session.paidAt ? 'PAID' : 'PENDING',
      paidAt: session.paidAt || undefined,
      items: {
        create: items,
      },
    },
    include: {
      items: true,
      customer: true,
    },
  })

  // Generate HTML invoice
  const html = generateInvoiceHTML({
    invoiceNumber,
    invoiceDate: invoice.invoiceDate!,
    dueDate: invoice.invoiceDate!,
    type: 'SESSION',
    customer: {
      name: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      email: invoice.customer.email || '',
      phone: invoice.customer.phone,
    },
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paymentMethod,
    paymentStatus: invoice.paymentStatus,
    notes: `Session N° ${session.sessionNumber}`,
  })

  // Save HTML file
  const invoicesDir = path.join(process.cwd(), 'public/invoices')
  await mkdir(invoicesDir, { recursive: true })
  await writeFile(path.join(invoicesDir, `${invoiceNumber}.html`), html)

  // Update session with invoice ID
  await prisma.gamingSession.update({
    where: { id: session.id },
    data: { invoiceId: invoice.id },
  })

  return invoice
}

/**
 * Create invoice from reservation
 */
export async function createInvoiceFromReservation(reservation: any, paymentMethod: string, isDeposit: boolean = false) {
  const invoiceNumber = await generateInvoiceNumber()
  const taxRate = 0 // Pas de TVA

  // Calculate totals (deposit or full amount)
  const amount = isDeposit
    ? parseFloat(reservation.depositAmount.toString())
    : parseFloat(reservation.estimatedPrice.toString())

  const subtotal = amount
  const taxAmount = 0
  const total = subtotal

  // Prepare item
  const itemDescription = isDeposit
    ? `Acompte réservation - ${reservation.equipment?.type || 'Équipement'}`
    : `Réservation session - ${reservation.equipment?.type || 'Équipement'}`

  const items: InvoiceItem[] = [
    {
      description: itemDescription,
      quantity: 1,
      unitPrice: subtotal,
      totalPrice: subtotal,
    },
  ]

  // Find a system user
  const systemUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true },
  })

  // Create invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      customerId: reservation.customerId,
      createdById: systemUser?.id || 'system',
      type: 'RESERVATION',
      subtotal,
      taxRate,
      taxAmount,
      total,
      paymentMethod: paymentMethod as any,
      paymentStatus: isDeposit ? 'PAID' : 'PENDING',
      paidAt: isDeposit ? new Date() : undefined,
      items: {
        create: items,
      },
    },
    include: {
      items: true,
      customer: true,
    },
  })

  // Generate HTML invoice
  const html = generateInvoiceHTML({
    invoiceNumber,
    invoiceDate: invoice.invoiceDate!,
    dueDate: new Date(reservation.startTime),
    type: 'RESERVATION',
    customer: {
      name: `${invoice.customer.firstName} ${invoice.customer.lastName}`,
      email: invoice.customer.email || '',
      phone: invoice.customer.phone,
    },
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paymentMethod,
    paymentStatus: invoice.paymentStatus,
    notes: `Réservation N° ${reservation.reservationNumber}${isDeposit ? ' (Acompte)' : ''}`,
  })

  // Save HTML file
  const invoicesDir = path.join(process.cwd(), 'public/invoices')
  await mkdir(invoicesDir, { recursive: true })
  await writeFile(path.join(invoicesDir, `${invoiceNumber}.html`), html)

  return invoice
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(invoiceId: string) {
  return await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      items: true,
      customer: true,
    },
  })
}

/**
 * Get invoice by number
 */
export async function getInvoiceByNumber(invoiceNumber: string) {
  return await prisma.invoice.findUnique({
    where: { invoiceNumber },
    include: {
      items: true,
      customer: true,
    },
  })
}

/**
 * Get customer invoices
 */
export async function getCustomerInvoices(customerId: string) {
  return await prisma.invoice.findMany({
    where: { customerId },
    include: {
      items: true,
    },
    orderBy: {
      invoiceDate: 'desc',
    },
  })
}

/**
 * Send invoice email to customer
 */
export async function sendInvoiceEmail(invoiceId: string) {
  const invoice = await getInvoiceById(invoiceId)

  if (!invoice || !invoice.customer.email) {
    throw new Error('Invoice not found or customer has no email')
  }

  // Format amounts
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  const totalAmount = formatPrice(parseFloat(invoice.total.toString()))

  // Get payment method label
  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Espèces',
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN Mobile Money',
    CARD: 'Carte bancaire',
    BANK_TRANSFER: 'Virement bancaire',
  }

  const paymentMethod = paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod

  // Get payment status label
  const statusLabels: Record<string, string> = {
    PAID: 'Payé',
    PENDING: 'En attente',
    PARTIALLY_PAID: 'Partiellement payé',
  }

  const paymentStatus = statusLabels[invoice.paymentStatus] || invoice.paymentStatus

  // Format date
  const invoiceDate = invoice.invoiceDate?.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Get mail template
  const template = await prisma.mailTemplate.findUnique({
    where: { mailType: 'invoice_generated' },
  })

  if (!template) {
    throw new Error('Invoice email template not found')
  }

  // Prepare email content
  const customerName = `${invoice.customer.firstName} ${invoice.customer.lastName}`
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invoices/${invoice.invoiceNumber}.html`

  let mailBody = template.mailBody
    .replace(/{customer_name}/g, customerName)
    .replace(/{invoice_number}/g, invoice.invoiceNumber)
    .replace(/{invoice_date}/g, invoiceDate || '')
    .replace(/{total_amount}/g, totalAmount)
    .replace(/{payment_method}/g, paymentMethod)
    .replace(/{payment_status}/g, paymentStatus)
    .replace(/{invoice_url}/g, invoiceUrl)

  // Send email using MailService
  await MailService.sendEmail({
    to: invoice.customer.email,
    subject: template.mailSubject,
    data: {
      html: mailBody,
    },
  })

  console.log('✅ [INVOICE] Email sent to', invoice.customer.email, 'for invoice', invoice.invoiceNumber)

  return invoice
}
