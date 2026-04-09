'use client';

/**
 * Checkout Page - Geek Gaming Center
 * Payment page with Stripe Checkout redirect
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { formatFCFA } from '@/lib/currency';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { ShoppingBag, Lock, CreditCard, ArrowRight } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoading } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    setIsProcessing(true);

    try {
      // Create Stripe Checkout Session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items,
          cartId: cart.id,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Erreur lors de la création du paiement');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    router.push('/store/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Boutique', href: '/store' },
            { label: 'Panier', href: '/store/cart' },
            { label: 'Paiement', href: '/store/checkout', active: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Finaliser la commande</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">Récapitulatif de la commande</h2>

                {/* Items */}
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="text-white font-medium line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-gray-400">Qté: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {formatFCFA(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Sous-total</span>
                    <span>{formatFCFA(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Livraison</span>
                    <span className="text-success">Gratuite</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white border-t border-border pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary-400">{formatFCFA(cart.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-xl font-bold text-white mb-6">Mode de paiement</h2>

                {/* Stripe Checkout Option */}
                <div className="space-y-4">
                  <div className="p-4 border-2 border-primary-500 rounded-xl bg-primary-500/5">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="w-6 h-6 text-primary-400" />
                      <div>
                        <h3 className="text-white font-semibold">Paiement sécurisé</h3>
                        <p className="text-sm text-gray-400">Carte bancaire via Stripe</p>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <span>Payer {formatFCFA(cart.total)}</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400 pt-4">
                    <Lock className="w-4 h-4" />
                    <span>Paiement 100% sécurisé</span>
                  </div>

                  {/* Accepted Cards */}
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <div className="text-xs text-gray-500">Cartes acceptées :</div>
                    <div className="flex gap-2">
                      <div className="px-2 py-1 bg-white/10 rounded text-xs text-white">Visa</div>
                      <div className="px-2 py-1 bg-white/10 rounded text-xs text-white">Mastercard</div>
                      <div className="px-2 py-1 bg-white/10 rounded text-xs text-white">AMEX</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
