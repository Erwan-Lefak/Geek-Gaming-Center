'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Modal } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Play, Pause, Square, Plus, Clock, Euro } from 'lucide-react'

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
  timeRemaining?: number
  customer: Customer
  equipment: Equipment
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<GamingSession[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeOnly, setActiveOnly] = useState(true)

  const [formData, setFormData] = useState({
    customerId: '',
    equipmentId: '',
    duration: 60,
  })

  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    fetchSessions()
    fetchEquipment()
    const interval = setInterval(fetchSessions, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [activeOnly])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '50',
        ...(activeOnly && { active: 'true' }),
      })

      const response = await fetch(`/api/sessions?${params}`)
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

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({ customerId: '', equipmentId: '', duration: 60 })
        fetchSessions()
      }
    } catch (error) {
      console.error('Error creating session:', error)
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

  return (
    <div className="min-h-screen mt-28 lg:mt-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-100-900">Sessions de Gaming</h1>
              <p className="text-sm text-slate-900 dark:text-white dark:text-slate-100-600 mt-1">
                Gestion des sessions en cours et à venir
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={activeOnly ? 'default' : 'ghost'}
                onClick={() => setActiveOnly(!activeOnly)}
              >
                {activeOnly ? 'Actives uniquement' : 'Toutes les sessions'}
              </Button>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Active Sessions */}
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-slate-900 dark:text-white dark:text-slate-100-500">
                  {activeOnly ? 'Aucune session active' : 'Aucune session'}
                </div>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-l-4 border-l-blue-500 bg-white dark:bg-slate-800">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-100-900">
                              {session.customer.firstName} {session.customer.lastName}
                            </h3>
                            {getStatusBadge(session.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-slate-900 dark:text-white dark:text-slate-100-600">Équipement</div>
                              <div className="font-medium text-slate-900 dark:text-white dark:text-slate-100-900">
                                {getEquipmentLabel(session.equipment.type)} - {session.equipment.code}
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-900 dark:text-white dark:text-slate-100-600">Durée / Prix</div>
                              <div className="font-medium text-slate-900 dark:text-white dark:text-slate-100-900">
                                {formatTime(session.duration)} / {session.price.toLocaleString('fr-FR')} FCFA
                              </div>
                            </div>

                            <div>
                              <div className="text-slate-900 dark:text-white dark:text-slate-100-600">Fin prévue</div>
                              <div className="font-medium text-slate-900 dark:text-white dark:text-slate-100-900">
                                {new Date(session.scheduledEndAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </div>
                          </div>

                          {session.timeRemaining !== undefined && session.status === 'ACTIVE' && (
                            <div className="mt-3">
                              <div className="text-sm text-slate-900 dark:text-white dark:text-slate-100-600">Temps restant</div>
                              <div className="text-lg font-bold text-blue-600">
                                {Math.floor(session.timeRemaining / 60000)} min
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          {session.status === 'PENDING' && (
                            <Button
                              size="sm"
                              onClick={() => handleSessionAction(session.id, 'START')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Démarrer
                            </Button>
                          )}

                          {session.status === 'ACTIVE' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleSessionAction(session.id, 'PAUSE')}
                                variant="secondary"
                              >
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleSessionAction(session.id, 'END')}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <Square className="w-4 h-4 mr-1" />
                                Terminer
                              </Button>
                            </>
                          )}

                          {session.status === 'PAUSED' && (
                            <Button
                              size="sm"
                              onClick={() => handleSessionAction(session.id, 'RESUME')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Reprendre
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSessionAction(session.id, 'EXTEND')}
                            disabled={session.status !== 'ACTIVE'}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            +30 min
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal Create Session */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvelle Session de Gaming"
        size="md"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <Label htmlFor="customerSearch">Rechercher un client *</Label>
            <Input
              id="customerSearch"
              placeholder="Nom, téléphone..."
              onChange={(e) => searchCustomers(e.target.value)}
            />
            {customers.length > 0 && (
              <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2 hover:bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 cursor-pointer text-sm"
                    onClick={() => {
                      setFormData({ ...formData, customerId: customer.id })
                      setCustomers([])
                    }}
                  >
                    {customer.firstName} {customer.lastName} - {customer.phone}
                  </div>
                ))}
              </div>
            )}
            {formData.customerId && (
              <div className="mt-2 text-sm text-green-600">
                Client sélectionné: {customers.find(c => c.id === formData.customerId)?.firstName} {customers.find(c => c.id === formData.customerId)?.lastName}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="equipment">Équipement *</Label>
            <select
              id="equipment"
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              required
            >
              <option value="">Sélectionner un équipement</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {getEquipmentLabel(eq.type)} - {eq.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="duration">Durée *</Label>
            <select
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">1 heure</option>
              <option value="120">2 heures</option>
              <option value="180">3 heures</option>
            </select>
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
              Créer la Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
