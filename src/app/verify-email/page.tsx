'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')

      if (!token) {
        setStatus('error')
        setMessage('Lien de vérification invalide')
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)

        if (response.ok) {
          setStatus('success')
          setMessage('Email vérifié avec succès !')
        } else {
          const data = await response.json()
          setStatus('error')
          setMessage(data.error || 'Lien de vérification invalide ou expiré')
        }
      } catch (error) {
        setStatus('error')
        setMessage('Erreur lors de la vérification de l\'email')
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center px-4">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiBjeT0iMzMiIHI9IjMzIiBmaWxsPSIjZjZmNmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'loading' && (
              <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            )}
          </div>

          {/* Message */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            {status === 'loading' && 'Vérification en cours...'}
            {status === 'success' && 'Email Vérifié !'}
            {status === 'error' && 'Échec de la Vérification'}
          </h1>

          <p className="text-purple-300 text-center mb-8">
            {status === 'loading' && 'Veuillez patienter pendant que nous vérifions votre email...'}
            {status === 'success' && message}
            {status === 'error' && message}
          </p>

          {/* Action Button */}
          <div className="flex flex-col gap-4">
            {status === 'success' && (
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all"
              >
                Se Connecter
              </Link>
            )}
            {status === 'error' && (
              <>
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all"
                >
                  Créer un Compte
                </Link>
                <Link
                  href="/arena"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
                >
                  Retour à l'Accueil
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {status === 'success' && (
          <div className="mt-6 text-center">
            <p className="text-purple-300 text-sm">
              Vous pouvez maintenant vous connecter avec votre email et mot de passe.
            </p>
          </div>
        )}
        {status === 'error' && (
          <div className="mt-6 text-center">
            <p className="text-purple-300 text-sm">
              Le lien de vérification a peut-être expiré. Veuillez vous réinscrire pour recevoir un nouveau lien.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
