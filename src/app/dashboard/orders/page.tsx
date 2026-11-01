'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import {
  Search,
  Calendar,
  Package,
  Banknote,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Edit,
  Trash2,
  Eye,
  Plus,
  Hourglass,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFCFA } from '@/lib/currency'
import {
  DashPageHeader,
  DashCard,
  DashStat,
  DashEmpty,
  StatusBadge,
  orderStatusMeta,
  paymentStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

interface OrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  shippingAddress?: string
  items: OrderItem[]
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

const paymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    CASH: 'Espèces',
    CARD: 'Carte bancaire',
    MOBILE_MONEY: 'Mobile Money',
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN Mobile Money',
  }
  return labels[method] ?? method
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const [showEditOrderModal, setShowEditOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    customerEmail: '',
    customerFirstName: '',
    customerLastName: '',
    customerPhone: '',
    items: [] as Array<{ productId: string; name: string; quantity: number; price: number }>,
    totalAmount: 0,
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'MOBILE_MONEY',
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED',
    shippingAddress: '',
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setOrderForm({
      customerId: order.customer.id,
      customerEmail: order.customer.email,
      customerFirstName: order.customer.firstName,
      customerLastName: order.customer.lastName,
      customerPhone: order.customer.phone || '',
      items: order.items.map(item => ({
        productId: item.id,
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod as any,
      status: order.status as any,
      shippingAddress: order.shippingAddress || '',
    })
    setShowEditOrderModal(true)
  }

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la commande "${orderNumber}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchOrders()
        alert('Commande supprimée avec succès!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.phone?.includes(searchQuery)

    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    // Date filter
    const orderDate = new Date(order.createdAt)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    let matchesDate = true
    if (dateFilter === 'today') {
      matchesDate = orderDate >= today
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      matchesDate = orderDate >= weekAgo
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      matchesDate = orderDate >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
  }

  const handleCreateOrder = async () => {
    try {
      if (!orderForm.customerEmail || orderForm.items.length === 0) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }

      const response = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: orderForm.customerEmail,
          customerFirstName: orderForm.customerFirstName,
          customerLastName: orderForm.customerLastName,
          customerPhone: orderForm.customerPhone,
          items: orderForm.items,
          totalAmount: orderForm.totalAmount,
          paymentMethod: orderForm.paymentMethod,
          status: orderForm.status,
          shippingAddress: orderForm.shippingAddress,
        }),
      })

      if (response.ok) {
        await fetchOrders()
        setShowCreateOrderModal(false)
        setOrderForm({
          customerId: '',
          customerEmail: '',
          customerFirstName: '',
          customerLastName: '',
          customerPhone: '',
          items: [],
          totalAmount: 0,
          paymentMethod: 'CASH',
          status: 'PENDING',
          shippingAddress: '',
        })
        alert('Commande créée avec succès !')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la création de la commande')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Erreur lors de la création de la commande')
    }
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      if (!orderForm.customerEmail || orderForm.items.length === 0) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }

      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: orderForm.customerEmail,
          customerFirstName: orderForm.customerFirstName,
          customerLastName: orderForm.customerLastName,
          customerPhone: orderForm.customerPhone,
          status: orderForm.status,
          shippingAddress: orderForm.shippingAddress,
        }),
      })

      if (response.ok) {
        await fetchOrders()
        setShowEditOrderModal(false)
        setSelectedOrder(null)
        alert('Commande mise à jour avec succès !')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Erreur lors de la mise à jour de la commande')
    }
  }

  const addItemToOrder = () => {
    const productName = prompt('Nom du produit:')
    if (!productName) return

    const quantity = parseInt(prompt('Quantité:') || '1')
    const price = parseFloat(prompt('Prix unitaire (FCFA):') || '0')

    if (quantity > 0 && price > 0) {
      const newItem = {
        productId: Date.now().toString(),
        name: productName,
        quantity,
        price,
      }

      const newItems = [...orderForm.items, newItem]
      const totalAmount = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

      setOrderForm({
        ...orderForm,
        items: newItems,
        totalAmount,
      })
    }
  }

  const removeItemFromOrder = (index: number) => {
    const newItems = orderForm.items.filter((_, i) => i !== index)
    const totalAmount = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    setOrderForm({
      ...orderForm,
      items: newItems,
      totalAmount,
    })
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Commandes boutique"
        description="Historique complet des commandes en ligne"
        actions={
          <button onClick={() => setShowCreateOrderModal(true)} className={dashBtnPrimaryCls}>
            <Plus className="h-4 w-4" />
            Nouvelle commande
          </button>
        }
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashStat icon={Package} label="Total commandes" value={stats.total} tone="violet" />
        <DashStat icon={Hourglass} label="En attente" value={stats.pending} tone="amber" />
        <DashStat icon={CheckCircle2} label="Confirmées" value={stats.confirmed} tone="emerald" />
        <DashStat
          icon={Banknote}
          label="Revenu total"
          value={formatFCFA(stats.totalRevenue)}
          tone="sky"
        />
      </div>

      {/* Filtres + tableau */}
      <DashCard
        title={`${filteredOrders.length} commande${filteredOrders.length !== 1 ? 's' : ''}`}
        description="Cliquez sur une ligne pour voir les détails"
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="N° commande, client, email…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(dashInputCls, 'pl-9')}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="PREPARING">En préparation</option>
              <option value="READY">Prête</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
            </select>
          </div>
        }
      >
        {loading && orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Chargement des commandes…</div>
        ) : filteredOrders.length === 0 ? (
          <DashEmpty
            icon={Package}
            title={
              searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Aucune commande ne correspond à votre recherche'
                : 'Aucune commande trouvée'
            }
          />
        ) : (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr>
                  <th className={dashTableHeadCls}>N° commande</th>
                  <th className={dashTableHeadCls}>Client</th>
                  <th className={dashTableHeadCls}>Articles</th>
                  <th className={dashTableHeadCls}>Statut</th>
                  <th className={dashTableHeadCls}>Paiement</th>
                  <th className={dashTableHeadCls}>Total</th>
                  <th className={dashTableHeadCls}>Date</th>
                  <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-slate-200">
                        {order.customer.firstName} {order.customer.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{order.customer.email}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-slate-200">
                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                      </div>
                      <div className="max-w-[180px] truncate text-xs text-slate-500">
                        {order.items.map(item => item.productName).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={order.status} meta={orderStatusMeta} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={order.paymentStatus} meta={paymentStatusMeta} />
                      <div className="mt-1 text-xs text-slate-500">
                        {paymentMethodLabel(order.paymentMethod)}
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-100 tabular-nums">
                      {formatFCFA(order.totalAmount)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleViewOrder(order)}
                          title="Voir détails"
                          className={dashBtnGhostCls}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order)}
                          title="Modifier"
                          className={dashBtnGhostCls}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
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
        )}
      </DashCard>

      {/* Modal : détails de la commande */}
      {selectedOrder && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={`Détails de la commande ${selectedOrder.orderNumber}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Informations client */}
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-white/[0.03] p-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="font-semibold text-slate-100">
                    {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-slate-200">{selectedOrder.customer.email}</p>
                </div>
              </div>
              {selectedOrder.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary-400" />
                  <div>
                    <p className="text-xs text-slate-500">Téléphone</p>
                    <p className="text-sm text-slate-200">{selectedOrder.customer.phone}</p>
                  </div>
                </div>
              )}
              {selectedOrder.shippingAddress && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">Adresse de livraison</p>
                    <p className="whitespace-pre-wrap text-sm text-slate-200">
                      {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary-400" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-sm text-slate-200">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Statut & paiement */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary-400" />
                  <p className="text-sm font-semibold text-slate-300">Statut</p>
                </div>
                <StatusBadge status={selectedOrder.status} meta={orderStatusMeta} />
              </div>
              <div className="rounded-xl bg-white/[0.03] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary-400" />
                  <p className="text-sm font-semibold text-slate-300">Paiement</p>
                </div>
                <StatusBadge status={selectedOrder.paymentStatus} meta={paymentStatusMeta} />
                <p className="mt-1 text-xs text-slate-500">
                  {paymentMethodLabel(selectedOrder.paymentMethod)}
                </p>
              </div>
            </div>

            {/* Articles */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
                <Package className="h-5 w-5" />
                Articles ({selectedOrder.items.length})
              </h3>
              <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className={dashTableHeadCls}>Article</th>
                      <th className={cn(dashTableHeadCls, 'text-center')}>Qté</th>
                      <th className={cn(dashTableHeadCls, 'text-right')}>Prix unit.</th>
                      <th className={cn(dashTableHeadCls, 'text-right')}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="border-b border-white/[0.03] last:border-0">
                        <td className="px-4 py-3 text-slate-200">{item.productName}</td>
                        <td className="px-4 py-3 text-center text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                          {formatFCFA(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-100 tabular-nums">
                          {formatFCFA(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/[0.03]">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-200">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-primary-300 tabular-nums">
                        {formatFCFA(selectedOrder.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal : nouvelle commande */}
      <Modal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        title="Nouvelle commande"
        size="xl"
      >
        <div className="space-y-6">
          {/* Informations client */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
              <User className="h-5 w-5" />
              Informations client
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Prénom</label>
                  <input
                    type="text"
                    value={orderForm.customerFirstName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerFirstName: e.target.value })}
                    placeholder="Jean"
                    className={dashInputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Nom</label>
                  <input
                    type="text"
                    value={orderForm.customerLastName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerLastName: e.target.value })}
                    placeholder="Dupont"
                    className={dashInputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    placeholder="client@example.com"
                    className={dashInputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Téléphone</label>
                  <input
                    type="tel"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    placeholder="+237 6 00 00 00 00"
                    className={dashInputCls}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Adresse de livraison</label>
                <textarea
                  className={dashInputCls}
                  rows={3}
                  value={orderForm.shippingAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                  placeholder="Adresse complète de livraison"
                />
              </div>
            </div>
          </div>

          {/* Articles */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-100">
                <Package className="h-5 w-5" />
                Articles ({orderForm.items.length})
              </h3>
              <button onClick={addItemToOrder} className={dashBtnOutlineCls}>
                <Plus className="h-4 w-4" />
                Ajouter un article
              </button>
            </div>

            {orderForm.items.length === 0 ? (
              <DashEmpty
                icon={Package}
                title="Aucun article"
                hint='Cliquez sur « Ajouter un article » pour commencer'
              />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className={dashTableHeadCls}>Article</th>
                      <th className={cn(dashTableHeadCls, 'text-center')}>Qté</th>
                      <th className={cn(dashTableHeadCls, 'text-right')}>Prix unit.</th>
                      <th className={cn(dashTableHeadCls, 'text-right')}>Total</th>
                      <th className={cn(dashTableHeadCls, 'text-center')}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderForm.items.map((item, index) => (
                      <tr key={index} className="border-b border-white/[0.03] last:border-0">
                        <td className="px-4 py-3 text-slate-200">{item.name}</td>
                        <td className="px-4 py-3 text-center text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                          {formatFCFA(item.price)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-100 tabular-nums">
                          {formatFCFA(item.quantity * item.price)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeItemFromOrder(index)}
                            className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                            title="Retirer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/[0.03]">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-200">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-primary-300 tabular-nums">
                        {formatFCFA(orderForm.totalAmount)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Paiement & statut */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
              <CreditCard className="h-5 w-5" />
              Paiement & statut
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Mode de paiement</label>
                <select
                  className={dashSelectCls}
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value as any })}
                >
                  <option value="CASH">Espèces</option>
                  <option value="CARD">Carte bancaire</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Statut</label>
                <select
                  className={dashSelectCls}
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as any })}
                >
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="PREPARING">En préparation</option>
                  <option value="READY">Prête</option>
                  <option value="COMPLETED">Terminée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <button
              onClick={() => setShowCreateOrderModal(false)}
              className={cn(dashBtnOutlineCls, 'flex-1 justify-center')}
            >
              Annuler
            </button>
            <button onClick={handleCreateOrder} className={cn(dashBtnPrimaryCls, 'flex-1 justify-center')}>
              Créer la commande
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal : modifier la commande */}
      <Modal
        isOpen={showEditOrderModal}
        onClose={() => {
          setShowEditOrderModal(false)
          setSelectedOrder(null)
        }}
        title={`Modifier la commande ${selectedOrder?.orderNumber}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* Informations client */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
              <User className="h-5 w-5" />
              Informations client
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Prénom</label>
                  <input
                    type="text"
                    value={orderForm.customerFirstName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerFirstName: e.target.value })}
                    placeholder="Jean"
                    className={dashInputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Nom</label>
                  <input
                    type="text"
                    value={orderForm.customerLastName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerLastName: e.target.value })}
                    placeholder="Dupont"
                    className={dashInputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">
                    Email <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    placeholder="client@example.com"
                    className={dashInputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Téléphone</label>
                  <input
                    type="tel"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                    placeholder="+237 6 00 00 00 00"
                    className={dashInputCls}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-400">Adresse de livraison</label>
                <textarea
                  className={dashInputCls}
                  rows={3}
                  value={orderForm.shippingAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                  placeholder="Adresse complète de livraison"
                />
              </div>
            </div>
          </div>

          {/* Articles (lecture seule) */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
              <Package className="h-5 w-5" />
              Articles ({orderForm.items.length})
            </h3>

            {orderForm.items.length === 0 ? (
              <DashEmpty icon={Package} title="Aucun article" />
            ) : (
              <div className="overflow-hidden rounded-xl border border-white/5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className={dashTableHeadCls}>Article</th>
                      <th className={cn(dashTableHeadCls, 'text-center')}>Qté</th>
                      <th className={cn(dashTableHeadCls, 'text-right')}>Prix unit.</th>
                      <th className={cn(dashTableHeadCls, 'text-right')}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderForm.items.map((item, index) => (
                      <tr key={index} className="border-b border-white/[0.03] last:border-0">
                        <td className="px-4 py-3 text-slate-200">{item.name}</td>
                        <td className="px-4 py-3 text-center text-slate-300">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                          {formatFCFA(item.price)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-100 tabular-nums">
                          {formatFCFA(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-white/[0.03]">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-200">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-primary-300 tabular-nums">
                        {formatFCFA(orderForm.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Statut */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
              <CreditCard className="h-5 w-5" />
              Statut
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Statut de la commande</label>
                <select
                  className={dashSelectCls}
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as any })}
                >
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="PREPARING">En préparation</option>
                  <option value="READY">Prête</option>
                  <option value="COMPLETED">Terminée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-white/5 pt-4">
            <button
              onClick={() => {
                setShowEditOrderModal(false)
                setSelectedOrder(null)
              }}
              className={cn(dashBtnOutlineCls, 'flex-1 justify-center')}
            >
              Annuler
            </button>
            <button onClick={handleUpdateOrder} className={cn(dashBtnPrimaryCls, 'flex-1 justify-center')}>
              Mettre à jour
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
