'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Calendar, Clock, Users, Ticket, Plus, Edit, Trash2, Eye, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  DashBadge,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
} from '../components/dash-ui'

interface Event {
  id: string
  title: string
  description: string
  type: string
  eventDate: string
  startTime: string
  endTime?: string
  price: number
  maxCapacity: number
  bookedCount: number
  imageUrl?: string
  location?: string
  isActive: boolean
  isPublished: boolean
}

type EventFilter = 'all' | 'COSPLAY' | 'TOURNAMENT' | 'GAME_LAUNCH' | 'SPECIAL' | 'CINE' | 'ANNIVERSARY'

const eventTypeLabels: Record<string, string> = {
  'COSPLAY': 'Cosplay',
  'TOURNAMENT': 'Tournoi',
  'GAME_LAUNCH': 'Lancement Jeu',
  'SPECIAL': 'Spécial',
  'CINE': 'Cinéma',
  'ANNIVERSARY': 'Anniversaire',
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [filterType, setFilterType] = useState<EventFilter>('all')
  const [viewingBookings, setViewingBookings] = useState<Event | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'SPECIAL' as EventFilter,
    eventDate: '',
    startTime: '',
    endTime: '',
    price: 0,
    maxCapacity: 100,
    imageUrl: '',
    location: '',
    isPublished: false
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?includePast=true')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events'
      const method = editingEvent ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save')

      await fetchEvents()
      setShowModal(false)
      setEditingEvent(null)
      resetForm()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      type: event.type as EventFilter,
      eventDate: event.eventDate.split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime || '',
      price: event.price,
      maxCapacity: event.maxCapacity,
      imageUrl: event.imageUrl || '',
      location: event.location || '',
      isPublished: event.isPublished
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' })
      await fetchEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'SPECIAL',
      eventDate: '',
      startTime: '',
      endTime: '',
      price: 0,
      maxCapacity: 100,
      imageUrl: '',
      location: '',
      isPublished: false
    })
  }

  const filteredEvents = events.filter(event =>
    filterType === 'all' || event.type === filterType
  )

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-b-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Gestion des événements"
        description="Créez et gérez vos événements Otaku"
        actions={
          <button
            onClick={() => {
              resetForm()
              setEditingEvent(null)
              setShowModal(true)
            }}
            className={dashBtnPrimaryCls}
          >
            <Plus className="h-4 w-4" />
            Nouvel événement
          </button>
        }
      />

      {/* Filtres */}
      <DashCard
        title={`${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''}`}
        action={
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventFilter)}
            className={cn(dashSelectCls, 'w-auto')}
          >
            <option value="all">Tous les types</option>
            {Object.entries(eventTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        }
      >
        {filteredEvents.length === 0 ? (
          <DashEmpty icon={CalendarDays} title="Aucun événement trouvé" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const availableSlots = event.maxCapacity - event.bookedCount
              const isFull = availableSlots === 0
              const almostFull = availableSlots <= 10 && availableSlots > 0
              const fillPct = Math.min(
                100,
                Math.round((event.bookedCount / Math.max(1, event.maxCapacity)) * 100)
              )

              return (
                <div
                  key={event.id}
                  className={cn(
                    'dash-card flex flex-col overflow-hidden',
                    isFull && 'border-rose-500/30',
                    almostFull && 'border-amber-500/30'
                  )}
                >
                  {/* Image */}
                  {event.imageUrl && (
                    <div className="relative h-44">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {eventTypeLabels[event.type]}
                        </span>
                        {!event.isActive && (
                          <span className="rounded-full bg-slate-600/80 px-3 py-1 text-xs font-semibold text-white">
                            Inactif
                          </span>
                        )}
                        {!event.isPublished && (
                          <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white">
                            Brouillon
                          </span>
                        )}
                      </div>
                      {isFull && (
                        <div className="absolute right-3 top-3">
                          <span className="animate-pulse rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white">
                            COMPLET
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="mb-1.5 text-lg font-bold text-slate-100">{event.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-slate-500">{event.description}</p>

                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-4 w-4 text-primary-400" />
                        {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-4 w-4 text-primary-400" />
                        {event.startTime} {event.endTime && `- ${event.endTime}`}
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <Ticket className="h-4 w-4 text-emerald-400" />
                        {event.price === 0 ? 'Gratuit' : `${event.price.toLocaleString('fr-FR')} FCFA`}
                      </div>
                    </div>

                    {/* Capacité */}
                    <div className="mb-4 mt-auto">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          {availableSlots} places dispo / {event.maxCapacity}
                        </span>
                        <span className={cn(
                          'font-semibold tabular-nums',
                          isFull ? 'text-rose-400' : almostFull ? 'text-amber-400' : 'text-slate-400'
                        )}>
                          {fillPct}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            isFull ? 'bg-rose-400' : almostFull ? 'bg-amber-400' : 'bg-primary-400'
                          )}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 border-t border-white/5 pt-3">
                      <button
                        onClick={() => setViewingBookings(event)}
                        className={cn(dashBtnOutlineCls, 'flex-1 justify-center py-2 text-xs')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Réservations
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className={cn(dashBtnOutlineCls, 'flex-1 justify-center py-2 text-xs')}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        title="Supprimer"
                        className="inline-flex items-center rounded-lg bg-rose-500/10 px-3 py-2 text-rose-300 transition-colors hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DashCard>

      {/* Modal : créer / modifier */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingEvent(null)
          resetForm()
        }}
        title={`${editingEvent ? 'Modifier' : 'Créer'} un événement`}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">
              Informations générales
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">
                  Titre <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={dashInputCls}
                  placeholder="Ex : Soirée Cosplay Anime"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={dashInputCls}
                  placeholder="Décrivez votre événement…"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Type <span className="text-rose-400">*</span>
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as EventFilter })}
                  className={dashSelectCls}
                >
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className={dashInputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Heure de début <span className="text-rose-400">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={dashInputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">Heure de fin</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={dashInputCls}
                />
              </div>
            </div>
          </div>

          {/* Tarification et capacité */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">
              Tarification et capacité
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label className="mb-1 block text-sm text-slate-400">Prix (FCFA)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className={dashInputCls}
                  placeholder="0 = Gratuit"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">
                  Capacité maximale <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
                  className={dashInputCls}
                />
              </div>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">
              Détails supplémentaires
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">Lieu</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={dashInputCls}
                  placeholder="Ex : Salle Principale"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm text-slate-400">URL de l&apos;image</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className={dashInputCls}
                  placeholder="https://…"
                />
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5"
                />
                <label htmlFor="isPublished" className="text-sm text-slate-300">
                  Publier l&apos;événement
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowModal(false)
                setEditingEvent(null)
                resetForm()
              }}
              className={dashBtnOutlineCls}
            >
              Annuler
            </button>
            <button type="submit" className={dashBtnPrimaryCls}>
              {editingEvent ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal : réservations */}
      <Modal
        isOpen={!!viewingBookings}
        onClose={() => setViewingBookings(null)}
        title="Réservations"
        size="lg"
      >
        {viewingBookings && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{viewingBookings.title}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {viewingBookings.bookedCount} / {viewingBookings.maxCapacity} places réservées
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.03] p-4">
              <p className="text-center text-sm text-slate-500">
                <DashBadge label="Bientôt disponible" tone="sky" className="mr-2" />
                La liste détaillée des réservations arrivera prochainement.
              </p>
            </div>

            <button onClick={() => setViewingBookings(null)} className={cn(dashBtnOutlineCls, 'w-full justify-center')}>
              Fermer
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
