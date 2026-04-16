'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Monitor, Settings, Activity, AlertCircle, Plus, Trash2, Edit } from 'lucide-react'

interface Equipment {
  id: string
  name: string
  type: string
  code: string
  status: string
  healthScore: number
  location?: string
  lastMaintenance?: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'PS5' as const,
    code: '',
    status: 'AVAILABLE' as const,
    healthScore: 100,
    location: '',
    hourlyRate: 0,
  })

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/equipment')
      const data = await response.json()
      setEquipment(data.equipment || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      setShowCreateModal(false)
      setFormData({
        name: '',
        type: 'PS5',
        code: '',
        status: 'AVAILABLE',
        healthScore: 100,
        location: '',
        hourlyRate: 0,
      })
      fetchEquipment()
      alert('Équipement créé avec succès!')
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création')
    }
  }

  const handleDeleteEquipment = async (equipmentId: string, equipmentName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${equipmentName}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      fetchEquipment()
      alert('Équipement supprimé avec succès!')
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      AVAILABLE: { label: 'Disponible', variant: 'success', icon: Activity },
      IN_USE: { label: 'En cours', variant: 'info', icon: Monitor },
      RESERVED: { label: 'Réservé', variant: 'warning', icon: AlertCircle },
      MAINTENANCE: { label: 'Maintenance', variant: 'danger', icon: Settings },
      BROKEN: { label: 'Panne', variant: 'danger', icon: AlertCircle },
    }

    const config = statusConfig[status] || statusConfig.AVAILABLE
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getEquipmentTypeLabel = (type: string) => {
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

  const filteredEquipment = filter === 'all'
    ? equipment
    : equipment.filter(eq => eq.status === filter)

  const statusCounts = equipment.reduce((acc, eq) => {
    acc[eq.status] = (acc[eq.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="min-h-screen mt-28 lg:mt-20 flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-slate-900" style={{ color: 'var(--foreground)' }}>Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen mt-28 lg:mt-20" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ color: 'var(--foreground)' }}>Équipements</h1>
              <p className="text-sm text-slate-900 mt-1" style={{ color: 'var(--foreground)' }}>
                Gestion et maintenance du parc matériel
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nouvel Équipement
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ backgroundColor: 'var(--background)' }}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900" style={{ color: 'var(--foreground)' }}>{equipment.length}</div>
                <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.AVAILABLE || 0}</div>
                <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>Disponibles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.IN_USE || 0}</div>
                <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>En cours</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.MAINTENANCE || 0}</div>
                <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>Maintenance</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.BROKEN || 0}</div>
                <div className="text-sm text-slate-900" style={{ color: 'var(--foreground)' }}>En panne</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
          >
            Tous ({equipment.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'AVAILABLE' ? 'default' : 'ghost'}
            onClick={() => setFilter('AVAILABLE')}
          >
            Disponibles ({statusCounts.AVAILABLE || 0})
          </Button>
          <Button
            size="sm"
            variant={filter === 'IN_USE' ? 'default' : 'ghost'}
            onClick={() => setFilter('IN_USE')}
          >
            En cours ({statusCounts.IN_USE || 0})
          </Button>
          <Button
            size="sm"
            variant={filter === 'MAINTENANCE' ? 'default' : 'ghost'}
            onClick={() => setFilter('MAINTENANCE')}
          >
            Maintenance ({statusCounts.MAINTENANCE || 0})
          </Button>
          <Button
            size="sm"
            variant={filter === 'BROKEN' ? 'default' : 'ghost'}
            onClick={() => setFilter('BROKEN')}
          >
            En panne ({statusCounts.BROKEN || 0})
          </Button>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => (
            <Card key={eq.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{eq.name}</CardTitle>
                    <p className="text-sm text-slate-900 mt-1" style={{ color: 'var(--foreground)' }}>{getEquipmentTypeLabel(eq.type)}</p>
                  </div>
                  {getStatusBadge(eq.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-900" style={{ color: 'var(--foreground)' }}>Code</span>
                    <span className="font-medium">{eq.code}</span>
                  </div>

                  {eq.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-900" style={{ color: 'var(--foreground)' }}>Emplacement</span>
                      <span className="font-medium">{eq.location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-900" style={{ color: 'var(--foreground)' }}>Santé</span>
                    <span className={`font-bold ${getHealthScoreColor(eq.healthScore)}`}>
                      {eq.healthScore}%
                    </span>
                  </div>

                  {eq.lastMaintenance && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-900" style={{ color: 'var(--foreground)' }}>Dernière maintenance</span>
                      <span className="text-slate-900" style={{ color: 'var(--foreground)' }}>
                        {new Date(eq.lastMaintenance).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Maintenance
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-slate-900" style={{ color: 'var(--foreground)' }}>
              Aucun équipement trouvé
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de création d'équipement */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel Équipement"
        size="xl"
      >
        <form onSubmit={handleCreateEquipment} className="space-y-4 sm:space-y-6">
          {/* Section: Informations de base */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
              Informations de base
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name" className="text-sm">Nom de l'équipement *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full h-10 sm:h-auto"
                  placeholder="Ex: PS5 - Zone VIP"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>

              <div className="w-full">
                <Label htmlFor="type" className="text-sm">Type d'équipement *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                  className="w-full h-10 sm:h-auto px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="PS5">PlayStation 5</option>
                  <option value="PS4">PlayStation 4</option>
                  <option value="XBOX_SERIES_X">Xbox Series X</option>
                  <option value="PC_GAMING">PC Gaming</option>
                  <option value="OCULUS_VR">Oculus VR</option>
                  <option value="VR_PS4">VR PS4</option>
                  <option value="SIMU_RACING">Simulateur Racing</option>
                </select>
              </div>

              <div className="w-full">
                <Label htmlFor="code" className="text-sm">Code unique *</Label>
                <Input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="w-full h-10 sm:h-auto"
                  placeholder="Ex: PS5-001"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>

              <div className="w-full">
                <Label htmlFor="location" className="text-sm">Emplacement</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-10 sm:h-auto"
                  placeholder="Ex: Zone A, Étage 1..."
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>

              <div className="w-full">
                <Label htmlFor="hourlyRate" className="text-sm">Taux horaire (FCFA)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full h-10 sm:h-auto"
                  placeholder="2000"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--border)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: État initial */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4" style={{ color: 'var(--foreground)' }}>
              État initial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="w-full">
                <Label htmlFor="status" className="text-sm">Statut *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  className="w-full h-10 sm:h-auto px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="MAINTENANCE">En maintenance</option>
                  <option value="BROKEN">En panne</option>
                </select>
              </div>

              <div className="w-full">
                <Label htmlFor="healthScore" className="text-sm">Score de santé (%)</Label>
                <Input
                  id="healthScore"
                  type="number"
                  value={formData.healthScore}
                  onChange={(e) => setFormData({ ...formData, healthScore: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  required
                  className="w-full h-10 sm:h-auto"
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
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              className="w-full sm:w-auto"
            >
              Annuler
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Créer l'Équipement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
