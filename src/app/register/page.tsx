'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    howDidYouFindUs: '',
    howDidYouFindUsDetails: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue')
        return
      }

      // Redirection vers la page de connexion
      router.push('/login?registered=true')
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-40 sm:pt-44 lg:pt-48">
      <div className="w-full max-w-4xl mx-auto">
        {/* Container principal */}
        <div className="w-full bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Formulaire d'inscription */}
          <div className="p-8 sm:p-12">
            <div className="w-full">
              {error && (
                <div className="w-full bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Créer un compte</h1>
                <p className="text-purple-300">Rejoignez Geek Gaming Center</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Informations personnelles */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Informations personnelles</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-purple-200 mb-2">
                        Prénom *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        minLength={2}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Jean"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-purple-200 mb-2">
                        Nom *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        minLength={2}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Dupont"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="jean.dupont@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-purple-200 mb-2">
                        Téléphone *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        minLength={9}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="+237 600 000 000"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-purple-200 mb-2">
                        Adresse *
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        minLength={5}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Votre adresse complète"
                      />
                    </div>
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Mot de passe</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-2">
                        Mot de passe *
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200 mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                {/* Comment nous avez-vous connu */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Comment nous avez-vous connu ?</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="howDidYouFindUs" className="block text-sm font-medium text-purple-200 mb-2">
                        Source *
                      </label>
                      <select
                        id="howDidYouFindUs"
                        value={formData.howDidYouFindUs}
                        onChange={(e) => setFormData({ ...formData, howDidYouFindUs: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="" className="bg-slate-900">Sélectionnez une option</option>
                        <option value="friends" className="bg-slate-900">Bouche à oreille / Amis</option>
                        <option value="social_media" className="bg-slate-900">Réseaux sociaux</option>
                        <option value="google" className="bg-slate-900">Google / Recherche en ligne</option>
                        <option value="advertisement" className="bg-slate-900">Publicité</option>
                        <option value="walking_by" className="bg-slate-900">En passant devant</option>
                        <option value="event" className="bg-slate-900">Événement</option>
                        <option value="other" className="bg-slate-900">Autre</option>
                      </select>
                    </div>

                    {formData.howDidYouFindUs === 'other' && (
                      <div>
                        <label htmlFor="howDidYouFindUsDetails" className="block text-sm font-medium text-purple-200 mb-2">
                          Précisions (optionnel)
                        </label>
                        <input
                          id="howDidYouFindUsDetails"
                          type="text"
                          value={formData.howDidYouFindUsDetails}
                          onChange={(e) => setFormData({ ...formData, howDidYouFindUsDetails: e.target.value })}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Dites-nous en plus si vous le souhaitez"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Conditions */}
                <div className="mb-6">
                  <div className="flex items-start text-sm text-purple-300">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-4 h-4 mt-1 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 mr-3"
                    />
                    <label htmlFor="terms" className="cursor-pointer">
                      J'accepte les{' '}
                      <Link href="/cgv" className="text-purple-200 hover:text-white underline">
                        conditions générales
                      </Link>
                      {' '}et la{' '}
                      <Link href="/privacy" className="text-purple-200 hover:text-white underline">
                        politique de confidentialité
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Bouton */}
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
                      Inscription...
                    </span>
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-purple-300">
                  Déjà inscrit ?{' '}
                  <Link href="/login" className="text-purple-200 hover:text-white font-semibold underline">
                    Se connecter
                  </Link>
                </p>
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
