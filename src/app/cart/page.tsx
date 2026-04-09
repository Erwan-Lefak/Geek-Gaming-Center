'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  category: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  // Remove item
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingFee = subtotal > 50000 ? 0 : 2000
  const total = subtotal + shippingFee

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + 'F'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black pt-[6.5rem] sm:pt-28">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">Mon Panier</h1>
            <p className="text-purple-300">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/store"
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
          >
            Continuer mes achats
          </Link>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Votre panier est vide</h2>
            <p className="text-purple-300 mb-8">Ajoutez des produits de notre boutique pour commencer vos achats.</p>
            <Link
              href="/store"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg uppercase"
            >
              <ShoppingBag className="w-5 h-5" />
              Découvrir la Boutique
            </Link>
          </div>
        ) : (
          /* Cart Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-purple-300 mb-3">{item.category}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-lg font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 sticky top-24">
                <h2 className="text-2xl font-bold text-white mb-6">Récapitulatif</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/80">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-white/80">
                    <span>Frais de livraison</span>
                    <span>{shippingFee === 0 ? 'Gratuit' : formatPrice(shippingFee)}</span>
                  </div>

                  {shippingFee > 0 && (
                    <p className="text-sm text-purple-300">
                      Livraison gratuite à partir de 50 000F
                    </p>
                  )}

                  <div className="border-t border-white/20 pt-4 mt-4">
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/store/checkout"
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg uppercase"
                >
                  Passer la commande
                  <ArrowRight className="w-5 h-5" />
                </Link>

                {/* Security Note */}
                <p className="text-center text-purple-300 text-xs mt-4">
                  Paiement sécurisé. Satisfait ou remboursé sous 30 jours.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
