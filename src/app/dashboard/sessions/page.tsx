'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { SessionForm } from '@/components/forms/SessionForm'
import { Play, Pause, Square, Plus, Clock, Euro, Calendar, Filter, Search, TrendingUp, Users, Activity } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  type: string
  code: string
  status: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  phone: string
}

interface GamingSession {
  id: string
  sessionNumber: string
  status: string
  duration: number
  price: number
  paidAt: string
  scheduledEndAt: string
  createdAt: string
  timeRemaining?: number
  customer: Customer
  equipment: Equipment
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<GamingSession[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])

  // Date filter states
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchSessions()
    fetchEquipment()
    const interval = setInterval(fetchSessions, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sessions/all')
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment?status=AVAILABLE')
      const data = await response.json()
      setEquipment(data.equipment || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const searchCustomers = async (query: string) => {
    if (query.length < 2) {
      setCustomers([])
      return
    }

    try {
      const response = await fetch(`/api/customers?search=${query}&limit=10`)
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  const handleCreateSession = async (formData: any) => {
    setFormLoading(true)
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        fetchSessions()
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création de la session')
      }
    } catch (error: any) {
      console.error('Error creating session:', error)
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleSessionAction = async (sessionId: string, action: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchSessions()
      }
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      PENDING: { label: 'En attente', variant: 'warning' },
      ACTIVE: { label: 'En cours', variant: 'success' },
      PAUSED: { label: 'En pause', variant: 'info' },
      COMPLETED: { label: 'Terminé', variant: 'default' },
      EXPIRED: { label: 'Expiré', variant: 'danger' },
    }

    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
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

  const getEquipmentLabel = (type: string) => {
    const labels: Record<string, string> = {
      PS5: 'PlayStation 5',
      PS4: 'PlayStation 4',
      XBOX_SERIES_X: 'Xbox Series X',
      PC_GAMING: 'PC Gaming',
      OCULUS_VR: 'Oculus VR',
      VR_PS4: 'VR PS4',
      SIMU_RACING: 'Simulateur Racing',
    }
    return labels[type] || type
  }

  // Filter sessions by date
  const filterSessionsByDate = (sessions: GamingSession[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return sessions.filter(session => {
      const sessionDate = new Date(session.paidAt)

      switch (dateFilter) {
        case 'today':
          return sessionDate >= today
        case 'week':
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return sessionDate >= weekAgo
        case 'month':
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return sessionDate >= monthAgo
        case 'year':
          const yearAgo = new Date(today)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          return sessionDate >= yearAgo
        case 'custom':
          if (!customStartDate || !customEndDate) return true
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59)
          return sessionDate >= start && sessionDate <= end
        default:
          return true
      }
    })
  }

  // Filter sessions by search and status
  const filteredSessions = sessions.filter(session => {
    // Search filter
    const matchesSearch = searchQuery === '' ||
      session.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.customer?.phone?.includes(searchQuery) ||
      session.sessionNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.equipment?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter

    // Date filter
    const dateFilteredSessions = filterSessionsByDate([session])
    const matchesDate = dateFilteredSessions.length > 0

    return matchesSearch && matchesStatus && matchesDate
  })

  // Statistics
  const stats = {
    total: sessions.length,
    active: sessions.filter(s => s.status === 'ACTIVE').length,
    completed: sessions.filter(s => s.status === 'COMPLETED').length,
    revenue: sessions.reduce((sum, s) => sum + s.price, 0),
    todayRevenue: sessions
      .filter(s => {
        const sessionDate = new Date(s.paidAt)
        const today = new Date()
        return sessionDate.toDateString() === today.toDateString()
      })
      .reduce((sum, s) => sum + s.price, 0),
  }

  return (
    <div className="min-h-screen mt-28 lg:mt-20 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                Sessions de Gaming
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1" style={{ color: 'var(--foreground)' }}>
                Historique complet et gestion des sessions
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nouvelle Session
            </button>
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
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1" style={{ color: 'var(--foreground)' }}>
                    {stats.total}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Sessions Actives</p>
                  <p className="text-2xl font-bold text-green-500 mt-1">{stats.active}</p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Terminées</p>
                  <p className="text-2xl font-bold text-gray-500 mt-1">{stats.completed}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Revenu Aujourd'hui</p>
                  <p className="text-2xl font-bold text-blue-500 mt-1">
                    {stats.todayRevenue.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <Euro className="w-8 h-8 text-blue-500" />
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
                placeholder="Rechercher par client, session ou équipement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
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
                <option value="year">Cette année</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="ACTIVE">En cours</option>
                <option value="COMPLETED">Terminé</option>
                <option value="PAUSED">En pause</option>
                <option value="EXPIRED">Expiré</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="mt-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-300" style={{ color: 'var(--foreground)' }}>
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} trouvée{filteredSessions.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Main Content - Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--background)' }}>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                Chargement des sessions...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-300">
                {searchQuery || dateFilter !== 'all' || statusFilter !== 'all'
                  ? 'Aucune session ne correspond à votre recherche'
                  : 'Aucune session trouvée'}
              </div>
            ) : (
              <div className="rounded-md border dark:border-gray-700 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700 dark:bg-gray-800">
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>N° Session</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Client</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Équipement</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Statut</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Durée</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Prix</TableHead>
                      <TableHead className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>Date</TableHead>
                      <TableHead className="text-gray-900 dark:text-white text-right" style={{ color: 'var(--foreground)' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id} className="dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <TableCell className="dark:bg-gray-800">
                          <span className="font-medium text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {session.sessionNumber}
                          </span>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {session.customer.firstName} {session.customer.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {session.customer.phone}
                          </div>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {getEquipmentLabel(session.equipment.type)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {session.equipment.code}
                          </div>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          {getStatusBadge(session.status)}
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <span className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {formatTime(session.duration)}
                          </span>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <span className="text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {session.price.toLocaleString('fr-FR')} FCFA
                          </span>
                        </TableCell>
                        <TableCell className="dark:bg-gray-800">
                          <div className="text-sm text-gray-900 dark:text-white" style={{ color: 'var(--foreground)' }}>
                            {formatDate(session.paidAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right dark:bg-gray-800">
                          {session.status === 'ACTIVE' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSessionAction(session.id, 'pause')}
                                className="dark:text-white dark:hover:bg-gray-700"
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSessionAction(session.id, 'stop')}
                                className="dark:text-white dark:hover:bg-gray-700 text-red-500"
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          {session.status === 'PAUSED' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSessionAction(session.id, 'start')}
                                className="dark:text-white dark:hover:bg-gray-700"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSessionAction(session.id, 'stop')}
                                className="dark:text-white dark:hover:bg-gray-700 text-red-500"
                              >
                                <Square className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
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

      {/* Create Session Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvelle Session"
        size="xl"
      >
        <SessionForm
          onSubmit={handleCreateSession}
          onCancel={() => setShowModal(false)}
          equipment={equipment}
          customers={customers}
          onSearchCustomers={(query) => searchCustomers(query)}
          loading={formLoading}
        />
      </Modal>
    </div>
  )
}
