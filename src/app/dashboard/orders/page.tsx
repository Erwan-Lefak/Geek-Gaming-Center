'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Filter, Package, Download } from 'lucide-react'
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id} className="dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
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
