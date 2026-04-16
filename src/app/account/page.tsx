'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Calendar, Clock, Gamepad2, User, LogOut, X, Check, ChevronRight, Package, ShoppingBag, UserCircle, Key, Trash2, Edit3 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

interface Reservation {
  id: string
  startTime: string
  scheduledEndAt: string
  duration: number
  status: string
  equipment: {
    name: string
    type: string
    code: string
  }
  price: number
}

interface OrderItem {
  id: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  paymentMethod: string | null
  paymentStatus: string
  createdAt: string
  items: OrderItem[]
}

interface CustomerProfile {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
  address: string | null
  city: string | null
  dateOfBirth: string | null
}

export default function AccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'reservations' | 'orders' | 'profile'>('reservations')

  // Profile states
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
  })
  const [saveMessage, setSaveMessage] = useState('')

  // Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const fetchData = async () => {
      // Redirect if not authenticated
      if (status === 'unauthenticated') {
        router.push('/login')
        return
      }

      // Wait for session to load
      if (status !== 'authenticated') {
        return
      }

      // Check if user is a customer
      const userRole = (session?.user as any)?.role
      if (userRole !== 'CUSTOMER') {
        router.push('/dashboard')
        return
      }

      try {
        // Fetch reservations, orders and profile in parallel
        const [reservationsResponse, ordersResponse, profileResponse] = await Promise.all([
          fetch('/api/reservations'),
          fetch('/api/orders'),
          fetch('/api/account'),
        ])

        if (reservationsResponse.ok) {
          const data = await reservationsResponse.json()
          setReservations(data.reservations || [])
        } else if (reservationsResponse.status === 401) {
          router.push('/login')
        } else {
          setError('Erreur lors de la récupération des données')
        }

        if (ordersResponse.ok) {
          const data = await ordersResponse.json()
          setOrders(data.orders || [])
        }

        if (profileResponse.ok) {
          const data = await profileResponse.json()
          setProfile(data.customer)
          setProfileForm({
            firstName: data.customer.firstName,
            lastName: data.customer.lastName,
            phone: data.customer.phone,
            address: data.customer.address || '',
            city: data.customer.city || '',
          })
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Erreur de connexion')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [status, session, router])

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false })
      router.push('/arena')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return
    }

    try {
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from list
        setReservations(reservations.filter(r => r.id !== reservationId))
        alert('Réservation annulée avec succès !')
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de l\'annulation')
      }
    } catch (err) {
      console.error('Cancel error:', err)
      alert('Erreur lors de l\'annulation')
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaveMessage('')

      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.customer)
        setSaveMessage('Profil mis à jour avec succès !')
        setIsEditingProfile(false)
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        const data = await response.json()
        setSaveMessage(data.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Error saving profile:', err)
      setSaveMessage('Erreur de connexion')
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      const response = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        alert('Mot de passe changé avec succès !')
        setShowPasswordForm(false)
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        const data = await response.json()
        setPasswordError(data.error || 'Erreur lors du changement de mot de passe')
      }
    } catch (err) {
      console.error('Error changing password:', err)
      setPasswordError('Erreur de connexion')
    }
  }

  const handleDeleteAccount = async () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
      })

      if (response.ok) {
        setShowDeleteModal(false)
        // Redirect to arena with a flag to clear session
        window.location.href = '/arena?loggedOut=true'
      } else {
        const data = await response.json()
        alert(data.error || 'Erreur lors de la suppression')
        setIsDeleting(false)
      }
    } catch (err) {
      console.error('Error deleting account:', err)
      alert('Erreur lors de la suppression')
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + 'F'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      case 'PAUSED':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Confirmé'
      case 'ACTIVE':
        return 'En cours'
      case 'COMPLETED':
        return 'Terminé'
      case 'CANCELLED':
        return 'Annulé'
      case 'PAUSED':
        return 'En pause'
      default:
        return status
    }
  }

  const isCancellable = (reservation: Reservation) => {
    if (reservation.status === 'CANCELLED' || reservation.status === 'COMPLETED') {
      return false
    }

    // Check if it's more than 2 hours before start
    const now = new Date()
    const startTime = new Date(reservation.startTime)
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursUntilStart >= 2
  }

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50'
      case 'CONFIRMED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50'
      case 'PREPARING':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50'
      case 'READY':
        return 'bg-green-500/20 text-green-300 border-green-500/50'
      case 'COMPLETED':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
      case 'CANCELLED':
        return 'bg-red-500/20 text-red-300 border-red-500/50'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50'
    }
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'CONFIRMED':
        return 'Confirmé'
      case 'PREPARING':
        return 'En préparation'
      case 'READY':
        return 'Prêt'
      case 'COMPLETED':
        return 'Terminé'
      case 'CANCELLED':
        return 'Annulé'
      default:
        return status
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'PAID':
        return 'Payé'
      case 'PARTIALLY_PAID':
        return 'Partiellement payé'
      case 'CANCELLED':
        return 'Annulé'
      case 'REFUNDED':
        return 'Remboursé'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black pt-40 sm:pt-36 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiIGN5PSIzMyIgcj0iMzMiIGZpbGw9IiNmNmY2ZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Mon Compte</h1>
            <p className="text-purple-300 text-base sm:text-lg">Gérez vos réservations</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link
              href="/arena/booking"
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Nouvelle Réservation</span>
              <span className="sm:hidden">Réserver</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
              <span className="sm:hidden">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Total Réservations</p>
                <p className="text-white text-2xl font-bold">{reservations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">À Venir</p>
                <p className="text-white text-2xl font-bold">
                  {reservations.filter(r =>
                    !['CANCELLED', 'COMPLETED'].includes(r.status)
                  ).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-purple-300 text-sm">Heures Jouées</p>
                <p className="text-white text-2xl font-bold">
                  {reservations.reduce((acc, r) => acc + r.duration / 60, 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'reservations'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-purple-300 hover:bg-white/20'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Mes Réservations</span>
              <span className={`ml-2 px-2 py-1 rounded-lg text-xs ${
                activeTab === 'reservations' ? 'bg-white/20' : 'bg-purple-600/20'
              }`}>
                {reservations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-purple-300 hover:bg-white/20'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Boutique</span>
              <span className={`ml-2 px-2 py-1 rounded-lg text-xs ${
                activeTab === 'orders' ? 'bg-white/20' : 'bg-purple-600/20'
              }`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-purple-300 hover:bg-white/20'
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span>Mon Profil</span>
            </button>
          </div>

          {/* Reservations Content */}
          {activeTab === 'reservations' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Mes Réservations</h2>

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Gamepad2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300 text-lg mb-4">Aucune réservation pour le moment</p>
              <Link
                href="/arena/booking"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
              >
                <Calendar className="w-5 h-5" />
                Réserver une session
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">
                          {reservation.equipment.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-purple-200">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(reservation.startTime)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-purple-200">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatTime(reservation.startTime)} - {formatTime(reservation.scheduledEndAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-purple-200">
                          <span className="font-semibold text-white">
                            {formatPrice(Number(reservation.price))}
                          </span>
                          <span>({reservation.duration / 60}h)</span>
                        </div>
                      </div>
                    </div>

                    {isCancellable(reservation) && (
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-xl border border-red-600/50 transition-all"
                      >
                        <X className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          )}

          {/* Orders Content */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Mes Commandes</h2>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-300 text-lg mb-4">Aucune commande pour le moment</p>
                  <Link
                    href="/store"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
                  >
                    <Package className="w-5 h-5" />
                    Visiter la boutique
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">
                              Commande #{order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.status)}`}>
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </div>
                          <p className="text-purple-300 text-sm">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {formatPrice(Number(order.totalAmount))}
                          </p>
                          <p className={`text-xs font-semibold ${order.paymentStatus === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {getPaymentStatusLabel(order.paymentStatus)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <p className="text-purple-300 text-sm font-semibold mb-2">Articles commandés :</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <Package className="w-4 h-4 text-purple-400" />
                                <span className="text-white">{item.productName}</span>
                                <span className="text-purple-400">x{item.quantity}</span>
                              </div>
                              <span className="text-white font-semibold">
                                {formatPrice(Number(item.totalPrice))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Content */}
          {activeTab === 'profile' && (
            <div>
              {!profile ? (
                <div className="text-center py-12">
                  <UserCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <p className="text-purple-300 text-lg mb-4">Chargement du profil...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Profile Information */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Mes Informations</h2>
                      <button
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/50 rounded-xl transition-all text-sm font-semibold"
                      >
                        <Edit3 className="w-4 h-4" />
                        {isEditingProfile ? 'Annuler' : 'Modifier'}
                      </button>
                    </div>

                    {saveMessage && (
                      <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
                        saveMessage.includes('succès')
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                          : 'bg-red-500/20 text-red-300 border border-red-500/50'
                      }`}>
                        {saveMessage}
                      </div>
                    )}

                    {isEditingProfile ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Prénom</label>
                          <input
                            type="text"
                            value={profileForm.firstName}
                            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Nom</label>
                          <input
                            type="text"
                            value={profileForm.lastName}
                            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Téléphone</label>
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Adresse</label>
                          <input
                            type="text"
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Ville</label>
                          <input
                            type="text"
                            value={profileForm.city}
                            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <button
                            onClick={handleSaveProfile}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
                          >
                            <Check className="w-5 h-5" />
                            Enregistrer les modifications
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-purple-300 mb-1">Prénom</p>
                          <p className="text-white font-semibold">{profile.firstName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-300 mb-1">Nom</p>
                          <p className="text-white font-semibold">{profile.lastName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-300 mb-1">Email</p>
                          <p className="text-white font-semibold">{profile.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-300 mb-1">Téléphone</p>
                          <p className="text-white font-semibold">{profile.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-300 mb-1">Adresse</p>
                          <p className="text-white font-semibold">{profile.address || 'Non renseignée'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-purple-300 mb-1">Ville</p>
                          <p className="text-white font-semibold">{profile.city || 'Non renseignée'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Change Password */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">Mot de passe</h2>
                      <button
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/50 rounded-xl transition-all text-sm font-semibold"
                      >
                        <Key className="w-4 h-4" />
                        {showPasswordForm ? 'Annuler' : 'Changer'}
                      </button>
                    </div>

                    {showPasswordForm && (
                      <div className="space-y-4">
                        {passwordError && (
                          <div className="bg-red-500/20 text-red-300 px-4 py-3 rounded-lg text-sm">
                            {passwordError}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Mot de passe actuel</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Nouveau mot de passe</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-purple-300 mb-2">Confirmer le mot de passe</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <button
                          onClick={handleChangePassword}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg"
                        >
                          <Check className="w-5 h-5" />
                          Changer le mot de passe
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Delete Account */}
                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-red-400 mb-4">Zone Danger</h2>
                    <p className="text-red-300 text-sm mb-6">
                      La suppression de votre compte est irréversible. Toutes vos données (réservations, commandes, informations personnelles) seront définitivement perdues.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <Link
            href="/arena"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Salle de Jeux</h3>
                  <p className="text-purple-300 text-sm">Découvrir nos équipements</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/arena/booking"
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Réserver</h3>
                  <p className="text-purple-300 text-sm">Nouvelle réservation</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-pink-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression du compte"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-medium mb-2">⚠️ Attention</p>
            <p className="text-red-800 text-sm">
              Vous êtes sur le point de supprimer définitivement votre compte
            </p>
            {profile && (
              <>
                <p className="text-red-900 font-bold mt-2">
                  {profile.firstName} {profile.lastName}
                </p>
                {profile.email && !profile.email.startsWith('deleted_') && (
                  <p className="text-red-700 text-sm mt-1">{profile.email}</p>
                )}
              </>
            )}
          </div>

          <div className="text-sm">
            <p className="font-bold text-red-900 dark:text-red-300">
              Cette action est <strong>irréversible</strong>. Toutes vos données seront définitivement supprimées :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li className="text-red-900 dark:text-red-300">Historique des réservations</li>
              <li className="text-red-900 dark:text-red-300">Commandes et achats</li>
              <li className="text-red-900 dark:text-red-300">Informations personnelles</li>
              <li className="text-red-900 dark:text-red-300">Données de connexion</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
