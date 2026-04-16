'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2, Calendar, Clock, Gamepad2 } from 'lucide-react'

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [bookingDetails, setBookingDetails] = useState<any>(null)

  useEffect(() => {
    const confirmBooking = async () => {
      const sessionId = searchParams.get('session_id')

      if (!sessionId) {
        setStatus('error')
        setMessage('Aucune session de paiement trouvée')
        return
      }

      try {
        // Call API to confirm booking and get details
        const response = await fetch(`/api/arena/booking/success?session_id=${sessionId}`)
        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setBookingDetails(data.booking)
          setMessage('Votre réservation a été confirmée avec succès !')
        } else {
          setStatus('error')
          setMessage(data.error || 'Erreur lors de la confirmation de la réservation')
        }
      } catch (error) {
        console.error('Error confirming booking:', error)
        setStatus('error')
        setMessage('Erreur lors de la confirmation de la réservation')
      }
    }

    confirmBooking()
  }, [searchParams])

  const handleBackToArena = () => {
    router.push('/arena/booking')
  }

  const handleGoToAccount = () => {
    router.push('/account')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center pt-[9rem] md:pt-[7rem] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 lg:p-16">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            {status === 'loading' && (
              <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
            {status === 'loading' && 'Confirmation en cours...'}
            {status === 'success' && 'Réservation Confirmée !'}
            {status === 'error' && 'Erreur de Confirmation'}
          </h1>

          {/* Message */}
          <p className="text-purple-300 text-center mb-8 text-base">
            {message}
          </p>

          {/* Booking Details */}
          {status === 'success' && bookingDetails && (
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                Détails de la Réservation
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-purple-200">
                  <Gamepad2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-400">Équipement</p>
                    <p className="text-white font-semibold">{bookingDetails.equipment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-purple-200">
                  <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-400">Date</p>
                    <p className="text-white font-semibold">
                      {new Date(bookingDetails.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-purple-200">
                  <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-400">Heure</p>
                    <p className="text-white font-semibold">{bookingDetails.startTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-purple-200">
                  <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-purple-400">Durée</p>
                    <p className="text-white font-semibold">{bookingDetails.duration} minutes</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBackToArena}
              className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-lg border border-white/20"
            >
              Nouvelle Réservation
            </button>

            {status === 'success' && (
              <button
                onClick={handleGoToAccount}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all text-lg"
              >
                Voir mes Réservations
              </button>
            )}
          </div>

          {status === 'success' && (
            <p className="text-center text-purple-400 text-sm mt-6">
              Un email de confirmation a été envoyé à votre adresse email
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center pt-[9rem] md:pt-[7rem] pb-8 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
              Confirmation en cours...
            </h1>
          </div>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
