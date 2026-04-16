'use client';

/**
 * Checkout Cancel Page - Geek Gaming Center
 * Displayed when payment is cancelled or fails
 */

import Link from 'next/link';
import { XCircle, ShoppingBag, Home, ArrowLeft, RefreshCw } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center pt-[9rem] md:pt-[7rem] pb-8 px-4 sm:px-6 lg:px-8">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiBjeT0iMzMiIHI9IjMzIiBmaWxsPSIjZjZmNmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 lg:p-16">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
            Paiement Annulé
          </h1>

          {/* Message */}
          <p className="text-purple-300 text-center mb-8 text-base">
            Votre paiement n'a pas été finalisé. Vous n'avez pas été débité.
          </p>

          {/* What Happened */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Pourquoi le paiement a-t-il échoué ?
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                <div>
                  <p className="text-white font-semibold">Annulation manuelle</p>
                  <p className="text-sm text-purple-300">Vous avez annulé le processus de paiement</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                <div>
                  <p className="text-white font-semibold">Erreur de traitement</p>
                  <p className="text-sm text-purple-300">Une erreur technique est survenue</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                <div>
                  <p className="text-white font-semibold">Délai expiré</p>
                  <p className="text-sm text-purple-300">Le temps imparti pour le paiement est écoulé</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                <div>
                  <p className="text-white font-semibold">Paiement refusé</p>
                  <p className="text-sm text-purple-300">Votre banque a refusé la transaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white/5 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Que faire maintenant ?</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                <div>
                  <p className="text-white font-semibold">Vérifiez vos informations</p>
                  <p className="text-sm text-purple-300">Assurez-vous que vos coordonnées bancaires sont correctes</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                <div>
                  <p className="text-white font-semibold">Réessayez le paiement</p>
                  <p className="text-sm text-purple-300">Utilisez une autre méthode de paiement si nécessaire</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                <div>
                  <p className="text-white font-semibold">Contactez-nous si besoin</p>
                  <p className="text-sm text-purple-300">Notre équipe est disponible pour vous aider</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/store/checkout"
              className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all text-lg flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 duration-200"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer le paiement
            </Link>

            <Link
              href="/store/cart"
              className="flex-1 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-lg border border-white/20 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour au panier
            </Link>
          </div>

          <Link
            href="/"
            className="block text-center mt-6 text-purple-400 hover:text-purple-300 transition-colors text-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </span>
          </Link>

          <p className="text-center text-purple-400 text-xs mt-6">
            Besoin d'aide ? Contactez notre support client
          </p>
        </div>
      </div>
    </div>
  );
}
