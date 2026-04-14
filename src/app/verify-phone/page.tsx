'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function VerifyPhoneContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [customerId, setCustomerId] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [nextStep, setNextStep] = useState('')
  const [setupUrl, setSetupUrl] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [resending, setResending] = useState(false)

  // Get customerId from URL params
  useEffect(() => {
    const customer = searchParams.get('customer')
    if (customer) {
      setCustomerId(customer)
    } else {
      setError('Paramètre client manquant. Veuillez recommencer l\'inscription.')
    }
  }, [searchParams])

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }

    // Clear error when user types
    if (error) setError('')
  }

  // Handle key press
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)

    if (!/^\d+$/.test(pastedData)) return

    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setCode(newCode as [''])

    // Focus last filled input
    const lastIndex = pastedData.length - 1
    const lastInput = document.getElementById(`code-${lastIndex}`)
    lastInput?.focus()
  }

  // Submit verification code
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullCode = code.join('')

    if (fullCode.length !== 6) {
      setError('Veuillez entrer le code à 6 chiffres complet')
      return
    }

    if (!customerId) {
      setError('ID client manquant. Veuillez recommencer l\'inscription.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          code: fullCode
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setNextStep(data.data.nextStep)

        if (data.data.bothVerified && data.data.setupUrl) {
          setSetupUrl(data.data.setupUrl)
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push(data.data.setupUrl)
          }, 3000)
        } else if (data.data.emailVerified) {
          // Redirect to email verification page
          setTimeout(() => {
            router.push(`/verify-email?customer=${customerId}`)
          }, 3000)
        }
      } else {
        setError(data.error || 'Code de vérification invalide')
        setCode(['', '', '', '', '', ''])
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend SMS code
  const handleResend = async () => {
    if (!customerId || countdown > 0) return

    setResending(true)

    try {
      const response = await fetch(`/api/auth/verify-phone?customer=${customerId}`, {
        method: 'GET'
      })

      const data = await response.json()

      if (response.ok) {
        // Start 60-second countdown
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)

        setError('')
      } else {
        setError(data.error || 'Erreur lors de l\'envoi du SMS')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setResending(false)
    }
  }

  if (success && setupUrl) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Téléphone vérifié !</h1>
            <p className="text-gray-600 text-sm">{nextStep}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-900 mb-1">📧 Email envoyé !</p>
            <p className="text-xs text-gray-700">
              Tu vas recevoir un email pour créer ton mot de passe.<br />
              Redirection automatique...
            </p>
          </div>

          <button
            onClick={() => router.push(setupUrl)}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Créer mon mot de passe maintenant
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Téléphone vérifié !</h1>
            <p className="text-gray-600 text-sm">{nextStep}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-900 mb-1">✉️ Étape suivante :</p>
            <p className="text-xs text-gray-700">
              Vérifie maintenant ton email avec le lien qui t'a été envoyé.
            </p>
          </div>

          <button
            onClick={() => router.push(`/verify-email?customer=${customerId}`)}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Vérifier mon email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vérifie ton téléphone</h1>
          <p className="text-gray-600 text-sm">
            Entre le code à 6 chiffres reçu par SMS
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Code input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Code de vérification
            </label>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || code.join('').length !== 6}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Vérification...
              </>
            ) : (
              'Vérifier le code'
            )}
          </button>
        </form>

        {/* Resend link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Tu n'as pas reçu le code ?
          </p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {resending ? (
              'Envoi en cours...'
            ) : countdown > 0 ? (
              `Renvoyer dans ${countdown}s`
            ) : (
              'Renvoyer le code'
            )}
          </button>
        </div>

        {/* Back button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/register')}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Retour à l'inscription
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <VerifyPhoneContent />
    </Suspense>
  )
}
