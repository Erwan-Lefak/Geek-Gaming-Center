'use client'

import Link from 'next/link'
import { Mail, AlertCircle, Home } from 'lucide-react'

export default function VerifyEmailWarningPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black flex items-center justify-center px-4">
      {/* Background gaming effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2NiA2NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMzIiBjeT0iMzMiIHI9IjMzIiBmaWxsPSIjZjZmNmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvZz48L3N2Zz4=')] animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            Email Non Vérifié
          </h1>

          {/* Message */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-2xl p-4 mb-6">
            <p className="text-yellow-300 text-center text-sm mb-3">
              <strong>⚠️ Action Requise</strong>
            </p>
            <p className="text-white text-center text-sm">
              Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation qui vous a été envoyé lors de votre inscription.
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <p className="text-purple-300 text-sm text-center">Si vous n'avez pas reçu l'email :</p>
            <ul className="text-purple-200 text-sm space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Vérifiez vos courriers indésirables/spam</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Assurez-vous que l'adresse email est correcte</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>Le lien de vérification expire après 24 heures</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/arena"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              <Home className="w-4 h-4" />
              Retour à l'Accueil
            </Link>
            <Link
              href="/register"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all"
            >
              Créer un Nouveau Compte
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-6 text-center">
            <p className="text-purple-300 text-xs">
              Problème persistant ? Contactez notre support technique
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
