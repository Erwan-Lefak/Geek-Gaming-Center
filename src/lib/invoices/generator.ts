import { prisma } from '@/lib/prisma/client'

interface InvoiceData {
  invoiceNumber: string
  invoiceDate: Date
  dueDate: Date
  type: 'ORDER' | 'SESSION' | 'RESERVATION'
  customer: {
    name: string
    email: string
    phone?: string
    address?: string
  }
  items: Array<{
    designation: string
    description?: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  paymentMethod: string
  paymentStatus: string
  notes?: string
  company?: {
    name: string
    siret?: string
    address: string
    email: string
    phone: string
    website?: string
  }
}

/**
 * Generate professional HTML invoice inspired by Karma Pilates design
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const {
    invoiceNumber,
    invoiceDate,
    dueDate,
    type,
    customer,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    paymentMethod,
    paymentStatus,
    notes,
    company,
  } = data

  // Format date in French
  const formatDate = (date: Date | string | any) => {
    let d: Date
    if (typeof date === 'string') {
      d = new Date(date)
    } else if (date instanceof Date) {
      d = date
    } else {
      // Prisma Date or other format
      d = new Date(date.toString())
    }

    if (isNaN(d.getTime())) {
      return 'Date invalide'
    }

    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Format price in FCFA
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  // Company info (default)
  const geekGamingCenter = {
    name: 'Geek Gaming Center',
    siret: 'À déterminer',
    address: 'Yaoundé, Cameroun',
    email: 'support@geekgamingcenter.com',
    phone: '+237 6 79 70 22 98',
    website: 'geek-gaming-center.com',
  }

  const finalCompany = company || geekGamingCenter

  // Get type labels
  const typeLabels = {
    ORDER: 'Commande en ligne',
    SESSION: 'Session de Gaming',
    RESERVATION: 'Réservation',
  }

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Espèces',
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN Mobile Money',
    CARD: 'Carte bancaire',
    BANK_TRANSFER: 'Virement bancaire',
    STRIPE: 'Paiement en ligne (Stripe)',
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; color: string }> = {
      PAID: { text: 'PAYÉ', color: '#10b981' },
      PENDING: { text: 'EN ATTENTE', color: '#f59e0b' },
      PARTIALLY_PAID: { text: 'PARTIELLEMENT PAYÉ', color: '#3b82f6' },
    }
    const badge = badges[status] || badges.PENDING
    return `<span style="background-color: ${badge.color}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 7pt;">${badge.text}</span>`
  }

  // Generate items rows
  const itemsRows = items.map((item, index) => `
    <tr>
      <td>
        <strong>${item.description}</strong>
      </td>
      <td style="text-align: right; vertical-align: top;">${formatPrice(item.unitPrice)}</td>
      <td style="text-align: right; vertical-align: top;">${item.quantity}</td>
      <td style="text-align: right; vertical-align: top;">${formatPrice(item.totalPrice)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoiceNumber} - Geek Gaming Center</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-color: #7c3aed;
            --secondary-color: #6d28d9;
            --text-dark: #1f2937;
            --text-light: #6b7280;
            --bg-light: #f9fafb;
            --success-color: #10b981;
        }

        @page {
            size: A4;
            margin: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 8pt;
            line-height: 1.25;
            color: var(--text-dark);
            background: white;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 8px 0;
            margin-bottom: 8px;
            width: 100%;
        }

        .header h1 {
            font-size: 14pt;
            margin-bottom: 2px;
            font-weight: 700;
            padding: 0 12px;
        }

        .header .subtitle {
            font-size: 8.5pt;
            opacity: 0.9;
            padding: 0 12px;
        }

        /* Info section */
        .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 6px;
            margin-bottom: 8px;
            font-size: 7.5pt;
        }

        .info-box {
            background: var(--bg-light);
            padding: 4px 6px;
            border-left: 2px solid var(--primary-color);
        }

        .info-box h3 {
            color: var(--primary-color);
            font-size: 8pt;
            margin-bottom: 2px;
            font-weight: 600;
        }

        .info-box p {
            margin: 1px 0;
            line-height: 1.3;
        }

        /* Devis info */
        .devis-info {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
            font-size: 7.5pt;
        }

        .devis-info div {
            background: var(--bg-light);
            padding: 3px 6px;
            border-radius: 3px;
            flex: 1;
        }

        .devis-info strong {
            color: var(--primary-color);
        }

        /* Sections */
        .section {
            margin-bottom: 10px;
        }

        .section-title {
            font-size: 10pt;
            color: var(--primary-color);
            margin-bottom: 5px;
            padding-bottom: 3px;
            border-bottom: 2px solid var(--primary-color);
            font-weight: 600;
        }

        /* Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
            font-size: 8pt;
        }

        th {
            background: var(--primary-color);
            color: white;
            padding: 5px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 8.5pt;
        }

        td {
            padding: 5px 8px;
            border-bottom: 1px solid #e5e7eb;
        }

        .total-row {
            background: var(--bg-light);
            font-weight: 600;
        }

        .total-row td {
            color: var(--primary-color);
            font-size: 9.5pt;
        }

        /* Payment status */
        .payment-status {
            background: #ecfdf5;
            border-left: 3px solid var(--success-color);
            padding: 6px 10px;
            margin: 8px 0;
            font-size: 8pt;
            border-radius: 4px;
        }

        .payment-status strong {
            color: var(--success-color);
        }

        /* Warning box */
        .warning-box {
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            padding: 5px 10px;
            margin: 8px 0;
            font-size: 7.5pt;
            border-radius: 4px;
        }

        .warning-box strong {
            color: #d97706;
        }

        /* Notes */
        .notes-section {
            background: #f3f4f6;
            padding: 8px 10px;
            margin: 8px 0;
            font-size: 8pt;
            border-radius: 4px;
        }

        .notes-section h4 {
            color: var(--primary-color);
            font-size: 8.5pt;
            margin-bottom: 4px;
        }

        /* Footer */
        .footer {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            font-size: 7pt;
            color: var(--text-light);
            text-align: center;
        }

        @media print {
            body {
                max-width: 100%;
                margin: 0;
                padding: 0;
            }

            .header {
                margin: 0;
                padding: 8px 0;
            }

            .container {
                max-width: 100%;
                padding: 0 10mm;
            }
        }
    </style>
