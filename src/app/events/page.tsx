'use client'

import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, Users, Ticket, ChevronLeft, ChevronRight, Info, Filter, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
}

type EventFilter = 'all' | 'COSPLAY' | 'TOURNAMENT' | 'GAME_LAUNCH' | 'SPECIAL' | 'CINE' | 'ANNIVERSARY'

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filterType, setFilterType] = useState<EventFilter>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [numberOfTickets, setNumberOfTickets] = useState<number>(1)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (response.ok) {
          const data = await response.json()
          setEvents(data)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchEvents()
  }, [])

  // Filter events
  const filteredEvents = events.filter(event => {
    const typeMatch = filterType === 'all' || event.type === filterType
    const eventDate = new Date(event.eventDate)
    const dateMatch = selectedDate ?
      eventDate.toDateString() === selectedDate.toDateString() :
      eventDate >= new Date()
    return typeMatch && dateMatch
  })

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startingDayOfWeek = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  // Check if a date has events
  const hasEventsOnDate = (date: Date): boolean => {
    return events.some(event => {
      const eventDate = new Date(event.eventDate)
      return eventDate.toDateString() === date.toDateString() &&
        eventDate >= new Date(new Date().setHours(0, 0, 0, 0))
    })
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => {
      const eventDate = new Date(event.eventDate)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isPastDate = (date: Date): boolean => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDateSelect = (date: Date) => {
    if (!isPastDate(date)) {
      setSelectedDate(date)
    }
  }

  // Get available slots
  const getAvailableSlots = (event: Event) => {
    return event.maxCapacity - event.bookedCount
  }

  // Event type labels
  const eventTypeLabels: Record<string, string> = {
    'COSPLAY': 'Cosplay',
    'TOURNAMENT': 'Tournoi',
    'GAME_LAUNCH': 'Lancement Jeu',
    'SPECIAL': 'Spécial',
    'CINE': 'Cinéma',
    'ANNIVERSARY': 'Anniversaire',
    'all': 'Tous les types'
  }

  // Calculate total price
  const totalPrice = selectedEvent ? selectedEvent.price * numberOfTickets : 0

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 pt-36 sm:pt-40 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjIiIGZpbGw9IiMzYjgyZjYiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Événements Otaku</h1>
          <p className="text-blue-300 text-base sm:text-lg">Découvrez nos événements à venir</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6">
          {/* Left Side - Calendar (70%) */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-blue-300 font-semibold text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square"></div>
                }

                const isSelected = selectedDate && isSameDay(date, selectedDate)
                const isPast = isPastDate(date)
                const isToday = isSameDay(date, new Date())
                const hasEvents = hasEventsOnDate(date)

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-xl font-semibold transition-all duration-200 relative
                      ${isSelected
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg scale-105'
                        : isToday
                        ? 'bg-blue-600/30 text-white border-2 border-blue-500'
                        : isPast
                        ? 'text-gray-600 cursor-not-allowed opacity-30'
                        : 'bg-white/5 text-white hover:bg-white/10 hover:scale-102'
                      }
                    `}
                  >
                    <span className="relative z-10">{date.getDate()}</span>
                    {hasEvents && !isPast && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
              <div className="mt-6 p-4 bg-blue-600/20 rounded-xl">
                <p className="text-blue-200 text-sm">Date sélectionnée</p>
                <p className="text-white font-bold text-lg">{formatDate(selectedDate)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <CalendarIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-300 text-sm">
                    {getEventsForDate(selectedDate).length} événement{getEventsForDate(selectedDate).length > 1 ? 's' : ''} ce jour
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Filters & Events (30%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Type Filter */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Filtres</h3>
              </div>
              <label className="block text-sm font-semibold text-blue-200 mb-3">
                Type d'événement
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as EventFilter)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(eventTypeLabels).map(([value, label]) => (
                  <option key={value} value={value} className="bg-gray-900">
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Events List */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">
                    {selectedDate ? 'Événements du jour' : 'Événements à venir'}
                  </h3>
                </div>
                <span className="text-blue-300 text-sm">{filteredEvents.length}</span>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-blue-300">Aucun événement trouvé</p>
                  </div>
                ) : (
                  filteredEvents.map((event) => {
                    const availableSlots = getAvailableSlots(event)
                    const isFull = availableSlots === 0

                    return (
                      <div
                        key={event.id}
                        className={`bg-white/5 rounded-xl p-4 border transition-all ${
                          isFull
                            ? 'border-red-500/30 opacity-60'
                            : 'border-white/10 hover:border-blue-500/50 cursor-pointer'
                        }`}
                        onClick={() => !isFull && setSelectedEvent(event)}
                      >
                        <div className="flex items-start gap-3">
                          {event.imageUrl && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm mb-1 truncate">{event.title}</h4>
                            <p className="text-xs text-blue-300 mb-2">
                              {eventTypeLabels[event.type]} • {event.startTime}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`text-sm font-bold ${isFull ? 'text-red-400' : 'text-cyan-400'}`}>
                                {isFull ? 'COMPLET' : `${availableSlots} places`}
                              </span>
                              <span className="text-sm font-bold text-white">
                                {event.price === 0 ? 'Gratuit' : `${event.price}F`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Info */}
            {!selectedDate && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Info</h3>
                </div>
                <p className="text-blue-200 text-sm">
                  Sélectionnez une date dans le calendrier pour voir les événements disponibles.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-blue-950 rounded-2xl border border-blue-700 max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-blue-300 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold text-white mb-4">{selectedEvent.title}</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-blue-300">
                <span>Date:</span>
                <span className="text-white font-semibold">{formatDate(new Date(selectedEvent.eventDate))}</span>
              </div>
              <div className="flex justify-between text-blue-300">
                <span>Heure:</span>
                <span className="text-white font-semibold">{selectedEvent.startTime}</span>
              </div>
              <div className="flex justify-between text-blue-300">
                <span>Prix unitaire:</span>
                <span className="text-white font-semibold">
                  {selectedEvent.price === 0 ? 'Gratuit' : `${selectedEvent.price.toLocaleString()} FCFA`}
                </span>
              </div>

              <div>
                <label className="block text-blue-300 font-semibold mb-2">Nombre de places:</label>
                <select
                  value={numberOfTickets}
                  onChange={(e) => setNumberOfTickets(parseInt(e.target.value))}
                  className="w-full bg-blue-900/50 border border-blue-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: Math.min(getAvailableSlots(selectedEvent), 10) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} place{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-blue-700 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="text-white font-bold">Total:</span>
                  <span className="text-cyan-400 font-bold">
                    {selectedEvent.price === 0 ? 'Gratuit' : `${totalPrice.toLocaleString()} FCFA`}
                  </span>
                </div>
              </div>
            </div>

            <button
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold uppercase rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all"
              onClick={() => {
                // TODO: Implement booking logic
                alert(`Réservation de ${numberOfTickets} place(s) pour ${selectedEvent.title}`)
                setSelectedEvent(null)
              }}
            >
              Confirmer la réservation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
