'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Mail, Phone, Calendar, MapPin, CreditCard, Lock, CheckCircle, XCircle } from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  dateOfBirth?: string
  address?: string
  city?: string
  status: string
  howDidYouFindUs?: string
  notes?: string
  acceptCGV: boolean
  cgvAcceptedAt?: string
  totalSpent: number
  totalHours: number
  visitCount: number
  lastVisit?: string
  createdAt: string
  password?: string
  is_active?: boolean
}

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (customerId) {
      fetchCustomer(customerId)
    }
  }, [customerId])

  const fetchCustomer = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${id}`)

      if (!response.ok) {
        throw new Error('Client non trouvé')
      }

      const data = await response.json()
      setCustomer(data.customer)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      NEW: { label: 'Nouveau', className: 'bg-blue-100 text-blue-800' },
      REGULAR: { label: 'Régulier', className: 'bg-green-100 text-green-800' },
      VIP: { label: 'VIP', className: 'bg-purple-100 text-purple-800' },
      INACTIVE: { label: 'Inactif', className: 'bg-gray-100 text-gray-800' },
    }

    const { label, className } = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' }
    return <Badge className={className}>{label}</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Chargement...</div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">{error || 'Client non trouvé'}</div>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ color: 'var(--foreground)' }}>
              {customer.firstName} {customer.lastName}
            </h1>
            <p className="text-slate-600 mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Client depuis le {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Button onClick={() => router.push(`/dashboard/customers?edit=${customer.id}`)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations Personnelles */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <div className="text-sm text-slate-600">Email</div>
                <div className="font-medium">{customer.email || 'Non renseigné'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-600" />
              <div>
                <div className="text-sm text-slate-600">Téléphone</div>
                <div className="font-medium">{customer.phone}</div>
              </div>
            </div>

            {customer.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Date de naissance</div>
                  <div className="font-medium">
                    {new Date(customer.dateOfBirth).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            )}

            {(customer.address || customer.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Adresse</div>
                  <div className="font-medium">
                    {customer.address}
                    {customer.city && `, ${customer.city}`}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="text-sm text-slate-600 mb-1">Statut</div>
              {getStatusBadge(customer.status)}
            </div>
          </CardContent>
        </Card>

        {/* Informations de compte */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600">Mot de passe</div>
                  <div className="font-medium">
                    {customer.password ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Défini
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        Non défini
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600">Statut du compte</div>
                <div className="font-medium">
                  {customer.is_active ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Inactif
                    </span>
                  )}
                </div>
              </div>
            </div>

            {customer.email && (
              <div className="pt-4 border-t">
                <div className="text-sm text-slate-600 mb-2">Connexion client</div>
                <div className="bg-slate-50 p-3 rounded text-sm">
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p className="text-slate-600 mt-1">
                    {customer.password
                      ? 'Le client peut se connecter avec son email et son mot de passe'
                      : 'Le client doit d\'abord définir son mot de passe via le lien envoyé par email'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-slate-600" />
              <div className="flex-1">
                <div className="text-sm text-slate-600">Total Dépensé</div>
                <div className="text-2xl font-bold">
                  {customer.totalSpent.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-sm text-slate-600">Visites</div>
                <div className="text-xl font-semibold">{customer.visitCount}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Heures Totales</div>
                <div className="text-xl font-semibold">{Number(customer.totalHours).toFixed(1)}h</div>
              </div>
            </div>

            {customer.lastVisit && (
              <div className="pt-4 border-t">
                <div className="text-sm text-slate-600">Dernière Visite</div>
                <div className="font-medium">
                  {new Date(customer.lastVisit).toLocaleDateString('fr-FR')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations Supplémentaires */}
        {(customer.howDidYouFindUs || customer.notes) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informations Supplémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.howDidYouFindUs && (
                <div>
                  <div className="text-sm text-slate-600 mb-1">Comment nous a-t-il connu ?</div>
                  <div className="font-medium">{customer.howDidYouFindUs}</div>
                  {customer.howDidYouFindUsDetails && (
                    <div className="text-sm text-slate-600 mt-1">
                      {customer.howDidYouFindUsDetails}
                    </div>
                  )}
                </div>
              )}

              {customer.notes && (
                <div>
                  <div className="text-sm text-slate-600 mb-1">Notes</div>
                  <div className="text-sm bg-slate-50 p-3 rounded">
                    {customer.notes}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-slate-600">CGV Acceptées</div>
                <div className="text-sm">
                  {customer.cgvAcceptedAt
                    ? `Oui, le ${new Date(customer.cgvAcceptedAt).toLocaleDateString('fr-FR')}`
                    : 'Non'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
