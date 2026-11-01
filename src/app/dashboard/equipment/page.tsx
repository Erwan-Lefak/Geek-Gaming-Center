'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import {
  Monitor,
  Settings,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
  Gamepad2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashStat,
  DashEmpty,
  StatusBadge,
  equipmentStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
} from '../components/dash-ui'

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

  const getHealthTone = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 50) return 'text-amber-400'
    return 'text-rose-400'
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

  if (loading && equipment.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-sm text-slate-500">Chargement…</div>
      </div>
    )
  }

  const filterBtn = (key: string, label: string, count: number) => (
    <button
      key={key}
      onClick={() => setFilter(key)}
      className={cn(
        'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
        filter === key
          ? 'bg-primary-500/15 text-primary-300'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
      )}
    >
      {label} <span className="tabular-nums">({count})</span>
    </button>
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Équipements"
        description="Gestion et maintenance du parc matériel"
        actions={
          <button onClick={() => setShowCreateModal(true)} className={dashBtnPrimaryCls}>
            <Plus className="h-4 w-4" />
            Nouvel équipement
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <DashStat icon={Gamepad2} label="Total" value={equipment.length} tone="violet" />
        <DashStat icon={Activity} label="Disponibles" value={statusCounts.AVAILABLE || 0} tone="emerald" />
        <DashStat icon={Monitor} label="En cours" value={statusCounts.IN_USE || 0} tone="sky" />
        <DashStat icon={Settings} label="Maintenance" value={statusCounts.MAINTENANCE || 0} tone="amber" />
        <DashStat icon={AlertCircle} label="En panne" value={statusCounts.BROKEN || 0} tone="rose" />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-1.5">
        {filterBtn('all', 'Tous', equipment.length)}
        {filterBtn('AVAILABLE', 'Disponibles', statusCounts.AVAILABLE || 0)}
        {filterBtn('IN_USE', 'En cours', statusCounts.IN_USE || 0)}
        {filterBtn('MAINTENANCE', 'Maintenance', statusCounts.MAINTENANCE || 0)}
        {filterBtn('BROKEN', 'En panne', statusCounts.BROKEN || 0)}
      </div>

      {/* Grille des équipements */}
      {filteredEquipment.length === 0 ? (
        <div className="dash-card">
          <DashEmpty icon={Gamepad2} title="Aucun équipement trouvé" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEquipment.map((eq) => (
            <div key={eq.id} className="dash-card flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-slate-100">{eq.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {getEquipmentTypeLabel(eq.type)}
                  </p>
                </div>
                <StatusBadge status={eq.status} meta={equipmentStatusMeta} />
              </div>

              <div className="flex-1 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Code</span>
                  <span className="font-medium text-slate-200">{eq.code}</span>
                </div>

                {eq.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Emplacement</span>
                    <span className="font-medium text-slate-200">{eq.location}</span>
                  </div>
                )}

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-slate-500">Santé</span>
                    <span className={cn('font-bold tabular-nums', getHealthTone(eq.healthScore))}>
                      {eq.healthScore}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        eq.healthScore >= 80
                          ? 'bg-emerald-400'
                          : eq.healthScore >= 50
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                      )}
                      style={{ width: `${eq.healthScore}%` }}
                    />
                  </div>
                </div>

                {eq.lastMaintenance && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dernière maintenance</span>
                    <span className="text-slate-300">
                      {new Date(eq.lastMaintenance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2 border-t border-white/5 pt-3">
                <button className={cn(dashBtnOutlineCls, 'flex-1 justify-center py-2 text-xs')}>
                  <Settings className="h-3.5 w-3.5" />
                  Maintenance
                </button>
                <button
                  onClick={() => handleDeleteEquipment(eq.id, eq.name)}
                  title="Supprimer"
                  className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal : nouvel équipement */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel équipement"
        size="xl"
      >
        <form onSubmit={handleCreateEquipment} className="space-y-6">
          {/* Informations de base */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">
              Informations de base
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="mb-1 block text-sm text-slate-400">
                  Nom de l&apos;équipement <span className="text-rose-400">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className={dashInputCls}
                  placeholder="Ex : PS5 - Zone VIP"
                />
              </div>

              <div>
                <label htmlFor="type" className="mb-1 block text-sm text-slate-400">
                  Type d&apos;équipement <span className="text-rose-400">*</span>
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  required
                  className={dashSelectCls}
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

              <div>
                <label htmlFor="code" className="mb-1 block text-sm text-slate-400">
                  Code unique <span className="text-rose-400">*</span>
                </label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className={dashInputCls}
                  placeholder="Ex : PS5-001"
                />
              </div>

              <div>
                <label htmlFor="location" className="mb-1 block text-sm text-slate-400">Emplacement</label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={dashInputCls}
                  placeholder="Ex : Zone A, Étage 1…"
                />
              </div>

              <div>
                <label htmlFor="hourlyRate" className="mb-1 block text-sm text-slate-400">
                  Taux horaire (FCFA)
                </label>
                <input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 0 })}
                  min="0"
                  className={dashInputCls}
                  placeholder="2000"
                />
              </div>
            </div>
          </div>

          {/* État initial */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">État initial</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="status" className="mb-1 block text-sm text-slate-400">
                  Statut <span className="text-rose-400">*</span>
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  required
                  className={dashSelectCls}
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="MAINTENANCE">En maintenance</option>
                  <option value="BROKEN">En panne</option>
                </select>
              </div>

              <div>
                <label htmlFor="healthScore" className="mb-1 block text-sm text-slate-400">
                  Score de santé (%)
                </label>
                <input
                  id="healthScore"
                  type="number"
                  value={formData.healthScore}
                  onChange={(e) => setFormData({ ...formData, healthScore: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="100"
                  required
                  className={dashInputCls}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowCreateModal(false)} className={dashBtnOutlineCls}>
              Annuler
            </button>
            <button type="submit" className={dashBtnPrimaryCls}>
              Créer l&apos;équipement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
