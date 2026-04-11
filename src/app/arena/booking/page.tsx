'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Gamepad2, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Equipment {
  id: string
  name: string
  type: string
  code: string
  pricePerHour: number
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function BookingPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all')
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Equipment pricing
  const equipmentPrices: Record<string, number> = {
    'PS5': 2000,
    'PS4': 1000,
    'XBOX Series X': 1500,
    'PC': 1500,
    'Oculus': 2500,
    'VR-PS4': 2500,
    'Simu Racing': 2000,
  }

  // Build equipment types dynamically from API data
  const equipmentTypes = [
    { value: 'all', label: 'Tous les équipements' },
    ...equipmentList.map(eq => ({
      value: eq.id,
      label: `${eq.name} (${eq.pricePerHour}F/h)`,
    })),
  ]

  // Generate time slots based on operating hours
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const dayOfWeek = selectedDate.getDay()
    const isSunday = dayOfWeek === 0

    // Operating hours: Mon-Sat 9h30-21h, Sun 12h-21h
    const startHour = isSunday ? 12 : 9
    const startMinute = isSunday ? 0 : 30
    const endHour = 21

    for (let hour = startHour; hour < endHour; hour++) {
      // Add slot at start time (9:30 or 12:00)
      if (hour === startHour && startMinute === 30) {
        slots.push({
          time: `${hour}:30`,
          available: Math.random() > 0.3, // Simulated availability
        })
      } else if (hour === startHour && startMinute === 0) {
        slots.push({
          time: `${hour}:00`,
          available: Math.random() > 0.3,
        })
      } else {
        // Add both :00 and :30 slots
        slots.push({
          time: `${hour}:00`,
          available: Math.random() > 0.3,
        })
        slots.push({
          time: `${hour}:30`,
          available: Math.random() > 0.3,
        })
      }
    }

    return slots
  }

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
      setSelectedSlot(null)
    }
  }

  const handleContinue = () => {
    if (selectedSlot && selectedEquipment !== 'all') {
      // Get selected equipment details
      const equipment = equipmentList.find(eq => eq.id === selectedEquipment)

      if (!equipment) {
        alert('Veuillez sélectionner un équipement')
        return
      }

      // Build confirmation URL with booking data
      const params = new URLSearchParams({
        equipment: selectedEquipment,
        equipmentName: equipment.name,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedSlot,
        duration: '60', // Default 1 hour
      })

      router.push(`/arena/booking/confirm?${params.toString()}`)
    } else if (selectedEquipment === 'all') {
      alert('Veuillez sélectionner un équipement spécifique')
    }
  }

  const handleWaitlist = () => {
    // TODO: Implement waitlist functionality
    alert('Fonctionnalité de liste d\'attente bientôt disponible !')
  }

  // Fetch equipment from API
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await fetch('/api/equipment?withPricing=true')
        const data = await response.json()

        if (response.ok) {
          // Transform equipment data
          const transformed = data.equipment.map((eq: any) => {
            // Get the 1-hour price
            const pricing1h = eq.pricing?.find((p: any) => p.duration === 60)
            const pricePerHour = pricing1h ? Number(pricing1h.price) : 0

            return {
              id: eq.id,
              name: eq.name,
              type: eq.type,
              code: eq.code,
              pricePerHour,
            }
          })

          setEquipmentList(transformed)
        }
      } catch (error) {
        console.error('Error fetching equipment:', error)
      }
    }

    fetchEquipment()
  }, [])

  // Fetch availability when date or equipment changes
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const equipmentParam = selectedEquipment !== 'all' ? `&equipmentId=${selectedEquipment}` : ''

        const response = await fetch(`/api/reservations/availability?date=${dateStr}${equipmentParam}`)
        const data = await response.json()

        if (response.ok) {
          setTimeSlots(data.slots)
        } else {
          // Fallback to generated slots if API fails
          setTimeSlots(generateTimeSlots())
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
        // Fallback to generated slots
        setTimeSlots(generateTimeSlots())
      }
    }

    fetchAvailability()
  }, [selectedDate, selectedEquipment])

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ]
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black pt-[9rem] md:pt-[7rem] pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiIGN5PSIzMyIgcj0iMzMiIGZpbGw9IiNmNmY2ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Réserver une Session</h1>
          <p className="text-purple-300 text-base sm:text-lg">Choisissez votre date, créneau et équipement</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 sm:gap-6">
          {/* Left Side - Calendar (70%) */}
          <div className="lg:col-span-7 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {dayNames.map(day => (
                <div key={day} className="text-center text-purple-300 font-semibold text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className="aspect-square"></div>
                }

                const isSelected = isSameDay(date, selectedDate)
                const isPast = isPastDate(date)
                const isToday = isSameDay(date, new Date())

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-xl font-semibold transition-all duration-200
                      ${isSelected
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                        : isToday
                        ? 'bg-purple-600/30 text-white border-2 border-purple-500'
                        : isPast
                        ? 'text-gray-600 cursor-not-allowed opacity-30'
                        : 'bg-white/5 text-white hover:bg-white/10 hover:scale-102'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            {/* Selected Date Display */}
            <div className="mt-6 p-4 bg-purple-600/20 rounded-xl">
              <p className="text-purple-200 text-sm">Date sélectionnée</p>
              <p className="text-white font-bold text-lg">{formatDate(selectedDate)}</p>
            </div>
          </div>

          {/* Right Side - Time Slots (30%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Equipment Filter */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <label className="block text-sm font-semibold text-purple-200 mb-3">
                Filtre par équipement
              </label>
              <select
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {equipmentTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slots */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Créneaux disponibles</h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {timeSlots.map((slot, index) => {
                  const isSelected = selectedSlot === slot.time

                  return (
                    <button
                      key={index}
                      onClick={() => slot.available && setSelectedSlot(slot.time)}
                      disabled={!slot.available}
                      className={`
                        w-full p-3 rounded-xl font-semibold transition-all duration-200 text-left
                        ${isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : slot.available
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-gray-800/50 text-gray-500 cursor-not-allowed line-through'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span>{slot.time}</span>
                        {!slot.available && <span className="text-xs">Indisponible</span>}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Waitlist Button */}
              <button
                onClick={handleWaitlist}
                className="w-full mt-4 p-3 rounded-xl font-semibold bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-300 transition-colors border border-yellow-600/50"
              >
                Liste d'attente
              </button>
            </div>

            {/* Pricing Info */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Tarifs</h3>
              </div>
              <div className="space-y-2 text-sm">
                {equipmentList.length > 0 ? (
                  equipmentList.map((equipment) => (
                    <div key={equipment.id} className="flex justify-between text-purple-200">
                      <span>{equipment.name}</span>
                      <span className="text-white font-semibold">{equipment.pricePerHour}F/h</span>
                    </div>
                  ))
                ) : (
                  <div className="text-purple-300 text-center">Chargement des tarifs...</div>
                )}
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedSlot}
              className={`
                w-full py-4 rounded-xl font-bold shadow-lg transform transition-all duration-200
                ${selectedSlot
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                }
              `}
            >
              Continuer
            </button>

            <p className="text-center text-purple-400 text-xs">
              Durée minimum : 1 heure. Annulation gratuite jusqu'à 2h avant le créneau.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
