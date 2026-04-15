'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Search, Plus, Edit, Eye, Trash2 } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  status: string
  totalSpent: number
  totalHours: number
  visitCount: number
  lastVisit?: string
  createdAt: string
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formError, setFormError] = useState('')
  const [customerFormError, setCustomerFormError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [page, statusFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/customers?${params}`)
      const data = await response.json()

      setCustomers(data.customers || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: any) => {
    setCustomerFormError('')

    try {
      const url = selectedCustomer
        ? `/api/customers/${selectedCustomer.id}`
        : '/api/customers'

      const method = selectedCustomer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          acceptCGV: formData.acceptTerms,
        }),
      })

      if (response.ok) {
        setShowModal(false)
        setSelectedCustomer(null)
        setCustomerFormError('')
        fetchCustomers()
      } else {
        const data = await response.json()
        setCustomerFormError(data.error || 'Erreur lors de la création du client')
        throw new Error(data.error || 'Erreur lors de la création du client')
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      setCustomerFormError('Erreur de connexion au serveur')
      throw error
    }
  }

  const handleEdit = async (customer: Customer) => {
    // Récupérer les données complètes du client depuis l'API
    try {
      const response = await fetch(`/api/customers/${customer.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCustomer(data.customer) // Utiliser les données complètes
        setCustomerFormError('')
        setShowModal(true)
      } else {
        setCustomerFormError('Erreur lors du chargement du client')
      }
    } catch (error) {
      console.error('Error fetching customer details:', error)
      setCustomerFormError('Erreur de connexion au serveur')
    }
  }

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/customers/${selectedCustomer.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setSelectedCustomer(null)
        fetchCustomers()
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Erreur de connexion au serveur')
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      NEW: { label: 'Nouveau', variant: 'info' },
      REGULAR: { label: 'Régulier', variant: 'default' },
      VIP: { label: 'VIP', variant: 'success' },
      INACTIVE: { label: 'Inactif', variant: 'warning' },
      BLOCKED: { label: 'Bloqué', variant: 'danger' },
    }

    const config = statusConfig[status] || statusConfig.NEW
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen mt-28 lg:mt-20" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ color: 'var(--foreground)' }}>Clients</h1>
              <p className="text-sm text-slate-900 mt-1" style={{ color: 'var(--foreground)' }}>
                Gestion des clients du Geek Gaming Center
              </p>
            </div>
            <Button
              onClick={() => {
                setShowModal(true)
                setSelectedCustomer(null)
                setCustomerFormError('')
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nouveau Client
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--background)' }}>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-900" style={{ color: 'var(--foreground)' }} />
                  <Input
                    placeholder="Rechercher par nom, email, téléphone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
                    style={{
                      backgroundColor: 'var(--background)',
                      color: 'var(--foreground)',
                      borderColor: 'var(--border)'
                    }}
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}
              >
                <option value="">Tous les statuts</option>
                <option value="NEW">Nouveaux</option>
                <option value="REGULAR">Réguliers</option>
                <option value="VIP">VIP</option>
                <option value="INACTIVE">Inactifs</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-slate-900" style={{ color: 'var(--foreground)' }}>
                Chargement des clients...
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-slate-900" style={{ color: 'var(--foreground)' }}>
                Aucun client trouvé
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Visites</TableHead>
                        <TableHead>Total Dépensé</TableHead>
                        <TableHead>Dernière Visite</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900" style={{ color: 'var(--foreground)' }}>
                                {customer.firstName} {customer.lastName}
                              </div>
                              {customer.email && (
                                <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>{customer.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{customer.phone}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{customer.visitCount} visite(s)</div>
                            <div className="text-xs text-slate-900" style={{ color: 'var(--foreground)' }}>{Number(customer.totalHours).toFixed(1)}h</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">
                              {customer.totalSpent.toLocaleString('fr-FR')} FCFA
                            </div>
                          </TableCell>
                          <TableCell>
                            {customer.lastVisit ? (
                              <div className="text-sm">
                                {new Date(customer.lastVisit).toLocaleDateString('fr-FR')}
                              </div>
                            ) : (
                              <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>Jamais</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                title="Voir"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(customer)}
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteClick(customer)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>
                      Page {page} sur {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Précédent
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCustomer(null)
          setCustomerFormError('')
        }}
        title={selectedCustomer ? 'Modifier le Client' : 'Nouveau Client'}
        size="xl"
      >
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false)
            setSelectedCustomer(null)
            setCustomerFormError('')
          }}
          initialData={selectedCustomer ? {
            firstName: selectedCustomer.firstName,
            lastName: selectedCustomer.lastName,
            email: selectedCustomer.email,
            phone: selectedCustomer.phone,
            address: selectedCustomer.address || undefined,
            city: selectedCustomer.city || undefined,
            dateOfBirth: selectedCustomer.dateOfBirth || undefined,
            howDidYouFindUs: selectedCustomer.howDidYouFindUs || undefined,
            howDidYouFindUsDetails: selectedCustomer.howDidYouFindUsDetails || undefined,
            notes: selectedCustomer.notes || undefined,
          } : undefined}
          submitLabel={selectedCustomer ? 'Mettre à jour' : 'Créer le Client'}
          includePassword={false}
          error={customerFormError}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedCustomer(null)
        }}
        title="Confirmer la suppression"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-medium mb-2">⚠️ Attention</p>
            <p className="text-red-800 text-sm">
              Vous êtes sur le point de supprimer le client :
            </p>
            <p className="text-red-900 font-bold mt-2">
              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </p>
            {selectedCustomer?.email && (
              <p className="text-red-700 text-sm mt-1">{selectedCustomer.email}</p>
            )}
          </div>

          <p className="text-gray-600 text-sm">
            Cette action est irréversible. Toutes les données associées à ce client seront définitivement supprimées.
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedCustomer(null)
              }}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
