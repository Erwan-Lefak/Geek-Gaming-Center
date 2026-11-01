'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { CustomerForm } from '@/components/forms/CustomerForm'
import { Search, Plus, Edit, Eye, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  StatusBadge,
  customerStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

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
  address?: string
  city?: string
  dateOfBirth?: string
  howDidYouFindUs?: string
  howDidYouFindUsDetails?: string
  notes?: string
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

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Clients"
        description="Fichier clients du Geek Gaming Center"
        actions={
          <button
            onClick={() => {
              setShowModal(true)
              setSelectedCustomer(null)
              setCustomerFormError('')
            }}
            className={dashBtnPrimaryCls}
          >
            <Plus className="h-4 w-4" />
            Nouveau client
          </button>
        }
      />

      <DashCard
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Nom, email, téléphone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(dashInputCls, 'pl-9')}
                onKeyPress={(e) => e.key === 'Enter' && fetchCustomers()}
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
              <option value="NEW">Nouveaux</option>
              <option value="REGULAR">Réguliers</option>
              <option value="VIP">VIP</option>
              <option value="INACTIVE">Inactifs</option>
            </select>
          </div>
        }
      >
        {loading && customers.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Chargement des clients…</div>
        ) : customers.length === 0 ? (
          <DashEmpty
            icon={Users}
            title="Aucun client trouvé"
            hint={search ? 'Essayez une autre recherche' : undefined}
          />
        ) : (
          <>
            <div className="overflow-x-auto dash-scroll">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr>
                    <th className={dashTableHeadCls}>Client</th>
                    <th className={dashTableHeadCls}>Contact</th>
                    <th className={dashTableHeadCls}>Statut</th>
                    <th className={dashTableHeadCls}>Visites</th>
                    <th className={dashTableHeadCls}>Total dépensé</th>
                    <th className={dashTableHeadCls}>Dernière visite</th>
                    <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-200">
                          {customer.firstName} {customer.lastName}
                        </div>
                        {customer.email && (
                          <div className="text-xs text-slate-500">{customer.email}</div>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{customer.phone}</td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={customer.status} meta={customerStatusMeta} />
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-200">{customer.visitCount} visite(s)</div>
                        <div className="text-xs text-slate-500">
                          {Number(customer.totalHours).toFixed(1)}h
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-200 tabular-nums">
                        {customer.totalSpent.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {customer.lastVisit
                          ? new Date(customer.lastVisit).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                            title="Voir"
                            className={dashBtnGhostCls}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            title="Modifier"
                            className={dashBtnGhostCls}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(customer)}
                            title="Supprimer"
                            className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  Page {page} sur {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={cn(dashBtnOutlineCls, 'px-3 py-1.5 text-xs disabled:opacity-40')}
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={cn(dashBtnOutlineCls, 'px-3 py-1.5 text-xs disabled:opacity-40')}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </DashCard>

      {/* Modal : création / édition */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCustomer(null)
          setCustomerFormError('')
        }}
        title={selectedCustomer ? 'Modifier le client' : 'Nouveau client'}
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
          submitLabel={selectedCustomer ? 'Mettre à jour' : 'Créer le client'}
          includePassword={false}
          error={customerFormError}
        />
      </Modal>

      {/* Modal : confirmation de suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedCustomer(null)
        }}
        title="Confirmer la suppression"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4">
            <p className="mb-2 font-medium text-rose-300">⚠️ Attention</p>
            <p className="text-sm text-rose-200/80">
              Vous êtes sur le point de supprimer le client :
            </p>
            <p className="mt-2 font-bold text-rose-100">
              {selectedCustomer?.firstName} {selectedCustomer?.lastName}
            </p>
            {selectedCustomer?.email && (
              <p className="mt-1 text-sm text-rose-200/70">{selectedCustomer.email}</p>
            )}
          </div>

          <p className="text-sm text-slate-400">
            Cette action est irréversible. Toutes les données associées à ce client
            seront définitivement supprimées.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setSelectedCustomer(null)
              }}
              disabled={isDeleting}
              className={dashBtnOutlineCls}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Suppression…
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
