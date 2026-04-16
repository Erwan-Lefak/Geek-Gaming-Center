'use client'

import Link from 'next/link'
import { Mail, AlertCircle, Home } from 'lucide-react'

export default function VerifyEmailWarningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiBjeT0iMzMiIHI9IjMzIiBmaWxsPSIjZjZmNmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 lg:p-16">
          {/* Warning Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-yellow-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-6">
            Email Non Vérifié
          </h1>

          {/* Message */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-2xl p-6 mb-8">
            <p className="text-yellow-300 text-center text-base mb-4">
              <strong className="text-lg">⚠️ Action Requise</strong>
            </p>
            <p className="text-white text-center text-base">
              Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation qui vous a été envoyé lors de votre inscription.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-8">
            <p className="text-purple-300 text-base text-center font-semibold">Si vous n'avez pas reçu l'email :</p>
            <ul className="text-purple-200 text-base space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
                <span className="flex-1">Vérifiez vos courriers indésirables/spam</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
                <span className="flex-1">Assurez-vous que l'adresse email est correcte</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-400 mt-1 text-xl flex-shrink-0">•</span>
                <span className="flex-1">Le lien de vérification expire après 24 heures</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/arena"
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all text-lg"
            >
              <Home className="w-5 h-5" />
              Retour à l'Accueil
            </Link>
            <Link
              href="/register"
              className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-lg"
            >
              Créer un Nouveau Compte
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-purple-300 text-sm">
              Problème persistant ? Contactez notre support technique
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
