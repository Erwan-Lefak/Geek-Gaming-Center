/**
 * Utilitaires pour la facturation GGC
 * TVA Cameroun: 19.25%
 * Numérotation séquentielle conforme aux normes fiscales
 */

export const TVA_RATE = 19.25

/**
 * Génère un numéro de facture séquentiel
 * Format: FAC-YYYY-MM-XXXXX
 */
export async function generateInvoiceNumber(prisma: any): Promise<string> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `FAC-${year}-${month}`

  // Compter les factures du mois
  const startOfMonth = new Date(year, now.getMonth(), 1)
  const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59)

  const count = await prisma.invoice.count({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
      invoiceDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  })

  const sequence = String(count + 1).padStart(5, '0')
  return `${prefix}-${sequence}`
}

/**
 * Calcule les montants TVA incluse
 */
export function calculateTaxAmounts(subtotal: number, taxRate: number = TVA_RATE) {
  const taxAmount = (subtotal * taxRate) / 100
  const total = subtotal + taxAmount

  return {
    subtotal,
    taxRate,
    taxAmount,
    total,
  }
}

/**
 * Formate un montant en FCFA
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Génère le contenu d'une facture pour affichage/PDF
 */
export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  customer: {
    name: string
    address?: string
    phone: string
    email?: string
  }
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  paymentMethod: string
  paymentStatus: string
}

export function formatInvoiceForPrint(data: InvoiceData): string {
  const lines: string[] = []

  lines.push('='.repeat(50))
  lines.push('GEEK GAMING CENTER')
  lines.push('Yaoundé, Cameroun')
  lines.push('='.repeat(50))
  lines.push('')
  lines.push(`FACTURE N° ${data.invoiceNumber}`)
  lines.push(`Date: ${new Date(data.invoiceDate).toLocaleDateString('fr-FR')}`)
  lines.push('')
  lines.push('-'.repeat(50))
  lines.push('CLIENT')
  lines.push('-'.repeat(50))
  lines.push(`Nom: ${data.customer.name}`)
  if (data.customer.address) lines.push(`Adresse: ${data.customer.address}`)
  lines.push(`Tél: ${data.customer.phone}`)
  if (data.customer.email) lines.push(`Email: ${data.customer.email}`)
  lines.push('')
  lines.push('-'.repeat(50))
  lines.push('DÉTAILS DE LA FACTURE')
  lines.push('-'.repeat(50))
  lines.push('')

  data.items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.description}`)
    lines.push(`   ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.totalPrice)}`)
    lines.push('')
  })

  lines.push('-'.repeat(50))
  lines.push(`Sous-total: ${formatCurrency(data.subtotal)}`)
  lines.push(`TVA (${data.taxRate}%): ${formatCurrency(data.taxAmount)}`)
  lines.push(`TOTAL: ${formatCurrency(data.total)}`)
  lines.push('-'.repeat(50))
  lines.push('')
  lines.push(`Mode de paiement: ${data.paymentMethod}`)
  lines.push(`Statut: ${data.paymentStatus}`)
  lines.push('')
  lines.push('='.repeat(50))
  lines.push('Merci de votre visite !')
  lines.push('='.repeat(50))

  return lines.join('\n')
}

/**
 * Validation Mobile Money Cameroon
 */
export interface MobileMoneyPayment {
  provider: 'ORANGE' | 'MTN'
  phoneNumber: string
  amount: number
  reference?: string
}

export function validateMobilePhoneNumber(phone: string, provider: 'ORANGE' | 'MTN'): boolean {
  // Numéros camerounais: +237 ou 237 suivi de 6XXXXXXXX
  const cameroonPhoneRegex = /^(\+237|237)?[6][0-9]{8}$/

  if (!cameroonPhoneRegex.test(phone)) {
    return false
  }

  // Prefixes spécifiques par opérateur
  const orangePrefixes = ['69', '68', '66']
  const mtnPrefixes = ['67', '65', '64', '63']

  const normalizedPhone = phone.replace(/\+237|^237/, '')
  const prefix = normalizedPhone.substring(0, 2)

  if (provider === 'ORANGE') {
    return orangePrefixes.includes(prefix)
  } else {
    return mtnPrefixes.includes(prefix)
  }
}

/**
 * Formater un numéro de téléphone camerounais
 */
export function formatCameroonPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, '')

  if (normalized.startsWith('237')) {
    return `+237 ${normalized.substring(3, 5)} ${normalized.substring(5, 7)} ${normalized.substring(7, 9)} ${normalized.substring(9)}`
  } else if (normalized.startsWith('6')) {
    return `+237 ${normalized.substring(0, 2)} ${normalized.substring(2, 4)} ${normalized.substring(4, 6)} ${normalized.substring(6, 8)} ${normalized.substring(8)}`
  }

  return phone
}
