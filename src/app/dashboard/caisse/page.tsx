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
    equipmentType: 'PS5',
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

      const [reservationsRes, equipmentRes] = await Promise.all([
        fetch(`/api/dashboard/reservations?date=${selectedDate}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`),
        fetch('/api/dashboard/equipment/status'),
      ])

      const reservationsData = await reservationsRes.json()
      const equipmentData = await equipmentRes.json()

      setReservations(reservationsData.reservations || [])
      setEquipment(equipmentData.equipment || [])
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
          equipmentType: 'PS5',
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
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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

  const equipmentTypes = ['PS5', 'PS4', 'XBOX_SERIES_X', 'PC_GAMING', 'OCULUS_VR', 'VR_PS4', 'SIMU_RACING']

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Caisse</h1>
          <p className="text-slate-600 mt-1">Gestion des réservations et sessions du jour</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowWalkInModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Client Walk-in
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Réservations</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{reservations.length}</p>
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
                <p className="text-sm font-medium text-slate-600">En Attente</p>
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
                <p className="text-sm font-medium text-slate-600">Équipements Disponibles</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
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
                <p className="text-sm font-medium text-slate-600">Sessions Actives</p>
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
            <Button variant="outline" size="sm" onClick={fetchData}>
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
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{eq.code}</h4>
                    <p className="text-sm text-slate-600">{eq.name}</p>
                  </div>
                  <Badge className={getStatusColor(eq.status)}>
                    {eq.status === 'AVAILABLE' ? 'Disponible' : eq.status === 'IN_USE' ? 'Occupé' : eq.status}
                  </Badge>
                </div>

                {eq.activeSession && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{eq.activeSession.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Timer className="w-4 h-4" />
                      <span>
                        Reste: {formatTime(eq.activeSession.timeRemaining)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Phone className="w-4 h-4" />
                      <span>{eq.activeSession.customerPhone}</span>
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-600">Santé:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          eq.healthScore >= 80 ? 'bg-green-500' : eq.healthScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${eq.healthScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{eq.healthScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
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
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg"
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
                        <p className="font-medium text-slate-900">
                          {reservation.customer.firstName} {reservation.customer.lastName}
                        </p>
                        <p className="text-sm text-slate-600">{reservation.customer.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">{reservation.equipment.name}</p>
                        <p className="text-sm text-slate-600">{reservation.equipment.code}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(reservation.startTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(reservation.endTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{reservation.duration} min</td>
                    <td className="py-3 px-4 font-medium text-slate-900">
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
                            variant="outline"
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

      {/* Walk-in Modal */}
      <Modal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        title="Nouveau Client Walk-in"
      >
        <form onSubmit={handleWalkInSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={walkInForm.firstName}
                onChange={(e) => setWalkInForm({ ...walkInForm, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={walkInForm.lastName}
                onChange={(e) => setWalkInForm({ ...walkInForm, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={walkInForm.email}
                onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                value={walkInForm.phone}
                onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipmentType">Type d'équipement *</Label>
              <select
                id="equipmentType"
                value={walkInForm.equipmentType}
                onChange={(e) => setWalkInForm({ ...walkInForm, equipmentType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              >
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="duration">Durée (minutes) *</Label>
              <select
                id="duration"
                value={walkInForm.duration}
                onChange={(e) => setWalkInForm({ ...walkInForm, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              >
                <option value={60}>1 heure</option>
                <option value={120}>2 heures</option>
                <option value={180}>3 heures</option>
                <option value={240}>4 heures</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentMethod">Méthode de paiement *</Label>
              <select
                id="paymentMethod"
                value={walkInForm.paymentMethod}
                onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                required
              >
                <option value="CASH">Espèces</option>
                <option value="MOBILE_MONEY_ORANGE">Orange Money</option>
                <option value="MOBILE_MONEY_MTN">MTN Mobile Money</option>
                <option value="CARD">Carte bancaire</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isPaid"
                checked={walkInForm.isPaid}
                onChange={(e) => setWalkInForm({ ...walkInForm, isPaid: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isPaid">Payé</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={walkInForm.notes}
              onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })}
              placeholder="Notes optionnelles..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWalkInModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Créer Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
