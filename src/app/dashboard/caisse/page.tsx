'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Play,
  Pause,
  Square,
  Plus,
  Clock,
  User,
  Gamepad2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  CreditCard,
  Timer,
  RefreshCw,
  Calendar
} from 'lucide-react'

// Types
interface Equipment {
  id: string
  name: string
  type: string
  code: string
  status: string
  healthScore: number
  activeSession?: {
    id: string
    sessionNumber: string
    customer: string
    customerPhone: string
    scheduledEndAt: string
    timeRemaining: number
  }
}

interface Reservation {
  id: string
  reservationNumber: string
  startTime: string
  endTime: string
  duration: number
  estimatedPrice: number
  status: string
  timeRemaining: number
  isLate: boolean
  customer: {
    id: string
    firstName: string
    lastName: string
    phone: string
    email?: string
  }
  equipment: {
    id: string
    name: string
    type: string
    code: string
    status: string
  }
}

export default function CaissePage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [availableEquipment, setAvailableEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showWalkInModal, setShowWalkInModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Walk-in form
  const [walkInForm, setWalkInForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    equipmentId: '', // Changed from equipmentType to equipmentId
    duration: 60,
    paymentMethod: 'CASH',
    isPaid: false,
    notes: '',
  })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [selectedDate, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)

      const [reservationsRes, equipmentRes, availableEqRes] = await Promise.all([
        fetch(`/api/dashboard/reservations?date=${selectedDate}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`),
        fetch('/api/dashboard/equipment/status'),
        fetch('/api/equipment?status=AVAILABLE'), // Fetch available equipment
      ])

      const reservationsData = await reservationsRes.json()
      const equipmentData = await equipmentRes.json()
      const availableEqData = await availableEqRes.json()

      setReservations(reservationsData.reservations || [])
      setEquipment(equipmentData.equipment || [])
      setAvailableEquipment(availableEqData.equipment || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/dashboard/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(walkInForm),
      })

      const data = await response.json()

      if (response.ok) {
        setShowWalkInModal(false)
        setWalkInForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          equipmentId: '',
          duration: 60,
          paymentMethod: 'CASH',
          isPaid: false,
          notes: '',
        })
        fetchData()
        alert(data.message)
      } else {
        alert(data.error || 'Erreur lors de la création')
      }
    } catch (error) {
      console.error('Error creating walk-in:', error)
      alert('Erreur lors de la création')
    }
  }

  const handleReservationAction = async (reservationId: string, action: string) => {
    try {
      const response = await fetch(`/api/dashboard/reservations/${reservationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()

      if (response.ok) {
        fetchData()
        alert(data.message)
      } else {
        alert(data.error || 'Erreur')
      }
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Erreur lors de l\'action')
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`
    }
    return `${remainingMinutes}min`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'CHECKED_IN': return 'bg-purple-100 text-purple-800'
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-gray-100 text-slate-900 dark:text-white dark:text-slate-100-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-slate-900 dark:text-white dark:text-slate-100-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'CONFIRMED': return 'Confirmé'
      case 'CHECKED_IN': return 'Présent'
      case 'ACTIVE': return 'En cours'
      case 'COMPLETED': return 'Terminé'
      case 'CANCELLED': return 'Annulé'
      case 'NO_SHOW': return 'Absent'
      default: return status
    }
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
    <div className="w-full space-y-6 mt-28 lg:mt-20">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ color: 'var(--foreground)' }}>Caisse</h1>
          <p className="text-slate-600 mt-1" style={{ color: 'var(--foreground)' }}>Gestion des réservations et sessions du jour</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowWalkInModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Client de Passage
          </Button>
        </div>
      </div>

      {/* Reservations Table - MOVED TO TOP */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Réservations du {new Date(selectedDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)'
                }}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)'
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="PENDING">En attente</option>
                <option value="CONFIRMED">Confirmé</option>
                <option value="CHECKED_IN">Présent</option>
                <option value="COMPLETED">Terminé</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Client</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Équipement</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Horaire</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Durée</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Prix</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900" style={{ color: 'var(--foreground)' }}>
                          {reservation.customer.firstName} {reservation.customer.lastName}
                        </p>
                        <p className="text-sm text-slate-600" style={{ color: 'var(--foreground)' }}>{reservation.customer.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900" style={{ color: 'var(--foreground)' }}>{reservation.equipment.name}</p>
                        <p className="text-sm text-slate-600" style={{ color: 'var(--foreground)' }}>{reservation.equipment.code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900" style={{ color: 'var(--foreground)' }}>
                          {new Date(reservation.startTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-slate-600" style={{ color: 'var(--foreground)' }}>
                          {new Date(reservation.endTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{reservation.duration} min</td>
                    <td className="py-3 px-4 font-medium text-slate-900" style={{ color: 'var(--foreground)' }}>
                      {Number(reservation.estimatedPrice).toLocaleString()} FCFA
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(reservation.status)}>
                        {getStatusLabel(reservation.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {reservation.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReservationAction(reservation.id, 'confirm')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirmer
                          </Button>
                        )}
                        {reservation.status === 'CONFIRMED' && (
                          <Button
                            size="sm"
                            onClick={() => handleReservationAction(reservation.id, 'checkin')}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Démarrer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {reservations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      Aucune réservation pour cette date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600" style={{ color: 'var(--foreground)' }}>Total Réservations</p>
                <p className="text-3xl font-bold text-slate-900 mt-2" style={{ color: 'var(--foreground)' }}>{reservations.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600" style={{ color: 'var(--foreground)' }}>En Attente</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {reservations.filter(r => r.status === 'PENDING').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600" style={{ color: 'var(--foreground)' }}>Équipements Disponibles</p>
                <p className="text-3xl font-bold text-green-600 mt-2" style={{ color: 'var(--foreground)' }}>
                  {equipment.filter(e => e.status === 'AVAILABLE').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Gamepad2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600" style={{ color: 'var(--foreground)' }}>Sessions Actives</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {equipment.filter(e => e.activeSession).length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Play className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              État des Équipements
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className={`border-2 rounded-xl p-4 transition-all ${
                  eq.status === 'AVAILABLE'
                    ? 'border-green-200 bg-green-50 hover:border-green-300'
                    : eq.status === 'IN_USE'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-slate-200'
                }`}
                style={{
                  backgroundColor: eq.status !== 'AVAILABLE' && eq.status !== 'IN_USE' ? 'var(--background)' : undefined,
                  borderColor: eq.status !== 'AVAILABLE' && eq.status !== 'IN_USE' ? 'var(--border)' : undefined
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900" style={{ color: 'var(--foreground)' }}>{eq.code}</h4>
                    <p className="text-sm text-slate-600" style={{ color: 'var(--foreground)' }}>{eq.name}</p>
                  </div>
                  <Badge
                    className={getStatusColor(eq.status)}
                    style={{
                      backgroundColor: eq.status === 'AVAILABLE' ? 'rgba(34, 197, 94, 0.2)' :
                                     eq.status === 'IN_USE' ? 'rgba(59, 130, 246, 0.2)' :
                                     undefined,
                      color: 'var(--foreground)'
                    }}
                  >
                    {eq.status === 'AVAILABLE' ? 'Disponible' : eq.status === 'IN_USE' ? 'Occupé' : eq.status}
                  </Badge>
                </div>

                {eq.activeSession && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{eq.activeSession.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600" style={{ color: 'var(--foreground)' }}>
                      <Timer className="w-4 h-4" />
                      <span>
                        Reste: {formatTime(eq.activeSession.timeRemaining)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1" style={{ color: 'var(--foreground)' }}>
                      <Phone className="w-4 h-4" />
                      <span>{eq.activeSession.customerPhone}</span>
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600" style={{ color: 'var(--foreground)' }}>Santé:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          eq.healthScore >= 80 ? 'bg-green-500' : eq.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${eq.healthScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700" style={{ color: 'var(--foreground)' }}>{eq.healthScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Walk-in Modal */}
      <Modal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        title="Nouveau Client de Passage"
        size="xl"
      >
        <form onSubmit={handleWalkInSubmit} className="space-y-4 sm:space-y-6">
          {/* Section: Client */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
              Client
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="w-full">
                <Label htmlFor="firstName" className="text-sm">Prénom *</Label>
                <Input
                  id="firstName"
                  value={walkInForm.firstName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, firstName: e.target.value })}
                  required
                  className="w-full h-10 sm:h-auto"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>
              <div className="w-full">
                <Label htmlFor="lastName" className="text-sm">Nom *</Label>
                <Input
                  id="lastName"
                  value={walkInForm.lastName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, lastName: e.target.value })}
                  required
                  className="w-full h-10 sm:h-auto"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>
              <div className="w-full">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={walkInForm.email}
                  onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                  className="w-full h-10 sm:h-auto"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>
              <div className="w-full">
                <Label htmlFor="phone" className="text-sm">Téléphone *</Label>
                <Input
                  id="phone"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  required
                  className="w-full h-10 sm:h-auto"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Détails de la session */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
              Détails de la session
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="w-full">
                <Label htmlFor="equipmentId" className="text-sm">Équipement disponible *</Label>
                <select
                  id="equipmentId"
                  value={walkInForm.equipmentId}
                  onChange={(e) => setWalkInForm({ ...walkInForm, equipmentId: e.target.value })}
                  className="w-full h-10 sm:h-auto px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  style={{
                    borderColor: 'var(--border)'
                  }}
                >
                  <option value="">Sélectionner un équipement</option>
                  {availableEquipment.length > 0 ? (
                    availableEquipment.map(eq => (
                      <option key={eq.id} value={eq.id}>
                        {getEquipmentLabel(eq.type)} - {eq.name} ({eq.code})
                      </option>
                    ))
                  ) : (
                    <option disabled>Aucun équipement disponible</option>
                  )}
                </select>
                {availableEquipment.length === 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Aucun équipement disponible - Tous occupés ou en maintenance
                  </p>
                )}
              </div>
              <div className="w-full">
                <Label htmlFor="duration" className="text-sm">Durée (minutes) *</Label>
                <select
                  id="duration"
                  value={walkInForm.duration}
                  onChange={(e) => setWalkInForm({ ...walkInForm, duration: parseInt(e.target.value) })}
                  className="w-full h-10 sm:h-auto px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  style={{
                    borderColor: 'var(--border)'
                  }}
                >
                  <option value={60}>1 heure</option>
                  <option value={120}>2 heures</option>
                  <option value={180}>3 heures</option>
                  <option value={240}>4 heures</option>
                </select>
              </div>
              <div className="w-full">
                <Label htmlFor="paymentMethod" className="text-sm">Méthode de paiement *</Label>
                <select
                  id="paymentMethod"
                  value={walkInForm.paymentMethod}
                  onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
                  className="w-full h-10 sm:h-auto px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  style={{
                    borderColor: 'var(--border)'
                  }}
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY_ORANGE">Orange Money</option>
                  <option value="MOBILE_MONEY_MTN">MTN Mobile Money</option>
                  <option value="CARD">Carte bancaire</option>
                </select>
              </div>
              <div className="w-full flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={walkInForm.isPaid}
                  onChange={(e) => setWalkInForm({ ...walkInForm, isPaid: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isPaid" className="text-sm">Payé</Label>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
              Notes
            </h3>
            <div className="w-full">
              <Input
                id="notes"
                value={walkInForm.notes}
                onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })}
                placeholder="Notes optionnelles..."
                className="w-full h-10 sm:h-auto"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  borderColor: 'var(--border)'
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowWalkInModal(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Créer Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
