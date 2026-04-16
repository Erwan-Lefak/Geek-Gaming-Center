'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Search, Calendar, Filter, Package, Download, User, Mail, Phone, MapPin, CreditCard, Clock, Edit, Trash2, Eye, Plus } from 'lucide-react'
import { formatFCFA } from '@/lib/currency'

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
  items: OrderItem[]
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
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
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    customerEmail: '',
    items: [] as Array<{ productId: string; name: string; quantity: number; price: number }>,
    totalAmount: 0,
    paymentMethod: 'CASH' as 'CASH' | 'CARD' | 'MOBILE_MONEY',
    status: 'PENDING' as 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED',
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'En attente', variant: 'warning' },
      CONFIRMED: { label: 'Confirmée', variant: 'success' },
      PROCESSING: { label: 'En traitement', variant: 'info' },
      SHIPPED: { label: 'Expédiée', variant: 'default' },
      DELIVERED: { label: 'Livrée', variant: 'success' },
      CANCELLED: { label: 'Annulée', variant: 'danger' },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'En attente', variant: 'warning' },
      PAID: { label: 'Payée', variant: 'success' },
      FAILED: { label: 'Échouée', variant: 'danger' },
      REFUNDED: { label: 'Remboursée', variant: 'default' },
    }

    const statusConfig = config[status] || config.PENDING
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchOrders()
        alert('Statut de la commande mis à jour!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la mise à jour')
    }
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
        body: JSON.stringify(orderForm),
      })

      if (response.ok) {
        await fetchOrders()
        setShowCreateOrderModal(false)
        setOrderForm({
          customerId: '',
          customerEmail: '',
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
    <div className="min-h-screen mt-28 lg:mt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                Commandes Boutique
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1" style={{ color: 'var(--foreground)' }}>
                Historique complet des commandes en ligne
              </p>
            </div>
            <Button
              onClick={() => setShowCreateOrderModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Commande
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Commandes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1" style={{ color: 'var(--foreground)' }}>
                    {stats.total}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">En attente</p>
                  <p className="text-2xl font-bold text-yellow-500 mt-1">{stats.pending}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Confirmées</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">{stats.confirmed}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Revenu Total</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">
                    {formatFCFA(stats.totalRevenue)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <Input
                type="text"
                placeholder="Rechercher par n° commande, client, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmée</option>
                <option value="PROCESSING">En traitement</option>
                <option value="SHIPPED">Expédiée</option>
                <option value="DELIVERED">Livrée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="w-full md:w-48">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300" style={{ color: 'var(--foreground)' }}>
            {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''} trouvée{filteredOrders.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--background)' }}>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                Chargement des commandes...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Aucune commande ne correspond à votre recherche'
                  : 'Aucune commande trouvée'}
              </div>
            ) : (
              <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700 dark:bg-gray-800">
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>N° Commande</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Client</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Articles</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Statut</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Paiement</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Total</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Date</TableHead>
                      <TableHead className="text-gray-900 dark:text-white text-right" style={{ color: 'var(--foreground)' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell className="dark:bg-gray-800">
                          <span className="font-medium text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.customer.email}
                          </div>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.items.map(item => item.productName).join(', ').substring(0, 30)}
                            {order.items.map(item => item.productName).join(', ').length > 30 ? '...' : ''}
                          </div>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="space-y-1">
                            {getPaymentStatusBadge(order.paymentStatus)}
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.paymentMethod === 'CARD' ? 'Carte bancaire' : order.paymentMethod}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <span className="font-semibold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {formatFCFA(order.totalAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {formatDate(order.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right dark:bg-gray-800">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewOrder(order)}
                              title="Voir détails"
                              className="dark:text-white dark:hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateOrderStatus(order.id, order.status === 'PENDING' ? 'PROCESSING' : 'PENDING')}
                              title="Changer statut"
                              className="dark:text-white dark:hover:bg-gray-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          title={`Détails de la commande ${selectedOrder.orderNumber}`}
          size="xl"
        >
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                  <p className="font-semibold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                    {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                    {selectedOrder.customer.email}
                  </p>
                </div>
              </div>
              {selectedOrder.customer.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                    <p className="text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                      {selectedOrder.customer.phone}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Statut</p>
                </div>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Paiement</p>
                </div>
                {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {selectedOrder.paymentMethod === 'CARD' ? 'Carte bancaire' : selectedOrder.paymentMethod}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Package className="w-5 h-5" />
                Articles ({selectedOrder.items.length})
              </h3>
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Article</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Qté</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Prix unit.</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id} className="dark:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {item.productName}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {formatFCFA(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {formatFCFA(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-purple-600 dark:text-purple-400">
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

      {/* Create Order Modal */}
      <Modal
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        title="Nouvelle Commande"
        size="xl"
      >
        <div className="space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <User className="w-5 h-5" />
              Informations Client
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email du client *</label>
                <Input
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                  placeholder="client@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse de livraison</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  value={orderForm.shippingAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, shippingAddress: e.target.value })}
                  placeholder="Adresse complète de livraison"
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Package className="w-5 h-5" />
                Articles ({orderForm.items.length})
              </h3>
              <Button
                onClick={addItemToOrder}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Ajouter Article
              </Button>
            </div>

            {orderForm.items.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Package className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">Aucun article. Cliquez sur "Ajouter Article" pour commencer.</p>
              </div>
            ) : (
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Article</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Qté</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Prix unit.</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {orderForm.items.map((item, index) => (
                      <tr key={index} className="dark:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {formatFCFA(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                          {formatFCFA(item.quantity * item.price)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => removeItemFromOrder(index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-lg text-purple-600 dark:text-purple-400">
                        {formatFCFA(orderForm.totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Payment & Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
              <CreditCard className="w-5 h-5" />
              Paiement & Statut
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mode de paiement</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  value={orderForm.paymentMethod}
                  onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value as any })}
                >
                  <option value="CASH">Espèces</option>
                  <option value="CARD">Carte bancaire</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value as any })}
                >
                  <option value="PENDING">En attente</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="PROCESSING">En traitement</option>
                  <option value="SHIPPED">Expédiée</option>
                  <option value="DELIVERED">Livrée</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
            <Button
              onClick={() => setShowCreateOrderModal(false)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700"
            >
              Créer la Commande
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
