'use client';

/**
 * Checkout Cancel Page - Geek Gaming Center
 * Displayed when payment is cancelled or fails
 */

import Link from 'next/link';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card p-12 rounded-2xl text-center">
            {/* Cancel Icon */}
            <div className="w-24 h-24 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-error" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-4xl font-bold text-white mb-4">
              Paiement annulé
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              Votre paiement n'a pas été finalisé. Vous ne serez débité que si vous complétez le paiement.
            </p>

            {/* Help Text */}
            <div className="text-left mb-8 p-6 bg-surface rounded-lg">
              <h2 className="text-lg font-semibold text-white mb-4">Pourquoi le paiement a-t-il échoué ?</h2>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Vous avez annulé le processus de paiement</li>
                <li>• Une erreur est survenue lors du traitement</li>
                <li>• Le délai de paiement a expiré</li>
                <li>• La carte bancaire a été refusée</li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/store/checkout"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Réessayer le paiement
              </Link>

              <Link
                href="/store/cart"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface hover:bg-surface/80 border border-border text-white font-semibold rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour au panier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
