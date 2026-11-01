'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Utensils, ShoppingCart, UtensilsCrossed } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  StatusBadge,
  orderStatusMeta,
  paymentStatusMeta,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  price: number
  image?: string
  ingredients: string[]
  allergens: string[]
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
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)

  // Menu Item form state
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    ingredients: [] as string[],
    allergens: [] as string[],
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
      isAvailable: true,
      preparationTime: 15,
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        Chargement…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Restaurant"
        description="Gestion du menu et des commandes"
        actions={
          <button
            onClick={() => {
              setShowMenuItemModal(true)
              resetMenuItemForm()
              setSelectedMenuItem(null)
            }}
            className={dashBtnPrimaryCls}
          >
            <Plus className="h-4 w-4" />
            Nouveau plat
          </button>
        }
      />

      {/* Onglets */}
      <div className="flex gap-1.5 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('menu')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
            activeTab === 'menu'
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          )}
        >
          <UtensilsCrossed className="h-4 w-4" />
          Menu <span className="tabular-nums">({menuItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
            activeTab === 'orders'
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          Commandes <span className="tabular-nums">({orders.length})</span>
        </button>
      </div>

      {/* Onglet Menu */}
      {activeTab === 'menu' && (
        menuItems.length === 0 ? (
          <div className="dash-card">
            <DashEmpty icon={Utensils} title="Aucun plat au menu" hint="Créez votre premier plat" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {menuItems.map((item) => (
              <div key={item.id} className="dash-card flex flex-col p-5">
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-100">{item.name}</h3>
                  <span className="shrink-0 font-semibold text-amber-300 tabular-nums">
                    {item.price.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <p className="mb-1 text-xs text-slate-500">{item.category}</p>
                {item.description && (
                  <p className="mb-3 line-clamp-2 flex-1 text-sm text-slate-400">{item.description}</p>
                )}
                <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                  <span>⏱ {item.preparationTime} min</span>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[11px] font-medium',
                      item.isAvailable
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-rose-500/15 text-rose-300'
                    )}
                  >
                    {item.isAvailable ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
                <div className="flex gap-2 border-t border-white/5 pt-3">
                  <button
                    onClick={() => handleEditMenuItem(item)}
                    className={cn(dashBtnOutlineCls, 'flex-1 justify-center py-2 text-xs')}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteMenuItem(item.id, item.name)}
                    title="Supprimer"
                    className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Onglet Commandes */}
      {activeTab === 'orders' && (
        <DashCard title={`${orders.length} commande${orders.length > 1 ? 's' : ''}`}>
          {orders.length === 0 ? (
            <DashEmpty icon={ShoppingCart} title="Aucune commande restaurant" />
          ) : (
            <div className="overflow-x-auto dash-scroll">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr>
                    <th className={dashTableHeadCls}>N° commande</th>
                    <th className={dashTableHeadCls}>Table</th>
                    <th className={dashTableHeadCls}>Statut</th>
                    <th className={dashTableHeadCls}>Paiement</th>
                    <th className={dashTableHeadCls}>Total</th>
                    <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4 font-medium text-slate-200">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        {order.tableNumber || (order.isTakeAway ? 'À emporter' : '—')}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.status} meta={orderStatusMeta} />
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={order.paymentStatus} meta={paymentStatusMeta} />
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-200 tabular-nums">
                        {Number(order.total).toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-xs font-medium text-primary-300 hover:text-primary-200">
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashCard>
      )}

      {/* Modal : plat */}
      <Modal
        isOpen={showMenuItemModal}
        onClose={() => {
          setShowMenuItemModal(false)
          setSelectedMenuItem(null)
          resetMenuItemForm()
        }}
        title={selectedMenuItem ? 'Modifier le plat' : 'Nouveau plat'}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Nom du plat <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={menuItemForm.name}
              onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
              className={dashInputCls}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Description</label>
            <textarea
              value={menuItemForm.description}
              onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
              rows={3}
              className={dashInputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Catégorie <span className="text-rose-400">*</span>
              </label>
              <select
                value={menuItemForm.category}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, category: e.target.value })}
                className={dashSelectCls}
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
              <label className="mb-1 block text-sm text-slate-400">
                Prix (FCFA) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={menuItemForm.price}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, price: parseInt(e.target.value) })}
                className={dashInputCls}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Temps de préparation (min)
              </label>
              <input
                type="number"
                value={menuItemForm.preparationTime}
                onChange={(e) => setMenuItemForm({ ...menuItemForm, preparationTime: parseInt(e.target.value) })}
                className={dashInputCls}
              />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={menuItemForm.isAvailable}
              onChange={(e) => setMenuItemForm({ ...menuItemForm, isAvailable: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-white/5"
            />
            <span className="text-sm text-slate-300">Disponible</span>
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
          <button
            onClick={() => {
              setShowMenuItemModal(false)
              setSelectedMenuItem(null)
              resetMenuItemForm()
            }}
            className={dashBtnOutlineCls}
          >
            Annuler
          </button>
          <button onClick={handleSaveMenuItem} className={dashBtnPrimaryCls}>
            {selectedMenuItem ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
