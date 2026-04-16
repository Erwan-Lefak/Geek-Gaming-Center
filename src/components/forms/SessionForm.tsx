'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SessionFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  equipment: Array<{
    id: string
    type: string
    code: string
    name: string
  }>
  customers: Array<{
    id: string
    firstName: string
    lastName: string
    phone: string
  }>
  onSearchCustomers: (query: string) => void
  loading?: boolean
}

export function SessionForm({
  onSubmit,
  onCancel,
  equipment,
  customers,
  onSearchCustomers,
  loading = false,
}: SessionFormProps) {
  const [formData, setFormData] = useState({
    customerId: '',
    equipmentId: '',
    duration: 60,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.customerId) {
      setError('Veuillez sélectionner un client')
      return
    }
    if (!formData.equipmentId) {
      setError('Veuillez sélectionner un équipement')
      return
    }
    if (formData.duration < 15) {
      setError('La durée minimum est de 15 minutes')
      return
    }

    try {
      await onSubmit(formData)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    }
  }

  const getEquipmentLabel = (type: string) => {
    const labels: Record<string, string> = {
      PS5: 'PlayStation 5',
      PS4: 'PlayStation 4',
      XBOX_SERIES_X: 'Xbox Series X',
      PC_GAMING: 'PC Gaming',
      OCULUS_VR: 'Oculus VR',
      VR_PS4: 'VR PS4',
      SIMU_RACING: 'Simulateur Racing',
    }
    return labels[type] || type
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Client */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
          Client
        </h3>
        <div className="w-full">
          <Label htmlFor="customerSearch" className="text-sm">Rechercher un client *</Label>
          <Input
            id="customerSearch"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              onSearchCustomers(e.target.value)
            }}
            className="w-full h-10 sm:h-auto"
            placeholder="Rechercher par nom, téléphone..."
            style={{
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)'
            }}
          />
        </div>

        {customers.length > 0 && (
          <div className="mt-2 max-h-48 overflow-y-auto border rounded-md" style={{ borderColor: 'var(--border)' }}>
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => {
                  setFormData({ ...formData, customerId: customer.id })
                  setSearchQuery(`${customer.firstName} ${customer.lastName}`)
                }}
                className={`p-3 cursor-pointer transition-colors border-b ${
                  formData.customerId === customer.id
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                style={{ color: 'var(--foreground)' }}
              >
                <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Equipment & Duration */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
          Détails de la session
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="w-full">
            <Label htmlFor="equipment" className="text-sm">Équipement *</Label>
            <select
              id="equipment"
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              required
              className="w-full h-10 px-3 py-2 rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              style={{ borderColor: 'var(--border)' }}
            >
              <option value="">Sélectionner</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {getEquipmentLabel(eq.type)}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <Label htmlFor="duration" className="text-sm">Durée (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              min="15"
              step="15"
              required
              className="w-full h-10 sm:h-auto"
              placeholder="60"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                borderColor: 'var(--border)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Création en cours...' : 'Créer la session'}
        </Button>
      </div>
    </form>
  )
}
