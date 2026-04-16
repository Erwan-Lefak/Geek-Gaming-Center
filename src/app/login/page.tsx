'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Get redirect parameter from URL on mount
  const [redirectPath, setRedirectPath] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      if (redirect) {
        setRedirectPath(redirect)
      }
    }
  }, [])

  // Afficher un état de chargement pendant la vérification de la session
  if (status === 'loading') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center pt-40 sm:pt-44 lg:pt-48">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-200 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
      } else if (result?.ok) {
        // Login successful - wait for session and check email verification
        setLoading(true)
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 500))

        // Get the session to check email verification and determine redirect
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const sessionData = await response.json()
          const userRole = sessionData?.user?.role
          const userId = sessionData?.user?.id

          // For customers, check if email is verified
          if (userRole === 'CUSTOMER' && userId) {
            try {
              const checkResponse = await fetch(`/api/auth/check-email-verification?userId=${userId}`)
              if (checkResponse.ok) {
                const checkData = await checkResponse.json()
                if (!checkData.emailVerified) {
                  // Email not verified - redirect to warning page
                  window.location.href = '/verify-email-warning'
                  return
                }
              }
            } catch (err) {
              console.error('Error checking email verification:', err)
              // Continue with login if check fails
            }

            // Email verified, check for redirect path
            if (redirectPath) {
              // Check if there are saved parameters in sessionStorage
              const savedParams = sessionStorage.getItem('bookingRedirect') ||
                                sessionStorage.getItem('cartRedirect')

              if (savedParams) {
                // For booking or cart, restore the full URL with parameters
                if (redirectPath.includes('/arena/booking/confirm')) {
                  const bookingParams = sessionStorage.getItem('bookingRedirect')
                  if (bookingParams) {
                    window.location.href = redirectPath + bookingParams
                    sessionStorage.removeItem('bookingRedirect')
                    return
                  }
                } else if (redirectPath.includes('/cart') || redirectPath.includes('/store/cart')) {
                  sessionStorage.removeItem('cartRedirect')
                  window.location.href = redirectPath
                  return
                }
              }

              // No saved params, just redirect to the path
              window.location.href = redirectPath
            } else {
              // No redirect, proceed to account
              window.location.href = '/account'
            }
          } else {
            // Admin or other role, proceed to dashboard
            window.location.href = '/dashboard'
          }
        } else {
          // Fallback to dashboard if we can't get session
          window.location.href = '/dashboard'
        }
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-40 sm:pt-44 lg:pt-48">
      <div className="w-full max-w-6xl mx-auto">
        {/* Container principal unifié */}
        <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Section formulaire */}
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="w-full">
              {error && (
                <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-purple-200 mb-3">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-14 pr-5 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-purple-200 mb-3">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-14 pr-14 py-4 text-lg bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-6 w-6" />
                      ) : (
                        <Eye className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <a
                    href="/register"
                    className="text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    Pas encore inscrit ? S'inscrire
                  </a>
                  <a
                    href="/forgot-password"
                    className="text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 text-lg font-bold bg-white text-purple-900 hover:bg-purple-50 rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion...
                    </span>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              {/* Comptes de démonstration */}
              <div className="mt-10 pt-8 border-t border-white/20">
                <p className="text-sm font-semibold text-purple-300 mb-5 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Comptes de démonstration (cliquez pour remplir)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { role: 'Admin', email: 'admin@ggc.cm', pass: 'admin123', color: 'from-purple-500 to-pink-500' },
                    { role: 'Gérant', email: 'manager@ggc.cm', pass: 'manager123', color: 'from-blue-500 to-cyan-500' },
                    { role: 'Caissière', email: 'caissiere@ggc.cm', pass: 'cashier123', color: 'from-green-500 to-emerald-500' },
                    { role: 'Technicien', email: 'technicien@ggc.cm', pass: 'tech123', color: 'from-orange-500 to-amber-500' },
                  ].map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => {
                        setEmail(account.email)
                        setPassword(account.pass)
                      }}
                      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${account.color}`}></div>
                        <span className="text-sm font-semibold text-purple-200">{account.role}</span>
                      </div>
                      <p className="text-sm text-purple-400 group-hover:text-purple-300 transition-colors">
                        {account.email}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-center">
            <p className="text-purple-300 text-sm">
              © 2026 Geek Gaming Center - Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
