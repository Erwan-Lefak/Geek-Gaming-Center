'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Ticket, Plus, Edit, Trash2, Eye, X } from 'lucide-react'

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

  const eventTypeLabels: Record<string, string> = {
    'COSPLAY': 'Cosplay',
    'TOURNAMENT': 'Tournoi',
    'GAME_LAUNCH': 'Lancement Jeu',
    'SPECIAL': 'Spécial',
    'CINE': 'Cinéma',
    'ANNIVERSARY': 'Anniversaire',
  }

  const filteredEvents = events.filter(event =>
    filterType === 'all' || event.type === filterType
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-28 lg:mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestion des Événements</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Créez et gérez vos événements Otaku</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingEvent(null)
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Nouvel Événement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-slate-700 font-medium">Filtrer par:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as EventFilter)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Tous les types</option>
            {Object.entries(eventTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <span className="text-slate-600 dark:text-slate-400 ml-auto">
            {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const availableSlots = event.maxCapacity - event.bookedCount
          const isFull = availableSlots === 0
          const almostFull = availableSlots <= 10 && availableSlots > 0

          return (
            <div
              key={event.id}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border-2 transition-all ${
                isFull ? 'border-red-300' : almostFull ? 'border-orange-300' : 'border-transparent hover:border-purple-200'
              }`}
            >
              {/* Image */}
              {event.imageUrl && (
                <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                      {eventTypeLabels[event.type]}
                    </span>
                    {!event.isActive && (
                      <span className="px-3 py-1 bg-slate-600 text-white text-xs font-semibold rounded-full">
                        Inactif
                      </span>
                    )}
                    {!event.isPublished && (
                      <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                        Brouillon
                      </span>
                    )}
                  </div>
                  {isFull && (
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                        COMPLET
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-purple-500" />
                    {event.startTime} {event.endTime && `- ${event.endTime}`}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4 text-purple-500" />
                    {availableSlots} places / {event.maxCapacity}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Ticket className="w-4 h-4 text-green-500" />
                    {event.price === 0 ? 'Gratuit' : `${event.price.toLocaleString()} FCFA`}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setViewingBookings(event)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Réservations
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">
                {editingEvent ? 'Modifier' : 'Créer'} un Événement
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingEvent(null)
                  resetForm()
                }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Soirée Cosplay Anime"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Décrivez votre événement..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EventFilter })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Heure de début *</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Heure de fin</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Prix (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0 = Gratuit"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-2">Capacité maximale *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">Lieu</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Ex: Salle Principale"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-medium mb-2">URL de l'image</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isPublished" className="text-slate-700 font-medium">
                    Publier l'événement
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingEvent(null)
                    resetForm()
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  {editingEvent ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bookings Modal */}
      {viewingBookings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Réservations</h2>
              <button
                onClick={() => setViewingBookings(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">{viewingBookings.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {viewingBookings.bookedCount} / {viewingBookings.maxCapacity} places réservées
              </p>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-600 dark:text-slate-400 text-center">
                  Fonctionnalité de visualisation des réservations à venir...
                </p>
              </div>

              <button
                onClick={() => setViewingBookings(null)}
                className="w-full mt-6 px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
