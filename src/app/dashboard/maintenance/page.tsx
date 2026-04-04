'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Wrench, Plus, AlertCircle, Clock } from 'lucide-react'

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

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([])
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
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      // Simuler des données pour l'instant
      const mockTickets: MaintenanceTicket[] = []
      setTickets(mockTickets)
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
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { label: string; variant: any }> = {
      LOW: { label: 'Faible', variant: 'default' },
      MEDIUM: { label: 'Moyen', variant: 'warning' },
      HIGH: { label: 'Élevé', variant: 'danger' },
      URGENT: { label: 'Urgent', variant: 'danger' },
    }

    const config = priorityConfig[priority] || priorityConfig.MEDIUM
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      OPEN: { label: 'Ouvert', variant: 'info' },
      IN_PROGRESS: { label: 'En cours', variant: 'warning' },
      WAITING_PARTS: { label: 'Attente pièces', variant: 'warning' },
      RESOLVED: { label: 'Résolu', variant: 'success' },
      CLOSED: { label: 'Fermé', variant: 'default' },
    }

    const config = statusConfig[status] || statusConfig.OPEN
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
              <p className="text-sm text-gray-600 mt-1">
                Tickets et diagnostic des équipements
              </p>
            </div>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Ticket
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-500">
              Chargement...
            </CardContent>
          </Card>
        ) : tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun ticket de maintenance
              </h3>
              <p className="text-gray-600 mb-6">
                Créez un ticket pour signaler un problème ou planifier une maintenance
              </p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un Ticket
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ticket.ticketNumber} - {ticket.title}
                        </h3>
                        {getPriorityBadge(ticket.priority)}
                        {getStatusBadge(ticket.status)}
                      </div>

                      <p className="text-gray-600 mb-3">{ticket.description}</p>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Wrench className="w-4 h-4" />
                          {ticket.equipment.name} ({ticket.equipment.code})
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="ghost">
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal New Ticket */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouveau Ticket de Maintenance"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="equipment">Équipement concerné *</Label>
            <select
              id="equipment"
              value={formData.equipmentId}
              onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
              required
            >
              <option value="">Sélectionner un équipement</option>
            </select>
          </div>

          <div>
            <Label htmlFor="title">Titre du problème *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Écran défectueux, Manette HS..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description détaillée</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le problème en détail..."
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="priority">Priorité</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyen</option>
              <option value="HIGH">Élevé</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Annuler
            </Button>
            <Button type="submit">Créer le Ticket</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
