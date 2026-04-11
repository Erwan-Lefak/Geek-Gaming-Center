'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    acceptCGV: false,
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = selectedCustomer
        ? `/api/customers/${selectedCustomer.id}`
        : '/api/customers'

      const method = selectedCustomer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setSelectedCustomer(null)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          notes: '',
          acceptCGV: false,
        })
        fetchCustomers()
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email || '',
      phone: customer.phone,
      address: '',
      city: '',
      notes: '',
      acceptCGV: false,
    })
    setShowModal(true)
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
    <div className="min-h-screen bg-gray-50 mt-28 lg:mt-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestion des clients du Geek Gaming Center
              </p>
            </div>
            <Button onClick={() => { setShowModal(true); setSelectedCustomer(null) }}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Client
            </Button>
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email, téléphone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
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
              <div className="text-center py-12 text-gray-500">
                Chargement des clients...
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
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
                              <div className="font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                              {customer.email && (
                                <div className="text-sm text-gray-600">{customer.email}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{customer.phone}</div>
                          </TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">{customer.visitCount} visite(s)</div>
                            <div className="text-xs text-gray-600">{Number(customer.totalHours).toFixed(1)}h</div>
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
                              <div className="text-sm text-gray-400">Jamais</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(customer)}
                              >
                                <Edit className="w-4 h-4" />
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
                    <div className="text-sm text-gray-600">
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
        }}
        title={selectedCustomer ? 'Modifier le Client' : 'Nouveau Client'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="city">Ville</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[80px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="acceptCGV"
              checked={formData.acceptCGV}
              onChange={(e) => setFormData({ ...formData, acceptCGV: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="acceptCGV" className="text-sm">
              Le client accepte les conditions générales de vente
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">
              {selectedCustomer ? 'Mettre à jour' : 'Créer le Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
