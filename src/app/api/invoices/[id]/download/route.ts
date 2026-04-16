import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { requireAuth, hasRole } from '@/lib/auth/utils'
import jsPDF from 'jspdf'

// GET /api/invoices/[id]/download - Télécharger une facture en PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth()

    if (!hasRole(user, ['CASHIER', 'MANAGER', 'ADMIN', 'SHAREHOLDER'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const invoiceId = params.id

    // Récupérer la facture avec toutes les données
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: true,
        createdBy: {
          select: {
            name: true,
            role: true,
          },
        },
        session: {
          include: {
            equipment: true,
          },
        },
      },
    } as any)

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 })
    }

    // Générer le PDF
    const pdf = generateInvoicePDF(invoice)

    // Retourner le PDF
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Facture_${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error('Error downloading invoice:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateInvoicePDF(invoice: any): Buffer {
  // Créer un document PDF A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  // Couleurs
  const primaryColor = { r: 124, g: 58, b: 237 } // Purple
  const textColor = { r: 51, g: 51, b: 51 }

  // Fonction helper pour définir la couleur
  const setTextColor = (color: typeof textColor) => {
    doc.setTextColor(color.r, color.g, color.b)
  }

  // ===== HEADER =====
  // Fond de l'header
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(0, 0, pageWidth, 45, 'F')

  // Titre "FACTURE" en blanc
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURE', margin, 25)

  // Numéro de facture
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`N° ${invoice.invoiceNumber}`, pageWidth - margin, 25, { align: 'right' })

  // Date de facturation
  const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin, 33, { align: 'right' })

  yPosition = 55

  // ===== INFORMATIONS ENTREPRISE =====
  setTextColor(textColor)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Geek Gaming Center', margin, yPosition)
  yPosition += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Centre de Gaming et E-Sport', margin, yPosition)
  yPosition += 5
  doc.text('Douala, Cameroun', margin, yPosition)
  yPosition += 5
  doc.text('Tél: +237 XX XX XX XX XX', margin, yPosition)
  yPosition += 10

  // ===== INFORMATIONS CLIENT =====
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Facturé à:', margin, yPosition)
  yPosition += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const customerName = `${invoice.customer.firstName} ${invoice.customer.lastName}`
  doc.text(customerName, margin, yPosition)
  yPosition += 6
  doc.text(`Tél: ${invoice.customer.phone}`, margin, yPosition)
  if (invoice.customer.email) {
    yPosition += 5
    doc.text(`Email: ${invoice.customer.email}`, margin, yPosition)
  }

  // ===== TYPE DE FACTURE =====
  const typeLabels: Record<string, string> = {
    GAMING_SESSION: 'Session de Gaming',
    BOUTIQUE_SALE: 'Vente Boutique',
    RESERVATION: 'Réservation',
  }
  const invoiceType = typeLabels[invoice.type] || invoice.type

  doc.setFont('helvetica', 'bold')
  doc.text(invoiceType, pageWidth - margin, yPosition - 6, { align: 'right' })

  yPosition += 15

  // ===== TABLEAU DES ARTICLES =====
  // En-têtes du tableau
  const tableTop = yPosition
  const colWidths = {
    description: pageWidth - 2 * margin - 40 - 30 - 30,
    quantity: 30,
    unitPrice: 30,
    total: 40,
  }

  // Fond d'en-tête
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(margin, tableTop, pageWidth - 2 * margin, 10, 'F')

  // Texte des en-têtes
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', margin + 2, tableTop + 7)
  doc.text('Qté', margin + colWidths.description + 2, tableTop + 7)
  doc.text('Prix Unit.', margin + colWidths.description + colWidths.quantity + 2, tableTop + 7)
  doc.text('Total', margin + colWidths.description + colWidths.quantity + colWidths.unitPrice + 2, tableTop + 7)

  yPosition = tableTop + 10

  // Lignes du tableau
  doc.setTextColor(textColor.r, textColor.g, textColor.b)
  doc.setFont('helvetica', 'normal')

  invoice.items.forEach((item: any, index: number) => {
    // Alterner les couleurs de fond
    if (index % 2 === 0) {
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F')
    }

    // Tracer la ligne
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.1)
    doc.line(margin, yPosition + 10, pageWidth - margin, yPosition + 10)

    // Description
    doc.setFontSize(9)
    const description = item.description.length > 50
      ? item.description.substring(0, 47) + '...'
      : item.description
    doc.text(description, margin + 2, yPosition + 7)

    // Quantité
    doc.text(item.quantity.toString(), margin + colWidths.description + colWidths.quantity - 2, yPosition + 7, { align: 'right' })

    // Prix unitaire
    doc.text(`${item.unitPrice.toLocaleString('fr-FR')} F`, margin + colWidths.description + colWidths.quantity + colWidths.unitPrice - 2, yPosition + 7, { align: 'right' })

    // Total
    doc.setFont('helvetica', 'bold')
    doc.text(`${(item.quantity * item.unitPrice).toLocaleString('fr-FR')} F`, pageWidth - margin - 2, yPosition + 7, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    yPosition += 10
  })

  // Ligne de fin du tableau
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 15

  // ===== TOTAUX =====
  const rightColX = pageWidth - margin - 60
  const totalsWidth = 60

  // Sous-total
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Sous-total:', rightColX, yPosition)
  doc.text(`${invoice.subtotal.toLocaleString('fr-FR')} F`, pageWidth - margin - 2, yPosition, { align: 'right' })
  yPosition += 7

  // Remise
  if (invoice.discount > 0) {
    doc.text(`Remise (${invoice.discount}%):`, rightColX, yPosition)
    doc.text(`-${invoice.discount.toLocaleString('fr-FR')} F`, pageWidth - margin - 2, yPosition, { align: 'right' })
    yPosition += 7
  }

  // TVA
  doc.text(`TVA (${invoice.taxRate}%):`, rightColX, yPosition)
  doc.text(`${invoice.taxAmount.toLocaleString('fr-FR')} F`, pageWidth - margin - 2, yPosition, { align: 'right' })
  yPosition += 10

  // Total TTC
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(rightColX - 5, yPosition - 5, totalsWidth, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('TOTAL TTC:', rightColX, yPosition + 3)
  doc.text(`${invoice.total.toLocaleString('fr-FR')} F`, pageWidth - margin - 2, yPosition + 3, { align: 'right' })
  doc.setTextColor(textColor.r, textColor.g, textColor.b)

  yPosition += 20

  // ===== INFORMATIONS DE PAIEMENT =====
  if (yPosition > pageHeight - 60) {
    doc.addPage()
    yPosition = margin
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Informations de paiement:', margin, yPosition)
  yPosition += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Espèces',
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN Mobile Money',
    CARD: 'Carte bancaire',
    BANK_TRANSFER: 'Virement bancaire',
  }
  const paymentMethod = paymentMethodLabels[invoice.paymentMethod] || invoice.paymentMethod
  doc.text(`Méthode: ${paymentMethod}`, margin + 5, yPosition)
  yPosition += 6

  const statusLabels: Record<string, string> = {
    PAID: 'Payée',
    PENDING: 'En attente',
    PARTIALLY_PAID: 'Partiellement payée',
    CANCELLED: 'Annulée',
  }
  doc.text(`Statut: ${statusLabels[invoice.paymentStatus] || invoice.paymentStatus}`, margin + 5, yPosition)

  if (invoice.mobileMoneyPhone) {
    yPosition += 6
    doc.text(`Tél: ${invoice.mobileMoneyPhone}`, margin + 5, yPosition)
  }
  if (invoice.mobileMoneyRef) {
    yPosition += 6
    doc.text(`Réf: ${invoice.mobileMoneyRef}`, margin + 5, yPosition)
  }

  // ===== NOTES =====
  if (invoice.notes) {
    yPosition += 12
    doc.setFont('helvetica', 'bold')
    doc.text('Notes:', margin, yPosition)
    yPosition += 6
    doc.setFont('helvetica', 'normal')
    const splitNotes = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin)
    doc.text(splitNotes, margin, yPosition)
    yPosition += splitNotes.length * 5
  }

  // ===== PIED DE PAGE =====
  const footerY = pageHeight - 20

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY, pageWidth - margin, footerY)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(128, 128, 128)

  const footerText = [
    'Geek Gaming Center • Douala, Cameroun',
    'Merci de votre confiance !',
    `Facture générée le ${new Date().toLocaleDateString('fr-FR')}`,
  ]

  footerText.forEach((text, index) => {
    doc.text(text, pageWidth / 2, footerY + 6 + index * 4, { align: 'center' })
  })

  // Générer le buffer PDF
  return Buffer.from(doc.output('arraybuffer'))
}
