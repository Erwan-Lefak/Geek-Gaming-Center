'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { SessionForm } from '@/components/forms/SessionForm'
import {
  Play,
  Pause,
  Square,
  Plus,
  Clock,
  Users,
  Activity,
  Banknote,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashStat,
  DashEmpty,
  StatusBadge,
  sessionStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

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
        case 'week': {
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          return sessionDate >= weekAgo
        }
        case 'month': {
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return sessionDate >= monthAgo
        }
        case 'year': {
          const yearAgo = new Date(today)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          return sessionDate >= yearAgo
        }
        case 'custom': {
          if (!customStartDate || !customEndDate) return true
          const start = new Date(customStartDate)
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59)
          return sessionDate >= start && sessionDate <= end
        }
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
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Sessions de gaming"
        description="Historique complet et gestion des sessions"
        actions={
          <button onClick={() => setShowModal(true)} className={dashBtnPrimaryCls}>
            <Plus className="h-4 w-4" />
            Nouvelle session
          </button>
        }
      />

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashStat icon={Users} label="Total sessions" value={stats.total} tone="violet" />
        <DashStat icon={Activity} label="Sessions actives" value={stats.active} tone="emerald" />
        <DashStat icon={Clock} label="Terminées" value={stats.completed} tone="slate" />
        <DashStat
          icon={Banknote}
          label="Revenu aujourd'hui"
          value={`${stats.todayRevenue.toLocaleString('fr-FR')} FCFA`}
          tone="sky"
        />
      </div>

      {/* Filtres + tableau */}
      <DashCard
        title={`${filteredSessions.length} session${filteredSessions.length !== 1 ? 's' : ''}`}
        description="Recherche par client, numéro de session ou équipement"
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(dashInputCls, 'pl-9')}
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">Cette année</option>
              <option value="custom">Personnalisé</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Tous les statuts</option>
              <option value="ACTIVE">En cours</option>
              <option value="COMPLETED">Terminé</option>
              <option value="PAUSED">En pause</option>
              <option value="EXPIRED">Expiré</option>
            </select>
          </div>
        }
      >
        {dateFilter === 'custom' && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-slate-400">Date de début</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={dashInputCls}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm text-slate-400">Date de fin</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={dashInputCls}
              />
            </div>
          </div>
        )}

        {loading && sessions.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Chargement des sessions…</div>
        ) : filteredSessions.length === 0 ? (
          <DashEmpty
            icon={Search}
            title={
              searchQuery || dateFilter !== 'all' || statusFilter !== 'all'
                ? 'Aucune session ne correspond à votre recherche'
                : 'Aucune session trouvée'
            }
          />
        ) : (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr>
                  <th className={dashTableHeadCls}>N° session</th>
                  <th className={dashTableHeadCls}>Client</th>
                  <th className={dashTableHeadCls}>Équipement</th>
                  <th className={dashTableHeadCls}>Statut</th>
                  <th className={dashTableHeadCls}>Durée</th>
                  <th className={dashTableHeadCls}>Prix</th>
                  <th className={dashTableHeadCls}>Date</th>
                  <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {session.sessionNumber}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-slate-200">
                        {session.customer.firstName} {session.customer.lastName}
                      </div>
                      <div className="text-xs text-slate-500">{session.customer.phone}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="text-slate-200">{getEquipmentLabel(session.equipment.type)}</div>
                      <div className="text-xs text-slate-500">{session.equipment.code}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={session.status} meta={sessionStatusMeta} />
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{formatTime(session.duration)}</td>
                    <td className="py-3 pr-4 font-medium text-slate-200 tabular-nums">
                      {session.price.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {formatDate(session.paidAt)}
                    </td>
                    <td className="py-3 text-right">
                      {(session.status === 'ACTIVE' || session.status === 'PAUSED') && (
                        <div className="flex justify-end gap-1">
                          {session.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleSessionAction(session.id, 'pause')}
                              className={dashBtnGhostCls}
                              title="Mettre en pause"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSessionAction(session.id, 'start')}
                              className={dashBtnGhostCls}
                              title="Reprendre"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSessionAction(session.id, 'stop')}
                            className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                            title="Terminer"
                          >
                            <Square className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>

      {/* Modal : nouvelle session */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvelle session"
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
