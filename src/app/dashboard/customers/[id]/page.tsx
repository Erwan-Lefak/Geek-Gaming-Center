'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Lock,
  CheckCircle,
  XCircle,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DashCard,
  DashStat,
  DashEmpty,
  StatusBadge,
  customerStatusMeta,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
} from '../../components/dash-ui'

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
  howDidYouFindUsDetails?: string
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
  const [plainPassword, setPlainPassword] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string>('')
  const [loadingPassword, setLoadingPassword] = useState(false)

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

  const fetchPassword = async () => {
    if (!customer) return

    try {
      setLoadingPassword(true)
      setPasswordMessage('')

      const response = await fetch(`/api/customers/${customer.id}/password`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }))
        throw new Error(errorData.error || 'Impossible de récupérer le mot de passe')
      }

      const data = await response.json()

      if (data.message) {
        setPasswordMessage(data.message)
        setPlainPassword(null)
      } else {
        setPlainPassword(data.password)
        setPasswordMessage('')
      }
    } catch (err: any) {
      console.error('Error fetching password:', err)
      setPasswordMessage(`Erreur: ${err.message}`)
    } finally {
      setLoadingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Chargement…
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="dash-card py-16 text-center">
        <p className="text-sm text-rose-300">{error || 'Client non trouvé'}</p>
        <button onClick={() => router.back()} className={cn(dashBtnOutlineCls, 'mt-4')}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* En-tête */}
      <div>
        <button
          onClick={() => router.back()}
          className={cn(dashBtnOutlineCls, 'mb-3 px-3 py-1.5 text-xs')}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour à la liste
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-lg font-bold text-white">
              {customer.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-50 lg:text-2xl">
                  {customer.firstName} {customer.lastName}
                </h1>
                <StatusBadge status={customer.status} meta={customerStatusMeta} />
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                Client depuis le {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/customers?edit=${customer.id}`)}
            className={dashBtnPrimaryCls}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashStat
          icon={CreditCard}
          label="Total dépensé"
          value={`${customer.totalSpent.toLocaleString('fr-FR')} FCFA`}
          tone="emerald"
        />
        <DashStat icon={UserRound} label="Visites" value={customer.visitCount} tone="sky" />
        <DashStat
          icon={Calendar}
          label="Heures de jeu"
          value={`${Number(customer.totalHours).toFixed(1)} h`}
          tone="violet"
          hint={customer.lastVisit
            ? `Dernière visite : ${new Date(customer.lastVisit).toLocaleDateString('fr-FR')}`
            : undefined}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Informations personnelles */}
        <DashCard title="Informations personnelles">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary-400" />
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-medium text-slate-200">
                  {customer.email || 'Non renseigné'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary-400" />
              <div>
                <div className="text-xs text-slate-500">Téléphone</div>
                <div className="font-medium text-slate-200">{customer.phone}</div>
              </div>
            </div>

            {customer.dateOfBirth && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="text-xs text-slate-500">Date de naissance</div>
                  <div className="font-medium text-slate-200">
                    {new Date(customer.dateOfBirth).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            )}

            {(customer.address || customer.city) && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary-400" />
                <div>
                  <div className="text-xs text-slate-500">Adresse</div>
                  <div className="font-medium text-slate-200">
                    {customer.address}
                    {customer.city && `, ${customer.city}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DashCard>

        {/* Informations de compte */}
        <DashCard title="Informations de compte">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 text-primary-400" />
              <div className="flex-1">
                <div className="text-xs text-slate-500">Mot de passe</div>
                {customer.password ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      Défini
                    </div>
                    {plainPassword && (
                      <div className="rounded-lg border border-primary-500/25 bg-primary-500/10 p-3">
                        <div className="mb-1 text-xs text-primary-300">
                          Mot de passe (en clair)
                        </div>
                        <div className="font-mono text-lg font-bold text-slate-100">
                          {plainPassword}
                        </div>
                      </div>
                    )}
                    {passwordMessage && (
                      <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-300">
                        {passwordMessage}
                      </div>
                    )}
                    <button
                      onClick={fetchPassword}
                      disabled={loadingPassword || !customer.password}
                      className={cn(dashBtnOutlineCls, 'mt-1 px-3 py-1.5 text-xs disabled:opacity-40')}
                    >
                      {loadingPassword
                        ? 'Chargement…'
                        : plainPassword || passwordMessage
                          ? 'Actualiser'
                          : 'Voir le mot de passe'}
                    </button>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-slate-300">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    Non défini
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <div className="text-xs text-slate-500">Statut du compte</div>
              <div className="font-medium">
                {customer.is_active ? (
                  <span className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle className="h-4 w-4" />
                    Actif
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-rose-300">
                    <XCircle className="h-4 w-4" />
                    Inactif
                  </span>
                )}
              </div>
            </div>

            {customer.email && (
              <div className="rounded-lg bg-white/[0.03] p-3 text-sm">
                <p className="mb-1 font-medium text-slate-300">Connexion client</p>
                <p className="text-slate-400">
                  <span className="text-slate-500">Email :</span> {customer.email}
                </p>
                {plainPassword && (
                  <p className="text-slate-400">
                    <span className="text-slate-500">Mot de passe :</span> {plainPassword}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {customer.password
                    ? 'Le client peut se connecter avec son email et son mot de passe.'
                    : "Le client doit d'abord définir son mot de passe via le lien envoyé par email."}
                </p>
              </div>
            )}
          </div>
        </DashCard>

        {/* Informations supplémentaires */}
        {(customer.howDidYouFindUs || customer.notes) && (
          <DashCard title="Informations supplémentaires" className="md:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              {customer.howDidYouFindUs && (
                <div>
                  <div className="mb-1 text-xs text-slate-500">
                    Comment nous a-t-il connu ?
                  </div>
                  <div className="font-medium text-slate-200">
                    {customer.howDidYouFindUs}
                  </div>
                  {customer.howDidYouFindUsDetails && (
                    <div className="mt-1 text-sm text-slate-500">
                      {customer.howDidYouFindUsDetails}
                    </div>
                  )}
                </div>
              )}

              {customer.notes && (
                <div>
                  <div className="mb-1 text-xs text-slate-500">Notes</div>
                  <div className="rounded-lg bg-white/[0.03] p-3 text-sm text-slate-300">
                    {customer.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-white/5 pt-3 text-sm">
              <span className="text-slate-500">CGV acceptées : </span>
              <span className="text-slate-300">
                {customer.cgvAcceptedAt
                  ? `Oui, le ${new Date(customer.cgvAcceptedAt).toLocaleDateString('fr-FR')}`
                  : 'Non'}
              </span>
            </div>
          </DashCard>
        )}
      </div>

      {(!customer.howDidYouFindUs && !customer.notes) && (
        <DashEmpty
          icon={UserRound}
          title="Aucune information supplémentaire"
          className="py-8"
        />
      )}
    </div>
  )
}
