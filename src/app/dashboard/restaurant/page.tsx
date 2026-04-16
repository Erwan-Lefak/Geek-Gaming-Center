'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Utensils, ShoppingCart } from 'lucide-react'

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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant</h1>
          <p className="text-gray-600 mt-1">Gestion du menu et des commandes</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Utensils size={20} />
            Nouveau Plat
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <ShoppingCart size={20} />
            Nouvelle Commande
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'menu'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Menu ({menuItems.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Commandes ({orders.length})
          </button>
        </nav>
      </div>

      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <span className="text-lg font-bold text-orange-600">{item.price} FCFA</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.category}</p>
              <p className="text-sm text-gray-500 mb-4">{item.description}</p>
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
                <button className="flex-1 px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700">
                  <Pencil size={16} className="inline mr-1" />
                  Modifier
                </button>
                <button className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  N° Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.tableNumber || (order.isTakeAway ? 'À emporter' : '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
  )
}
