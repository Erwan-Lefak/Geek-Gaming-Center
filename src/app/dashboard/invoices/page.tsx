'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, FileText, Download, Eye } from 'lucide-react'
import { formatPrice } from '@/lib/data/pricing'

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PAID: { label: 'Payée', variant: 'success' },
      PENDING: { label: 'En attente', variant: 'warning' },
      PARTIALLY_PAID: { label: 'Partielle', variant: 'info' },
      CANCELLED: { label: 'Annulée', variant: 'danger' },
      REFUNDED: { label: 'Remboursée', variant: 'default' },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
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

  return (
    <div className="min-h-screen mt-28 lg:mt-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-100-900">Factures</h1>
            <p className="text-sm text-slate-900 dark:text-white dark:text-slate-100-600 mt-1">
              Historique des factures et paiements
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900 dark:text-white dark:text-slate-100-400" />
                  <Input
                    placeholder="Rechercher une facture..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="PAID">Payées</option>
                <option value="PENDING">En attente</option>
                <option value="PARTIALLY_PAID">Partiellement payées</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-slate-900 dark:text-white dark:text-slate-100-500">
                Chargement des factures...
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-slate-900 dark:text-white dark:text-slate-100-500">
                Aucune facture trouvée
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Facture</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant TTC</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-white dark:text-slate-100-900">
                            {invoice.invoiceNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white dark:text-slate-100-900">
                              {invoice.customer.firstName} {invoice.customer.lastName}
                            </div>
                            <div className="text-sm text-slate-900 dark:text-white dark:text-slate-100-600">{invoice.customer.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{invoice.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-900 dark:text-white dark:text-slate-100-900">
                            {invoice.total.toLocaleString('fr-FR')} FCFA
                          </div>
                          <div className="text-xs text-slate-900 dark:text-white dark:text-slate-100-600">
                            dont TVA: {invoice.taxAmount.toLocaleString('fr-FR')} FCFA
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{getPaymentMethodLabel(invoice.paymentMethod)}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.paymentStatus)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
