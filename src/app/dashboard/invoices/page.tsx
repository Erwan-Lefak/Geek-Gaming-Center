'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, Download, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  DashBadge,
  StatusBadge,
  paymentStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  type: string
  subtotal: number
  taxAmount: number
  total: number
  paymentStatus: string
  paymentMethod: string
  customer: {
    firstName: string
    lastName: string
    phone: string
  }
}

const invoiceTypeMeta: Record<string, { label: string }> = {
  GAMING_SESSION: { label: 'Session de jeu' },
  BOUTIQUE_SALE: { label: 'Boutique' },
  RESERVATION: { label: 'Réservation' },
  CREDIT_NOTE: { label: 'Avoir' },
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CASH: 'Espèces',
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN Mobile Money',
    CARD: 'Carte bancaire',
    BANK_TRANSFER: 'Virement bancaire',
  }
  return labels[method] || method
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchInvoices()
  }, [page, statusFilter])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/invoices?${params}`)
      const data = await response.json()

      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Facture_${invoiceNumber}.pdf`

      // Trigger download
      document.body.appendChild(a)
      a.click()

      // Cleanup
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Erreur lors du téléchargement de la facture')
    }
  }

  const handleViewInvoice = (invoiceId: string) => {
    // Open invoice in new tab
    window.open(`/api/invoices/${invoiceId}/download`, '_blank')
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Factures"
        description="Historique des factures et paiements"
      />

      <DashCard
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Rechercher une facture…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(dashInputCls, 'pl-9')}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="">Tous les statuts</option>
              <option value="PAID">Payées</option>
              <option value="PENDING">En attente</option>
              <option value="PARTIALLY_PAID">Partiellement payées</option>
            </select>
          </div>
        }
      >
        {loading && invoices.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Chargement des factures…</div>
        ) : invoices.length === 0 ? (
          <DashEmpty icon={FileText} title="Aucune facture trouvée" />
        ) : (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr>
                  <th className={dashTableHeadCls}>N° facture</th>
                  <th className={dashTableHeadCls}>Date</th>
                  <th className={dashTableHeadCls}>Client</th>
                  <th className={dashTableHeadCls}>Type</th>
                  <th className={dashTableHeadCls}>Montant TTC</th>
                  <th className={dashTableHeadCls}>Paiement</th>
                  <th className={dashTableHeadCls}>Statut</th>
                  <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-200">
                        {invoice.customer.firstName} {invoice.customer.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{invoice.customer.phone}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <DashBadge label={invoiceTypeMeta[invoice.type]?.label ?? invoice.type} />
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-100 tabular-nums">
                        {invoice.total.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums">
                        dont TVA : {invoice.taxAmount.toLocaleString('fr-FR')} FCFA
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {getPaymentMethodLabel(invoice.paymentMethod)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={invoice.paymentStatus} meta={paymentStatusMeta} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          title="Voir la facture"
                          className={dashBtnGhostCls}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                          title="Télécharger la facture"
                          className={dashBtnGhostCls}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>
    </div>
  )
}
