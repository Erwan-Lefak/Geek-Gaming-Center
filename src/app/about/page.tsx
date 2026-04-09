'use client'

import { Gamepad2, Trophy, Users, Target, Heart, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black pt-8">
      {/* Notre Histoire */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-8">
              Notre Histoire
            </h2>
            <div className="bento-item p-8 md:p-12">
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6">
                Geek Gaming Center est né de la passion pour le gaming et le désir de créer un espace unique à Yaoundé où les joueurs de tous niveaux peuvent se retrouver, s'amuser et vivre des expériences inoubliables.
              </p>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6">
                Depuis notre ouverture, nous nous sommes engagés à offrir les meilleurs équipements, une ambiance conviviale et un service de qualité pour que chaque visite soit une expérience exceptionnelle.
              </p>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                Que vous soyez un gamer confirmé ou un débutant, chez Geek Gaming Center, vous trouverez votre place et vivrez des moments de gaming inoubliables !
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-black via-purple-950 to-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-6">
              Nos Valeurs
            </h2>
            <p className="text-lg md:text-xl text-purple-300">
              Ce qui nous anime au quotidien
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Passion */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/15 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Passion</h3>
              <p className="text-white/80 leading-relaxed">
                Nous vivons le gaming avec passion et partageons cette énergie avec chaque visiteur.
              </p>
            </div>

            {/* Excellence */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/15 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Excellence</h3>
              <p className="text-white/80 leading-relaxed">
                Nous offrons les meilleurs équipements et un service de qualité supérieure.
              </p>
            </div>

            {/* Communauté */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/15 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Communauté</h3>
              <p className="text-white/80 leading-relaxed">
                Nous créons un espace inclusif où chacun se sent welcome et peut s'épanouir.
              </p>
            </div>

            {/* Innovation */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/15 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Innovation</h3>
              <p className="text-white/80 leading-relaxed">
                Nous restons à la pointe de la technologie pour vous offrir les meilleures expériences.
              </p>
            </div>

            {/* Fun */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/15 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Fun</h3>
              <p className="text-white/80 leading-relaxed">
                Le gaming est avant tout un plaisir, et nous nous assurons que vous vous amusiez !
              </p>
            </div>

            {/* Accessibilité */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 hover:bg-white/15 transition-all group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Accessibilité</h3>
              <p className="text-white/80 leading-relaxed">
                Des prix abordables pour que le gaming soit accessible à tous.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-8">
              Prêt à Nous Rejoindre ?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Venez vivre l'expérience Geek Gaming Center et découvrez pourquoi nous sommes le lieu de rendez-vous des gamers à Yaoundé !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/arena/booking"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 text-lg uppercase"
              >
                <Gamepad2 className="w-5 h-5" />
                Réserver une Session
              </Link>
              <Link
                href="/arena"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all text-lg uppercase"
              >
                Découvrir nos Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
