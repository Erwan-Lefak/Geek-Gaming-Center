'use client';

/**
 * Checkout Success Page - Geek Gaming Center
 * Displayed after successful payment
 */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Home, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useSession } from 'next-auth/react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const { clearCart } = useCart();
  const { data: session } = useSession();

  useEffect(() => {
    const createOrderInDatabase = async () => {
      if (!sessionId || orderCreated) return;

      try {
        setIsLoading(true);
        setOrderCreated(true); // Prevent multiple calls

        // Call API to create order from Stripe session
        const response = await fetch('/api/checkout/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.order);

          // Clear cart after successful order creation
          clearCart();
        } else {
          console.error('Failed to create order:', await response.text());
          // Still show success even if order creation fails
          setOrderDetails({ sessionId });
          clearCart();
        }
      } catch (error) {
        console.error('Error creating order:', error);
        // Still show success even if order creation fails
        setOrderDetails({ sessionId });
        clearCart();
      } finally {
        setIsLoading(false);
      }
    };

    createOrderInDatabase();
  }, [sessionId]); // Remove clearCart and orderCreated from dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center pt-[9rem] md:pt-[7rem] pb-8 px-4 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 lg:p-16">
          {isLoading ? (
            // Loading state
            <>
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
                Création de votre commande...
              </h1>
              <p className="text-purple-300 text-center mb-8 text-base">
                Veuillez patienter pendant que nous enregistrons votre commande.
              </p>
            </>
          ) : (
            // Success state
            <>
              {/* Icon */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-green-600/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
                Commande Confirmée !
              </h1>

              {/* Message */}
              <p className="text-purple-300 text-center mb-8 text-base">
                Merci pour votre achat. Vous recevrez bientôt un email de confirmation.
              </p>

              {/* Order Reference */}
              {orderDetails && (
                <div className="bg-white/5 rounded-2xl p-6 mb-8">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Détails de la Commande
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-purple-200">
                      <div className="w-5 h-5 text-purple-400 flex-shrink-0">🔖</div>
                      <div>
                        <p className="text-sm text-purple-400">Numéro de commande</p>
                        <p className="text-white font-semibold font-mono text-sm">
                          {orderDetails.orderNumber || sessionId}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

          {/* What's Next */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Que se passe-t-il maintenant ?</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <p className="text-white font-semibold">Email de confirmation</p>
                  <p className="text-sm text-purple-300">Vous recevrez un email avec les détails de votre commande</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <p className="text-white font-semibold">Préparation de la commande</p>
                  <p className="text-sm text-purple-300">Nous préparerons votre commande avec soin</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <p className="text-white font-semibold">Notification d'expédition</p>
                  <p className="text-sm text-purple-300">Vous serez notifié lorsque votre commande sera expédiée</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/store"
              className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-lg border border-white/20 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Continuer mes achats
            </Link>

            <Link
              href="/"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all text-lg flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </div>

          <p className="text-center text-purple-400 text-sm mt-6">
            Pour toute question, contactez notre support client
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center pt-[9rem] md:pt-[7rem] pb-8 px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 lg:p-16">
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
              Chargement...
            </h1>
          </div>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
