'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Clock, Gamepad2, User, LogOut, X, Check, ChevronRight } from 'lucide-react'

interface Reservation {
  id: string
  startTime: string
  scheduledEndAt: string
  duration: number
  status: string
  equipment: {
    name: string
    type: string
    code: string
  }
  price: number
}

export default function AccountPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [error, setError] = useState('')
  const [customer, setCustomer] = useState<any>(null)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to fetch reservations (requires auth)
        const response = await fetch('/api/reservations')

        if (response.status === 401) {
          // Not authenticated, redirect to login
          router.push('/login?redirect=/account')
          return
        }

        if (response.ok) {
          const data = await response.json()
          setReservations(data.reservations || [])

          // Get customer info from a cookie or session
          // For now, we'll just show reservations
        }
      } catch (err) {
        console.error('Error checking auth:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/customer/logout', { method: 'POST' })
      router.push('/arena')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from list
        setReservations(reservations.filter(r => r.id !== reservationId))
        alert('Réservation annulée avec succès !')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (err) {
      console.error('Cancel error:', err)
      alert('Erreur lors de l\'annulation')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + 'F'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      case 'PAUSED':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Confirmé'
      case 'ACTIVE':
        return 'En cours'
      case 'COMPLETED':
        return 'Terminé'
      case 'CANCELLED':
        return 'Annulé'
      case 'PAUSED':
        return 'En pause'
      default:
        return status
    }
  }

  const isCancellable = (reservation: Reservation) => {
    if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED') {
      return false
    }

    // Check if it's more than 2 hours before start
    const now = new Date()
    const startTime = new Date(reservation.startTime)
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursUntilStart >= 2
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiIGN5PSIzMyIgcj0iMzMiIGZpbGw9IiNmNmY2ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Mon Compte</h1>
            <p className="text-purple-300 text-base sm:text-lg">Gérez vos réservations</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link
              href="/arena/booking"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle Réservation</span>
              <span className="sm:hidden">Réserver</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Total Réservations</p>
                <p className="text-white text-2xl font-bold">{reservations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">À Venir</p>
                <p className="text-white text-2xl font-bold">
                  {reservations.filter(r =>
                    !['CANCELLED', 'COMPLETED'].includes(r.status)
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Heures Jouées</p>
                <p className="text-white text-2xl font-bold">
                  {reservations.reduce((acc, r) => acc + r.duration / 60, 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Mes Réservations</h2>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300 text-lg mb-4">Aucune réservation pour le moment</p>
              <Link
                href="/arena/booking"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Réserver une session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">
                          {reservation.equipment.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-purple-200">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(reservation.startTime)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-purple-200">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(reservation.startTime)} - {formatTime(reservation.scheduledEndAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-purple-200">
                          <span className="font-semibold text-white">
                            {formatPrice(Number(reservation.price))}
                          </span>
                          <span>({reservation.duration / 60}h)</span>
                        </div>
                      </div>
                    </div>

                    {isCancellable(reservation) && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl border border-red-600/50 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Link
            href="/arena"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Salle de Jeux</h3>
                  <p className="text-purple-300 text-sm">Découvrir nos équipements</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/arena/booking"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Réserver</h3>
                  <p className="text-purple-300 text-sm">Nouvelle réservation</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-pink-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
