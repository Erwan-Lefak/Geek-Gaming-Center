'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, CreditCard, Smartphone, Wallet, ArrowLeft } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  type: string
  pricePerHour: number
}

function BookingConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [customer, setCustomer] = useState<any>(null)

  // Get booking data from URL params or state
  const [bookingData, setBookingData] = useState({
    equipmentId: searchParams.get('equipment') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    duration: parseInt(searchParams.get('duration') || '60'),
    equipment: searchParams.get('equipmentName') || 'Équipement',
    price: 0 as number | undefined,
  })

  const [selectedPayment, setSelectedPayment] = useState<string>('cash')

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/reservations')

        if (response.status === 401) {
          // Redirect to login with return URL
          router.push(`/login?redirect=${encodeURIComponent('/arena/booking/confirm')}`)
          return
        }

        if (response.ok) {
          // User is authenticated
          setCustomer({ authenticated: true })
        }
      } catch (err) {
        console.error('Auth check error:', err)
      }
    }

    checkAuth()
  }, [router])

  // Fetch real price from API
  useEffect(() => {
    const fetchPrice = async () => {
      if (!bookingData.equipmentId) return

      try {
        const date = new Date(bookingData.date)
        const isWeekend = date.getDay() === 0 || date.getDay() === 6

        const response = await fetch(
          `/api/pricing?equipmentId=${bookingData.equipmentId}&duration=${bookingData.duration}&isWeekend=${isWeekend}`
        )

        if (response.ok) {
          const data = await response.json()
          setBookingData(prev => ({
            ...prev,
            price: data.price,
          }))
        }
      } catch (err) {
        console.error('Price fetch error:', err)
      }
    }

    fetchPrice()
  }, [bookingData.equipmentId, bookingData.date, bookingData.duration])

  const calculatePrice = () => {
    // Use real price if fetched, otherwise calculate default
    return bookingData.price || bookingData.duration / 60 * 2000
  }

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      // Check if date is weekend
      const date = new Date(bookingData.date)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6

      // Get pricing ID first
      const pricingResponse = await fetch(
        `/api/pricing?equipmentId=${bookingData.equipmentId}&duration=${bookingData.duration}&isWeekend=${isWeekend}`
      )

      if (!pricingResponse.ok) {
        const error = await pricingResponse.json()
        alert(error.error || 'Erreur lors de la récupération du tarif')
        setIsLoading(false)
        return
      }

      const pricingData = await pricingResponse.json()

      // Create the reservation with correct pricing ID
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: bookingData.equipmentId,
          date: bookingData.date,
          startTime: bookingData.time,
          duration: bookingData.duration,
          pricingId: pricingData.pricingId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Redirect to success page
        router.push('/account?reservation=success')
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la réservation')
      }
    } catch (err) {
      console.error('Payment error:', err)
      alert('Erreur lors de la réservation')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const paymentMethods = [
    {
      id: 'cash',
      label: 'Paiement sur place',
      description: 'Payez en espèces à la salle',
      icon: Wallet,
      color: 'from-green-600 to-green-700',
    },
    {
      id: 'orange',
      label: 'Orange Money',
      description: 'Paiement mobile Orange Money',
      icon: Smartphone,
      color: 'from-orange-600 to-orange-700',
    },
    {
      id: 'mtn',
      label: 'MTN Mobile Money',
      description: 'Paiement mobile MTN',
      icon: Smartphone,
      color: 'from-yellow-600 to-yellow-700',
    },
    {
      id: 'wave',
      label: 'Wave',
      description: 'Paiement mobile Wave',
      icon: Smartphone,
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'stripe',
      label: 'Carte bancaire',
      description: 'Paiement par carte via Stripe',
      icon: CreditCard,
      color: 'from-purple-600 to-purple-700',
    },
  ]

  const price = calculatePrice()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiIGN5PSIzMyIgcj0iMzMiIGZpbGw9IiNmNmY2ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/arena/booking"
            className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour aux réservations
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Confirmer la Réservation</h1>
          <p className="text-purple-300 text-base sm:text-lg">Vérifiez les détails et choisissez votre moyen de paiement</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Booking Details */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Détails de la Réservation</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-purple-300">Équipement</span>
                  <span className="text-white font-semibold">{bookingData.equipment}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-purple-300">Date</span>
                  <span className="text-white font-semibold">{formatDate(bookingData.date)}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-purple-300">Heure</span>
                  <span className="text-white font-semibold">{bookingData.time}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-purple-300">Durée</span>
                  <span className="text-white font-semibold">{bookingData.duration / 60} heure(s)</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-purple-300 font-semibold text-lg">Total</span>
                  <span className="text-white font-bold text-2xl">
                    {new Intl.NumberFormat('fr-FR').format(price)}F
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Moyen de Paiement</h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedPayment === method.id

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      disabled={method.id !== 'cash'} // Only cash is available for now
                      className={`
                        w-full p-4 rounded-xl border-2 transition-all text-left
                        ${isSelected
                          ? `bg-gradient-to-r ${method.color} border-white/30`
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                        }
                        ${method.id !== 'cash' ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white/10'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{method.label}</h3>
                          <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-purple-300'}`}>
                            {method.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                        )}
                        {method.id !== 'cash' && (
                          <span className="text-xs text-yellow-300 bg-yellow-600/20 px-2 py-1 rounded-full">
                            Bientôt disponible
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="space-y-4 sm:space-y-6">
            {/* Price Summary */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white mb-4">Récapitulatif</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-purple-200">
                  <span>Prix de base</span>
                  <span>{new Intl.NumberFormat('fr-FR').format(price)}F</span>
                </div>

                <div className="flex justify-between text-purple-200">
                  <span>Frais de service</span>
                  <span>0F</span>
                </div>

                <div className="border-t border-white/20 pt-3 mt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('fr-FR').format(price)}F</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies */}
            <div className="bg-purple-600/10 border border-purple-600/30 rounded-3xl p-4 sm:p-6">
              <h3 className="text-white font-bold mb-3">Politique d'Annulation</h3>
              <ul className="space-y-2 text-sm text-purple-200">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Annulation gratuite jusqu'à 2h avant le créneau</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Modification possible jusqu'à 24h avant</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Présentation requise 15min avant le créneau</span>
                </li>
              </ul>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handlePayment}
              disabled={isLoading || selectedPayment !== 'cash'}
              className={`
                w-full py-4 rounded-xl font-bold shadow-lg transform transition-all duration-200
                ${isLoading || selectedPayment !== 'cash'
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:scale-105 cursor-pointer'
                }
              `}
            >
              {isLoading ? 'Traitement...' : 'Confirmer la Réservation'}
            </button>

            <p className="text-center text-purple-400 text-xs">
              En confirmant, vous acceptez nos Conditions Générales de Vente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  )
}
