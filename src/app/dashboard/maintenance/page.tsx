'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Wrench, Plus, Clock, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  DashBadge,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
} from '../components/dash-ui'

interface MaintenanceTicket {
  id: string
  ticketNumber: string
  title: string
  description: string
  priority: string
  status: string
  createdAt: string
  equipment: {
    name: string
    code: string
  }
  assignedTo?: {
    name: string
  }
}

const priorityMeta: Record<string, { label: string; tone: 'slate' | 'amber' | 'rose' }> = {
  LOW: { label: 'Faible', tone: 'slate' },
  MEDIUM: { label: 'Moyen', tone: 'amber' },
  HIGH: { label: 'Élevé', tone: 'rose' },
  URGENT: { label: 'Urgent', tone: 'rose' },
}

const ticketStatusMeta: Record<string, { label: string; tone: 'sky' | 'amber' | 'emerald' | 'slate' }> = {
  OPEN: { label: 'Ouvert', tone: 'sky' },
  IN_PROGRESS: { label: 'En cours', tone: 'amber' },
  WAITING_PARTS: { label: 'Attente pièces', tone: 'amber' },
  RESOLVED: { label: 'Résolu', tone: 'emerald' },
  CLOSED: { label: 'Fermé', tone: 'slate' },
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
  const [equipment, setEquipment] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    equipmentId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
  })

  useEffect(() => {
    fetchTickets()
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment')
      const data = await response.json()
      setEquipment(data.equipment || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    }
  }

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/maintenance/tickets')
      const data = await response.json()
      setTickets(data.tickets || [])
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/maintenance/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowModal(false)
        setFormData({
          equipmentId: '',
          title: '',
          description: '',
          priority: 'MEDIUM',
        })
        fetchTickets()
        fetchEquipment() // Refresh equipment status
        alert('Ticket créé avec succès!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création')
    }
  }

  const handleDeleteTicket = async (ticketId: string, ticketTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le ticket "${ticketTitle}" ?`)) {
      return
    }

    try {
      const response = await fetch(`/api/maintenance/tickets/${ticketId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTickets()
        fetchEquipment() // Refresh equipment status
        alert('Ticket supprimé avec succès!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Maintenance"
        description="Tickets et diagnostic des équipements"
        actions={
          <button onClick={() => setShowModal(true)} className={dashBtnPrimaryCls}>
            <Plus className="h-4 w-4" />
            Nouveau ticket
          </button>
        }
      />

      {loading && tickets.length === 0 ? (
        <div className="dash-card py-12 text-center text-sm text-slate-500">Chargement…</div>
      ) : tickets.length === 0 ? (
        <div className="dash-card">
          <DashEmpty
            icon={Wrench}
            title="Aucun ticket de maintenance"
            hint="Créez un ticket pour signaler un problème ou planifier une maintenance"
          />
          <div className="flex justify-center pb-6">
            <button onClick={() => setShowModal(true)} className={dashBtnPrimaryCls}>
              <Plus className="h-4 w-4" />
              Créer un ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => {
            const priority = priorityMeta[ticket.priority] ?? priorityMeta.MEDIUM
            const status = ticketStatusMeta[ticket.status] ?? ticketStatusMeta.OPEN
            return (
              <DashCard key={ticket.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-semibold text-slate-100">
                        {ticket.ticketNumber} — {ticket.title}
                      </h3>
                      <DashBadge label={priority.label} tone={priority.tone} />
                      <DashBadge label={status.label} tone={status.tone} />
                    </div>

                    <p className="mb-3 text-sm text-slate-400">{ticket.description}</p>

                    <div className="flex flex-wrap items-center gap-5 text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="h-4 w-4" />
                        {ticket.equipment.name} ({ticket.equipment.code})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button className={cn(dashBtnGhostCls, 'px-3 text-xs')}>Détails</button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id, ticket.title)}
                      title="Supprimer"
                      className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </DashCard>
            )
          })}
        </div>
      )}

      {/* Modal : nouveau ticket */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouveau ticket de maintenance"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Équipement et priorité */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">
              Équipement et priorité
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="equipment" className="mb-1 block text-sm text-slate-400">
                  Équipement concerné <span className="text-rose-400">*</span>
                </label>
                <select
                  id="equipment"
                  value={formData.equipmentId}
                  onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                  className={dashSelectCls}
                  required
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.code}) - {eq.type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="mb-1 block text-sm text-slate-400">Priorité</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className={dashSelectCls}
                >
                  <option value="LOW">Faible</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HIGH">Élevé</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description du problème */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-100">
              Description du problème
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <label htmlFor="title" className="mb-1 block text-sm text-slate-400">
                  Titre du problème <span className="text-rose-400">*</span>
                </label>
                <input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex : Écran défectueux, Manette HS…"
                  required
                  className={dashInputCls}
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-1 block text-sm text-slate-400">
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez le problème en détail…"
                  className={cn(dashInputCls, 'min-h-[100px]')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowModal(false)} className={dashBtnOutlineCls}>
              Annuler
            </button>
            <button type="submit" className={dashBtnPrimaryCls}>
              Créer le ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
