'use client';

/**
 * Cart Page - Geek Gaming Center
 * Display cart items, update quantities, proceed to checkout
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { formatFCFA } from '@/lib/currency';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, isLoading, updateQuantity, removeItem, clearCart, itemCount } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0 || newQuantity > 10) return;

    setIsUpdating(productId);
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
      alert('Erreur lors de la mise à jour de la quantité');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    if (!confirm(`Supprimer "${productName}" du panier ?`)) return;

    setIsUpdating(productId);
    try {
      await removeItem(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Vider tout le panier ?')) return;

    try {
      await clearCart();
    } catch (error) {
      console.error('Failed to clear cart:', error);
      alert('Erreur lors du vidage du panier');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Boutique', href: '/store' },
              { label: 'Panier', href: '/store/cart', active: true },
            ]}
          />
        </div>

        {/* Empty Cart */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-card p-12 rounded-2xl">
              <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Votre panier est vide</h1>
              <p className="text-gray-400 mb-8">
                Découvrez nos produits gaming et remplissez votre panier !
              </p>
              <Link
                href="/store"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
              >
                Découvrir la boutique
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Boutique', href: '/store' },
            { label: 'Panier', href: '/store/cart', active: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">
                Mon Panier ({itemCount} article{itemCount > 1 ? 's' : ''})
              </h1>
              <button
                onClick={handleClearCart}
                className="text-sm text-error hover:text-error/80 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Vider le panier
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="glass-card p-4 rounded-xl flex gap-4 items-center"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 bg-surface rounded-lg overflow-hidden">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/products/${item.product.slug}`}
                      className="text-lg font-semibold text-white hover:text-primary-400 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-gray-400 mt-1">{formatFCFA(item.product.price)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={isUpdating === item.productId || item.quantity <= 1}
                      className="w-10 h-10 rounded-lg bg-surface border border-border hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                      disabled={isUpdating === item.productId}
                      className="w-16 h-10 text-center bg-background border border-border rounded-lg text-white font-semibold focus:outline-none focus:border-primary-500 disabled:opacity-50"
                    />

                    <button
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                      disabled={isUpdating === item.productId || item.quantity >= 10}
                      className="w-10 h-10 rounded-lg bg-surface border border-border hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-white mb-2">
                      {formatFCFA(item.product.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.productId, item.product.name)}
                      disabled={isUpdating === item.productId}
                      className="text-error hover:text-error/80 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 rounded-xl sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Récapitulatif</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Sous-total</span>
                  <span className="font-semibold">{formatFCFA(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Livraison</span>
                  <span className="font-semibold text-success">Gratuite</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total</span>
                  <span className="text-2xl text-primary-400">{formatFCFA(cart.total)}</span>
                </div>
              </div>

              <Link
                href="/store/checkout"
                className="jelly-button w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all flex items-center justify-center gap-2"
              >
                Passer la commande
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="/store"
                className="block w-full py-3 text-center text-gray-400 hover:text-white transition-colors mt-4"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
