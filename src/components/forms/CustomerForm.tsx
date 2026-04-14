'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CustomerFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  initialData?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    howDidYouFindUs?: string
    howDidYouFindUsDetails?: string
    notes?: string
    dateOfBirth?: string
  }
  submitLabel?: string
  cancelLabel?: string
  includePassword?: boolean
  error?: string
}

export function CustomerForm({
  onSubmit,
  onCancel,
  initialData = {},
  submitLabel = 'Enregistrer',
  cancelLabel = 'Annuler',
  includePassword = false,
  error: propError,
}: CustomerFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    password: '',
    confirmPassword: '',
    address: initialData.address || '',
    city: initialData.city || '',
    howDidYouFindUs: initialData.howDidYouFindUs || '',
    howDidYouFindUsDetails: initialData.howDidYouFindUsDetails || '',
    notes: initialData.notes || '',
    dateOfBirth: initialData.dateOfBirth || '',
    acceptTerms: false,
  })
  const [error, setError] = useState(propError || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation des mots de passe si inclus
    if (includePassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }
      if (formData.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères')
        return
      }
    }

    // Validation de base
    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions générales')
      return
    }

    if (!formData.address || formData.address.length < 5) {
      setError("L'adresse doit contenir au moins 5 caractères")
      return
    }

    if (!formData.howDidYouFindUs) {
      setError('Veuillez indiquer comment vous nous avez connu')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Informations personnelles */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="w-full">
            <Label htmlFor="firstName" className="text-sm">Prénom *</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
              minLength={2}
              className="w-full h-10 sm:h-auto"
              placeholder="Jean"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="lastName" className="text-sm">Nom *</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
              minLength={2}
              className="w-full h-10 sm:h-auto"
              placeholder="Dupont"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-10 sm:h-auto"
              placeholder="jean.dupont@example.com"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="phone" className="text-sm">Téléphone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              minLength={9}
              className="w-full h-10 sm:h-auto"
              placeholder="+237 600 000 000"
            />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="address" className="text-sm">Adresse *</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              minLength={5}
              className="w-full h-10 sm:h-auto"
              placeholder="Votre adresse complète"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="city" className="text-sm">Ville</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full h-10 sm:h-auto"
              placeholder="Douala"
            />
          </div>

          <div className="w-full">
            <Label htmlFor="dateOfBirth" className="text-sm">Date de naissance</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full h-10 sm:h-auto"
            />
          </div>
        </div>
      </div>

      {/* Mot de passe - optionnel */}
      {includePassword && (
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
            Mot de passe
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="w-full">
              <Label htmlFor="password" className="text-sm">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="w-full h-10 sm:h-auto"
                placeholder="••••••••"
              />
            </div>

            <div className="w-full">
              <Label htmlFor="confirmPassword" className="text-sm">Confirmer le mot de passe *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full h-10 sm:h-auto"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      )}

      {/* Comment nous avez-vous connu */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
          Comment nous avez-vous connu ?
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div className="w-full">
            <Label htmlFor="howDidYouFindUs" className="text-sm">Source *</Label>
            <select
              id="howDidYouFindUs"
              value={formData.howDidYouFindUs}
              onChange={(e) => setFormData({ ...formData, howDidYouFindUs: e.target.value })}
              required
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all h-10 sm:h-auto"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            >
              <option value="">Sélectionnez une option</option>
              <option value="friends">Bouche à oreille / Amis</option>
              <option value="social_media">Réseaux sociaux</option>
              <option value="google">Google / Recherche en ligne</option>
              <option value="advertisement">Publicité</option>
              <option value="walking_by">En passant devant</option>
              <option value="event">Événement</option>
              <option value="other">Autre</option>
              <option value="dashboard">Dashboard (créé par staff)</option>
            </select>
          </div>

          {formData.howDidYouFindUs === 'other' && (
            <div className="w-full">
              <Label htmlFor="howDidYouFindUsDetails" className="text-sm">Précisions (optionnel)</Label>
              <Input
                id="howDidYouFindUsDetails"
                type="text"
                value={formData.howDidYouFindUsDetails}
                onChange={(e) => setFormData({ ...formData, howDidYouFindUsDetails: e.target.value })}
                className="w-full h-10 sm:h-auto"
                placeholder="Dites-nous en plus si vous le souhaitez"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notes - optionnel */}
      <div>
        <Label htmlFor="notes" className="text-sm">Notes</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="flex w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[80px] resize-y transition-colors"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)'
          }}
          placeholder="Notes supplémentaires..."
        />
      </div>

      {/* Conditions */}
      <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border transition-colors" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
        <input
          type="checkbox"
          id="acceptTerms"
          checked={formData.acceptTerms}
          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
          required
          className="rounded mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-colors accent-blue-500"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--background)'
          }}
        />
        <div className="flex-1 min-w-0">
          <Label htmlFor="acceptTerms" className="text-xs sm:text-sm font-medium leading-tight" style={{ color: 'var(--foreground)' }}>
            J'accepte les conditions générales de vente <span className="text-red-500">*</span>
          </Label>
        </div>
      </div>

      {/* Boutons */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {loading ? 'Enregistrement...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
