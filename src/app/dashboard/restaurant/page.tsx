'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Utensils, ShoppingCart } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  price: number
  image?: string
  ingredients: string[]
  allergens: string[]
  isVegetarian: boolean
  isVegan: boolean
  isSpicy: boolean
  isActive: boolean
  isAvailable: boolean
  preparationTime: number
}

interface RestaurantOrder {
  id: string
  orderNumber: string
  tableNumber?: string
  status: string
  paymentStatus: string
  total: number
  isTakeAway: boolean
  orderedAt: string
  items: any[]
  customer?: any
}

export default function RestaurantPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<RestaurantOrder[]>([])
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu')
  const [loading, setLoading] = useState(true)

  // Modal states
  const [showMenuItemModal, setShowMenuItemModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)

  // Menu Item form state
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    ingredients: [] as string[],
    allergens: [] as string[],
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    isAvailable: true,
    preparationTime: 15,
  })

  useEffect(() => {
    fetchMenuItems()
    fetchOrders()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const res = await fetch('/api/dashboard/menu-items')
      const data = await res.json()
      setMenuItems(data.menuItems || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/dashboard/restaurant-orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMenuItem = async () => {
    try {
      const url = selectedMenuItem
        ? `/api/dashboard/menu-items/${selectedMenuItem.id}`
        : '/api/dashboard/menu-items'

      const method = selectedMenuItem ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItemForm),
      })

      if (res.ok) {
        await fetchMenuItems()
        setShowMenuItemModal(false)
        setSelectedMenuItem(null)
        resetMenuItemForm()
        alert(selectedMenuItem ? 'Plat mis à jour avec succès !' : 'Plat créé avec succès !')
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert('Erreur lors de la sauvegarde du plat')
    }
  }

  const handleDeleteMenuItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le plat "${itemName}" ?`)) {
      return
    }

    try {
      const res = await fetch(`/api/dashboard/menu-items/${itemId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchMenuItems()
        alert('Plat supprimé avec succès !')
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Erreur lors de la suppression du plat')
    }
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item)
    setMenuItemForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: Number(item.price),
      ingredients: item.ingredients,
      allergens: item.allergens,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isSpicy: item.isSpicy,
      isAvailable: item.isAvailable,
      preparationTime: item.preparationTime,
    })
    setShowMenuItemModal(true)
  }

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: '',
      description: '',
      category: '',
      price: 0,
      ingredients: [],
      allergens: [],
      isVegetarian: false,
      isVegan: false,
      isSpicy: false,
      isAvailable: true,
      preparationTime: 15,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>
  }

  return (
    <div className="min-h-screen mt-28 lg:mt-20" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Restaurant</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Gestion du menu et des commandes</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowMenuItemModal(true)
                resetMenuItemForm()
                setSelectedMenuItem(null)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Utensils size={20} />
              Nouveau Plat
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <ShoppingCart size={20} />
              Nouvelle Commande
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b mb-6" style={{ borderColor: 'var(--border)' }}>
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'menu'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent'
              }`}
              style={{ color: activeTab === 'menu' ? undefined : 'var(--muted-foreground)' }}
            >
              Menu ({menuItems.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-orange-600 text-orange-600'
                  : 'border-transparent'
              }`}
              style={{ color: activeTab === 'orders' ? undefined : 'var(--muted-foreground)' }}
            >
              Commandes ({orders.length})
            </button>
          </nav>
        </div>

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg shadow-md p-4"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{item.name}</h3>
                  <span className="text-lg font-bold text-orange-600">{item.price} FCFA</span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>{item.category}</p>
                <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.isVegetarian && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Végétarien</span>
                  )}
                  {item.isVegan && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Vegan</span>
                  )}
                  {item.isSpicy && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Épicé</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMenuItem(item)}
                    className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    <Pencil size={16} className="inline mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id, item.name)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead className="bg-gray-50" style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    N° Commande
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    Table
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--foreground)' }}>
                      {order.tableNumber || (order.isTakeAway ? 'À emporter' : '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--foreground)' }}>
                      {order.total} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-orange-600 hover:text-orange-900">Voir détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      <Modal
        isOpen={showMenuItemModal}
        onClose={() => {
          setShowMenuItemModal(false)
          setSelectedMenuItem(null)
          resetMenuItemForm()
        }}
        title={selectedMenuItem ? 'Modifier le Plat' : 'Nouveau Plat'}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Nom du plat *
            </label>
            <input
              type="text"
              value={menuItemForm.name}
              onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Description
            </label>
            <textarea
              value={menuItemForm.description}
              onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Catégorie *
              </label>
              <select
                value={menuItemForm.category}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                required
              >
                <option value="">Sélectionner</option>
                <option value="Entrée">Entrée</option>
                <option value="Plat principal">Plat principal</option>
                <option value="Dessert">Dessert</option>
                <option value="Boisson">Boisson</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Prix (FCFA) *
              </label>
              <input
                type="number"
                value={menuItemForm.price}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Temps de préparation (min)
              </label>
              <input
                type="number"
                value={menuItemForm.preparationTime}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, preparationTime: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={menuItemForm.isVegetarian}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, isVegetarian: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Végétarien</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={menuItemForm.isVegan}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, isVegan: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Vegan</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={menuItemForm.isSpicy}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, isSpicy: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Épicé</span>
            </label>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={menuItemForm.isAvailable}
              onChange={(e) => setMenuItemForm({ ...menuItemForm, isAvailable: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm" style={{ color: 'var(--foreground)' }}>Disponible</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveMenuItem}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            {selectedMenuItem ? 'Mettre à jour' : 'Créer'}
          </button>
          <button
            onClick={() => {
              setShowMenuItemModal(false)
              setSelectedMenuItem(null)
              resetMenuItemForm()
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Annuler
          </button>
        </div>
      </Modal>
    </div>
  )
}
