'use client';

/**
 * Checkout Success Page - Geek Gaming Center
 * Displayed after successful payment
 */

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, you would fetch order details from your API
    // using the session ID
    if (sessionId) {
      // For now, just show success message
      setOrderDetails({ sessionId });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-12 rounded-2xl text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Commande confirmée !
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              Merci pour votre achat. Vous recevrez bientôt un email de confirmation.
            </p>

            {/* Order Reference */}
            {sessionId && (
              <div className="mb-8 p-4 bg-surface rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Référence de transaction</p>
                <p className="text-lg font-mono text-primary-400">{sessionId}</p>
              </div>
            )}

            {/* What's Next */}
            <div className="text-left mb-8 p-6 bg-surface rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">Que se passe-t-il maintenant ?</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">1</div>
                  <span>Vous recevrez un email de confirmation avec les détails de votre commande</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">2</div>
                  <span>Nous préparerons votre commande avec soin</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-sm font-bold">3</div>
                  <span>Vous serez notifié lorsque votre commande sera expédiée</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                Continuer mes achats
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface hover:bg-surface/80 border border-border text-white font-semibold rounded-xl transition-all"
              >
                <Home className="w-5 h-5" />
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
