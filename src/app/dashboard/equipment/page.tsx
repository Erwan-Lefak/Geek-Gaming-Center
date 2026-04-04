'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Monitor, Settings, Activity, AlertCircle } from 'lucide-react'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
            <p className="text-sm text-gray-600 mt-1">
              Gestion et maintenance du parc matériel
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{equipment.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.AVAILABLE || 0}</div>
                <div className="text-sm text-gray-600">Disponibles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.IN_USE || 0}</div>
                <div className="text-sm text-gray-600">En cours</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.MAINTENANCE || 0}</div>
                <div className="text-sm text-gray-600">Maintenance</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.BROKEN || 0}</div>
                <div className="text-sm text-gray-600">En panne</div>
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
                    <p className="text-sm text-gray-600 mt-1">{getEquipmentTypeLabel(eq.type)}</p>
                  </div>
                  {getStatusBadge(eq.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Code</span>
                    <span className="font-medium">{eq.code}</span>
                  </div>

                  {eq.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Emplacement</span>
                      <span className="font-medium">{eq.location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Santé</span>
                    <span className={`font-bold ${getHealthScoreColor(eq.healthScore)}`}>
                      {eq.healthScore}%
                    </span>
                  </div>

                  {eq.lastMaintenance && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Dernière maintenance</span>
                      <span className="text-gray-900">
                        {new Date(eq.lastMaintenance).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1">
                      <Settings className="w-4 h-4 mr-1" />
                      Maintenance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              Aucun équipement trouvé
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