</head>
<body>
    <!-- Header (Full Width) -->
    <div class="header">
        <h1>FACTURE</h1>
        <div class="subtitle">${typeLabels[type]} - Geek Gaming Center - ${formatDate(invoiceDate)}</div>
    </div>

    <div class="container">
        <!-- Devis Info -->
        <div class="devis-info">
            <div><strong>N° Facture :</strong> ${invoiceNumber}</div>
            <div><strong>Date d'émission :</strong> ${formatDate(invoiceDate)}</div>
            <div><strong>Date d'échéance :</strong> ${formatDate(dueDate)}</div>
        </div>

        <!-- Info Section -->
        <div class="info-section">
            <div class="info-box">
                <h3>Émetteur</h3>
                <p><strong>${finalCompany.name}</strong></p>
                ${finalCompany.siret ? `<p>SIRET : ${finalCompany.siret}</p>` : ''}
                <p>📍 ${finalCompany.address}</p>
                <p>📧 ${finalCompany.email}</p>
                <p>📱 ${finalCompany.phone}</p>
                ${finalCompany.website ? `<p>🌐 ${finalCompany.website}</p>` : ''}
            </div>

            <div class="info-box">
                <h3>Client</h3>
                <p><strong>${customer.name}</strong></p>
                ${customer.phone ? `<p>📱 ${customer.phone}</p>` : ''}
                <p>📧 ${customer.email}</p>
            </div>

            <div class="info-box">
                <h3>Mode de paiement</h3>
                <p>${paymentMethodLabels[paymentMethod] || paymentMethod}</p>
                <p><strong>Statut :</strong> ${getStatusBadge(paymentStatus)}</p>
            </div>
        </div>

        <!-- Prestations -->
        <div class="section">
            <h2 class="section-title">Détails de la ${type === 'ORDER' ? 'Commande' : 'Session'}</h2>

            <table>
                <thead>
                    <tr>
                        <th>Désignation</th>
                        <th style="width: 100px; text-align: right;">Prix Unitaire</th>
                        <th style="width: 60px; text-align: center;">Qté</th>
                        <th style="width: 100px; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                    <tr>
                        <td><strong>Sous-total HT</strong></td>
                        <td colspan="2"></td>
                        <td style="text-align: right;">${formatPrice(subtotal)}</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>TOTAL HT</strong></td>
                        <td colspan="2"></td>
                        <td style="text-align: right;"><strong>${formatPrice(total)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${notes ? `
        <!-- Notes -->
        <div class="notes-section">
            <h4>Notes :</h4>
            <p>${notes.replace(/\n/g, '<br>')}</p>
        </div>
        ` : ''}

        <!-- Payment Info -->
        <div class="payment-status">
            <strong>Statut du paiement :</strong> ${paymentStatus === 'PAID' ? '✅ Payé le ' + formatDate(new Date()) : '⏳ En attente de paiement'}
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>${finalCompany.name}</strong> • ${formatDate(new Date().getFullYear())} • Tous droits réservés</p>
            <p style="margin-top: 5px;">Merci de votre confiance !</p>
        </div>
    </div>
</body>
</html>`
}
