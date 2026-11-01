'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import {
  Plus,
  Clock,
  User,
  Gamepad2,
  CheckCircle,
  Play,
  Phone,
  Timer,
  RefreshCw,
  Calendar,
  Banknote,
  Hourglass,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashStat,
  DashEmpty,
  StatusBadge,
  reservationStatusMeta,
  equipmentStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashTableHeadCls,
  dashTableRowCls,
} from '../components/dash-ui'

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
    equipmentId: '',
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
        fetch('/api/equipment?status=AVAILABLE'),
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
      alert("Erreur lors de l'action")
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

  const equipmentTone = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'border-emerald-500/25 bg-emerald-500/[0.04]'
      case 'IN_USE': return 'border-sky-500/25 bg-sky-500/[0.04]'
      case 'MAINTENANCE': return 'border-amber-500/25 bg-amber-500/[0.04]'
      case 'BROKEN': return 'border-rose-500/25 bg-rose-500/[0.04]'
      default: return 'border-white/10 bg-white/[0.03]'
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Caisse"
        description="Réservations, sessions et équipements du jour"
        actions={
          <button onClick={() => setShowWalkInModal(true)} className={dashBtnPrimaryCls}>
            <Plus className="h-4 w-4" />
            Client de passage
          </button>
        }
      />

      {/* Stats du jour */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashStat
          icon={Calendar}
          label="Réservations"
          value={reservations.length}
          tone="violet"
          hint={new Date(selectedDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        />
        <DashStat
          icon={Hourglass}
          label="En attente"
          value={reservations.filter(r => r.status === 'PENDING').length}
          tone="amber"
        />
        <DashStat
          icon={Gamepad2}
          label="Équipements dispo."
          value={equipment.filter(e => e.status === 'AVAILABLE').length}
          tone="emerald"
          hint={`${equipment.length} au total`}
        />
        <DashStat
          icon={Play}
          label="Sessions actives"
          value={equipment.filter(e => e.activeSession).length}
          tone="sky"
        />
      </div>

      {/* Réservations du jour */}
      <DashCard
        title={`Réservations du ${new Date(selectedDate).toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`}
        action={
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={cn(dashInputCls, 'w-auto')}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(dashSelectCls, 'w-auto')}
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="CHECKED_IN">Présent</option>
              <option value="COMPLETED">Terminé</option>
            </select>
          </div>
        }
      >
        {loading && reservations.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">Chargement…</div>
        ) : reservations.length === 0 ? (
          <DashEmpty
            icon={Clock}
            title="Aucune réservation pour cette date"
            hint="Les réservations payées en ligne apparaissent ici automatiquement"
          />
        ) : (
          <div className="overflow-x-auto dash-scroll">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th className={dashTableHeadCls}>Client</th>
                  <th className={dashTableHeadCls}>Équipement</th>
                  <th className={dashTableHeadCls}>Horaire</th>
                  <th className={dashTableHeadCls}>Durée</th>
                  <th className={dashTableHeadCls}>Prix</th>
                  <th className={dashTableHeadCls}>Statut</th>
                  <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className={dashTableRowCls}>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-200">
                        {reservation.customer.firstName} {reservation.customer.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{reservation.customer.phone}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-200">{reservation.equipment.name}</p>
                      <p className="text-xs text-slate-500">{reservation.equipment.code}</p>
                    </td>
                    <td className="py-3 pr-4 text-slate-300 tabular-nums">
                      {new Date(reservation.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' – '}
                      {new Date(reservation.endTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{reservation.duration} min</td>
                    <td className="py-3 pr-4 font-medium text-slate-200 tabular-nums">
                      {Number(reservation.estimatedPrice).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={reservation.status} meta={reservationStatusMeta} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {reservation.status === 'PENDING' && (
                          <button
                            onClick={() => handleReservationAction(reservation.id, 'confirm')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Confirmer
                          </button>
                        )}
                        {reservation.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleReservationAction(reservation.id, 'checkin')}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500/15 px-3 py-1.5 text-xs font-semibold text-primary-300 transition-colors hover:bg-primary-500/25"
                          >
                            <Play className="h-3.5 w-3.5" />
                            Démarrer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>

      {/* État des équipements */}
      <DashCard
        title="État des équipements"
        description="Disponibilité, sessions en cours et santé du matériel"
        action={
          <button onClick={fetchData} className={dashBtnOutlineCls}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </button>
        }
      >
        {equipment.length === 0 ? (
          <DashEmpty icon={Gamepad2} title="Aucun équipement enregistré" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {equipment.map((eq) => (
              <div
                key={eq.id}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  equipmentTone(eq.status)
                )}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-slate-100">{eq.code}</h4>
                    <p className="text-sm text-slate-500">{getEquipmentLabel(eq.type)} · {eq.name}</p>
                  </div>
                  <StatusBadge status={eq.status} meta={equipmentStatusMeta} />
                </div>

                {eq.activeSession && (
                  <div className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{eq.activeSession.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Timer className="h-4 w-4 text-slate-500" />
                      <span>
                        Reste :{' '}
                        <span className="font-medium text-slate-200">
                          {formatTime(eq.activeSession.timeRemaining)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>{eq.activeSession.customerPhone}</span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Santé</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        eq.healthScore >= 80
                          ? 'bg-emerald-400'
                          : eq.healthScore >= 50
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                      )}
                      style={{ width: `${eq.healthScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400 tabular-nums">
                    {eq.healthScore}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashCard>

      {/* Modal : client de passage */}
      <Modal
        isOpen={showWalkInModal}
        onClose={() => setShowWalkInModal(false)}
        title="Nouveau client de passage"
        size="xl"
      >
        <form onSubmit={handleWalkInSubmit} className="space-y-6">
          {/* Section: Client */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">Client</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm text-slate-400">
                  Prénom <span className="text-rose-400">*</span>
                </label>
                <input
                  id="firstName"
                  value={walkInForm.firstName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, firstName: e.target.value })}
                  required
                  className={dashInputCls}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm text-slate-400">
                  Nom <span className="text-rose-400">*</span>
                </label>
                <input
                  id="lastName"
                  value={walkInForm.lastName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, lastName: e.target.value })}
                  required
                  className={dashInputCls}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-slate-400">Email</label>
                <input
                  id="email"
                  type="email"
                  value={walkInForm.email}
                  onChange={(e) => setWalkInForm({ ...walkInForm, email: e.target.value })}
                  className={dashInputCls}
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm text-slate-400">
                  Téléphone <span className="text-rose-400">*</span>
                </label>
                <input
                  id="phone"
                  value={walkInForm.phone}
                  onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })}
                  required
                  className={dashInputCls}
                />
              </div>
            </div>
          </div>

          {/* Section: Détails de la session */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">Détails de la session</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="equipmentId" className="mb-1 block text-sm text-slate-400">
                  Équipement disponible <span className="text-rose-400">*</span>
                </label>
                <select
                  id="equipmentId"
                  value={walkInForm.equipmentId}
                  onChange={(e) => setWalkInForm({ ...walkInForm, equipmentId: e.target.value })}
                  className={dashSelectCls}
                  required
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
                  <p className="mt-1 text-xs text-amber-400">
                    ⚠️ Aucun équipement disponible — tous occupés ou en maintenance
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="duration" className="mb-1 block text-sm text-slate-400">
                  Durée <span className="text-rose-400">*</span>
                </label>
                <select
                  id="duration"
                  value={walkInForm.duration}
                  onChange={(e) => setWalkInForm({ ...walkInForm, duration: parseInt(e.target.value) })}
                  className={dashSelectCls}
                  required
                >
                  <option value={60}>1 heure</option>
                  <option value={120}>2 heures</option>
                  <option value={180}>3 heures</option>
                  <option value={240}>4 heures</option>
                </select>
              </div>
              <div>
                <label htmlFor="paymentMethod" className="mb-1 block text-sm text-slate-400">
                  Méthode de paiement <span className="text-rose-400">*</span>
                </label>
                <select
                  id="paymentMethod"
                  value={walkInForm.paymentMethod}
                  onChange={(e) => setWalkInForm({ ...walkInForm, paymentMethod: e.target.value })}
                  className={dashSelectCls}
                  required
                >
                  <option value="CASH">Espèces</option>
                  <option value="MOBILE_MONEY_ORANGE">Orange Money</option>
                  <option value="MOBILE_MONEY_MTN">MTN Mobile Money</option>
                  <option value="CARD">Carte bancaire</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-7">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={walkInForm.isPaid}
                  onChange={(e) => setWalkInForm({ ...walkInForm, isPaid: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="isPaid" className="text-sm text-slate-300">Payé</label>
              </div>
            </div>
          </div>

          {/* Section: Notes */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">Notes</h3>
            <input
              id="notes"
              value={walkInForm.notes}
              onChange={(e) => setWalkInForm({ ...walkInForm, notes: e.target.value })}
              placeholder="Notes optionnelles…"
              className={dashInputCls}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowWalkInModal(false)}
              className={dashBtnOutlineCls}
            >
              Annuler
            </button>
            <button type="submit" className={dashBtnPrimaryCls}>
              <Banknote className="h-4 w-4" />
              Créer la session
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
