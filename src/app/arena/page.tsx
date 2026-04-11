/**
 * Arena Page - Geek Gaming Center
 * Gaming lounge with PS4, PS5, Xbox, VR, Simulation
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, Clock, MapPin, Users, Gamepad2, Monitor, Zap, Cpu, Calendar, Trophy, ChevronRight, Quote, Gauge, Eye } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ArenaPage() {
  const { theme } = useTheme();
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Gamepad2 className="w-8 h-8 text-primary-400" />,
      title: 'Consoles',
      description: 'PS4, PS5, Xbox Series X/S, Nintendo Switch',
      count: '12+',
      color: '',
    },
    {
      icon: <Cpu className="w-8 h-8 text-warning" />,
      title: 'PC',
      description: '4 postes gaming haute performance',
      count: '4',
      color: 'from-warning-500/20 to-warning-600/20',
    },
    {
      icon: <Eye className="w-8 h-8 text-accent-400" />,
      title: 'Réalité Virtuelle',
      description: 'Casques Meta Quest, expériences immersifs',
      count: '4+',
      color: '',
    },
    {
      icon: <Gauge className="w-8 h-8 text-success" />,
      title: 'Simulation Auto',
      description: 'Volants et pédales professionnels',
      count: '6',
      color: 'from-success-500/20 to-success-600/20',
    },
  ];

  const services = [
    {
      name: 'PS5 Premium',
      description: 'Expérience gaming de nouvelle génération avec la PlayStation 5 et écrans 4K',
      price: '15 000 FCFA/heure',
      icon: <Gamepad2 className="w-12 h-12 text-primary-400" />,
      color: 'from-primary-500/20 to-primary-600/20',
    },
    {
      name: 'Xbox Series X',
      description: 'La puissance de la Xbox Series X/S avec Game Pass',
      price: '15 000 FCFA/heure',
      icon: <Monitor className="w-12 h-12 text-success" />,
      color: 'from-success-500/20 to-success-600/20',
    },
    {
      name: 'Réalité Virtuelle',
      description: 'Plongez dans des mondes immersifs avec nos casques VR Meta Quest',
      price: '20 000 FCFA/heure',
      icon: <Monitor className="w-12 h-12 text-accent-400" />,
      color: 'from-accent-500/20 to-accent-600/20',
    },
    {
      name: 'Simulation Auto',
      description: 'Simulateurs de course professionnels avec volants, pédales et écrans incurvés',
      price: '25 000 FCFA/heure',
      icon: <Gauge className="w-12 h-12 text-warning" />,
      color: 'from-warning-500/20 to-warning-600/20',
    },
    {
      name: 'Tournois Gaming',
      description: 'Participez à nos compétitions et remportez des prix',
      price: 'Variable',
      icon: <Trophy className="w-12 h-12 text-purple-400" />,
      color: 'from-purple-500/20 to-purple-600/20',
    },
    {
      name: 'Événements Privés',
      description: 'Anniversaires, team building et événements entreprises',
      price: 'Sur devis',
      icon: <Calendar className="w-12 h-12 text-pink-400" />,
      color: 'from-pink-500/20 to-pink-600/20',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Match screenshot design exactly */}
      <section className="relative flex items-center justify-center overflow-hidden h-[calc(100vh-6rem)] sm:h-[calc(100vh-6rem)] mt-[8.5rem] md:mt-[6rem]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/Salle de Jeux/PHOTO-2024-12-07-12-31-50.jpg"
            alt="Salle de Jeux Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Red Gradient Overlay - adapts to theme like store page */}
        <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${
          theme === 'light'
            ? 'from-red-950/85 via-red-950/75 to-white'
            : 'from-red-950/85 via-red-950/90 to-black'
        }`} />

        {/* Content - Split layout */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Main heading */}
              <h1 className="text-[4rem] sm:text-[4.7rem] md:text-[5.3rem] lg:text-[6.7rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-4">
                SALLE DE JEUX
              </h1>

              {/* Tagline */}
              <div className="flex items-center gap-2 mb-6" style={{ color: '#f97316' }}>
                <ChevronRight className="w-6 h-6" style={{ color: '#f97316', stroke: '#f97316' }} />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide" style={{ color: '#f97316' }}>
                  VOTRE ESPACE À YAOUNDÉ POUR VOUS DIVERTIR
                </p>
                <ChevronRight className="w-6 h-6" style={{ color: '#f97316', stroke: '#f97316' }} />
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <p className="text-lg sm:text-xl text-white/80 mb-4 uppercase">
                  OUVERT À YAOUNDÉ, CHAPELLE MVOG ADA IMMEUBLE JAUNE
                </p>
                <Link
                  href="/arena/booking"
                  className="jelly-button group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 font-semibold text-xl sm:text-2xl md:text-3xl text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 uppercase"
                >
                  Réserver maintenant
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>

            {/* Right side - Gaming images */}
            <div className="relative hidden lg:flex flex-row gap-3">
              {/* Image 1 */}
              <div className="w-64 h-96 overflow-hidden group">
                <div className="absolute inset-0">
                  <Image
                    src="/section-salle-de-jeux.jpg"
                    alt="Salle de Jeux"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Image 2 */}
              <div className="w-64 h-96 overflow-hidden group">
                <div className="absolute inset-0">
                  <Image
                    src="/section-boutique.jpg"
                    alt="Boutique"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Image 3 */}
              <div className="w-64 h-96 overflow-hidden group">
                <div className="absolute inset-0">
                  <Image
                    src="/section-restaurant.jpg"
                    alt="Restaurant"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="services" className={`py-8 md:py-16 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 md:mb-16 text-white text-center -mt-4">
            Pourquoi choisir notre <span className="gradient-text">Salle de Jeux</span> ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bento-item group cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center transition-transform duration-300 ${activeFeature === index ? 'scale-110' : ''}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-base text-white/80 mb-2">{feature.count} disponibles</p>
                  <p className="text-sm text-white/60">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gaming Fun Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Description */}
            <div>
              <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-8">
                AFFRONTE TES AMIS !
              </h2>

              <div className="bento-item p-8">
                <p className="text-lg text-white/90 leading-relaxed">
                  Lance-toi dans des duels intenses et prouve ta valeur dans nos tournois. <span className="font-bold text-primary-400">Dribble et marque</span> des buts impossibles sur <span className="font-bold text-white">FIFA</span>, <span className="font-bold text-accent-400">tappe dans une mélée générale</span> dans <span className="font-bold text-white">Super Smash Bros</span>, ou <span className="font-bold text-warning">sort tes meilleurs combo</span> sur <span className="font-bold text-white">Naruto</span>, <span className="font-bold text-white">Tekken</span> ou encore <span className="font-bold text-white">DragonBall Z</span>. Avec nos <span className="font-bold text-primary-400">PS5</span>, <span className="font-bold text-accent-400">PS4</span>, <span className="font-bold text-success">XBOX</span> et <span className="font-bold text-warning">Switch</span>, les tournois n'attendent plus que toi !
                </p>
              </div>
            </div>

            {/* Right side - Console Panels (2x2 grid) */}
            <div className="grid grid-cols-2 gap-4">
              {/* PS5 */}
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-square">
                  <div className="absolute inset-0">
                    <Image
                      src="/arena-gallery/PHOTO-2024-12-07-12-31-46.jpg"
                      alt="PS5"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white kinetic-text uppercase" style={{ color: '#ffffff !important' }}>PS5</span>
                  </div>
                </div>
              </div>

              {/* PS4 */}
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-square">
                  <div className="absolute inset-0">
                    <Image
                      src="/arena-gallery/PHOTO-2024-12-07-12-31-47.jpg"
                      alt="PS4"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white kinetic-text uppercase" style={{ color: '#ffffff !important' }}>PS4</span>
                  </div>
                </div>
              </div>

              {/* XBOX */}
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-square">
                  <div className="absolute inset-0">
                    <Image
                      src="/arena-gallery/PHOTO-2024-12-07-12-31-48.jpg"
                      alt="XBOX"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white kinetic-text uppercase" style={{ color: '#ffffff !important' }}>XBOX</span>
                  </div>
                </div>
              </div>

              {/* Switch */}
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-square">
                  <div className="absolute inset-0">
                    <Image
                      src="/arena-gallery/PHOTO-2024-12-07-12-31-49.jpg"
                      alt="Switch"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white kinetic-text uppercase" style={{ color: '#ffffff !important' }}>Switch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PC Gaming Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - PC Image */}
            <div className="order-2 lg:order-1">
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <div className="absolute inset-0">
                    <Image
                      src="/section-boutique.jpg"
                      alt="PC Dernière Génération"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white kinetic-text uppercase">PC LAST GEN</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Description */}
            <div className="order-1 lg:order-2">
              <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-8">
                PUISSANCE ABSOLUE !
              </h2>

              <div className="bento-item p-8">
                <p className="text-lg text-white/90 leading-relaxed">
                  Avec nos <span className="font-bold text-primary-400">composants derniers cri</span> comme les <span className="font-bold text-accent-400">RTX 4090</span> et <span className="font-bold text-success">Core i9-14900K</span>, <span className="font-bold text-warning">fais tourner tous les jeux en Full HD</span> et <span className="font-bold text-white">sans la moindre latence</span>.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Domine sur <span className="font-bold text-primary-400">Fortnite</span> avec des builds optimisés, <span className="font-bold text-accent-400">tire la tête sur Counter Strike</span> avec une précision chirurgicale.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Ou <span className="font-bold text-success">mène ton équipe à la victoire sur League of Legends</span> et <span className="font-bold text-warning">conquis les raids sur World of Warcraft</span>. La performance ultime à ta portée !
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VR Gaming Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Description */}
            <div className="order-2 lg:order-1">
              <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-8">
                RÉALITÉ VIRTUELLE !
              </h2>

              <div className="bento-item p-8 space-y-6">
                <p className="text-lg text-white/90 leading-relaxed">
                  Plongez dans des mondes virtuels impossibles avec nos <span className="font-bold text-primary-400">casques VR</span>. Explorez des environnements en <span className="font-bold text-accent-400">box augmentée</span>, affrontez des ennemis dans des <span className="font-bold text-success">jeux de réalité augmentée</span> ou découvrez des expériences <span className="font-bold text-warning">unique et inoubliables</span>.
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Vivez des aventures époustantes en <span className="font-bold text-white">3D immersif</span> à travers des visuels haute fidélité, des interactions fluides avec l'environnement et des challenges captivants qui repoussent les limites de votre imagination !
                </p>
              </div>
            </div>

            {/* Right side - VR Image */}
            <div className="order-1 lg:order-2">
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <div className="absolute inset-0">
                    <Image
                      src="/section-restaurant.jpg"
                      alt="Réalité Virtuelle"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white kinetic-text uppercase">VR EXPERIENCES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Racing Simulator Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Racing Image */}
            <div className="order-1 lg:order-1">
              <div className="bento-item group overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <div className="absolute inset-0">
                    <Image
                      src="/section-salle-de-jeux.jpg"
                      alt="Simulateur de Course"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white kinetic-text uppercase">RACING SIMULATOR</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Description */}
            <div className="order-2 lg:order-2">
              <h2 className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-8">
                SIMULATEUR DE COURSE !
              </h2>

              <div className="bento-item p-8 space-y-6">
                <p className="text-lg text-white/90 leading-relaxed">
                  Avec nos <span className="font-bold text-primary-400">volants professionnels</span> et <span className="font-bold text-accent-400">pédaliers de course</span>, <span className="font-bold text-success">vit comme un vrai pilote</span> sur les circuits les plus légendaires du monde !
                </p>
                <p className="text-lg text-white/90 leading-relaxed">
                  Affronte tes amis sur <span className="font-bold text-primary-400">Gran Turismo</span>, <span className="font-bold text-accent-400">Forza Horizon</span> ou encore <span className="font-bold text-warning">F1 2024</span>. Suis les trajectoires parfaites, freine au dernier moment et cross la ligne d'arrivée en vainqueur !
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="relative flex items-center justify-center overflow-hidden py-16 md:py-24 bg-gradient-to-br from-red-600 to-red-700">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Text content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Main heading */}
              <h2 className="text-[4rem] sm:text-[4.7rem] md:text-[5.3rem] lg:text-[6.7rem] font-bold leading-[0.8] kinetic-text text-white uppercase italic mb-4">
                PRÊT À JOUER ?
              </h2>

              {/* Tagline */}
              <div className="flex items-center gap-2 mb-6">
                <ChevronRight className="w-6 h-6 text-white" />
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                  RÉSERVEZ VOTRE CRÉNEAU MAINTENANT
                </p>
                <ChevronRight className="w-6 h-6 text-white" />
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <p className={`text-lg sm:text-xl mb-4 uppercase ${theme === 'light' ? '!text-black' : 'text-white/90'}`}>
                  Profitez de notre salle de jeux immersive
                </p>
                {theme === 'light' ? (
                  <Link
                    href="/arena/booking"
                    className="jelly-button group relative inline-flex items-center gap-3 px-8 py-4 font-semibold text-xl sm:text-2xl md:text-3xl shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 uppercase bg-white !text-black hover:!text-black"
                  >
                    <span className="!text-black hover:!text-black">Réserver un créneau</span>
                    <ArrowRight
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 !text-black hover:!text-black"
                      style={{ stroke: '#000000', fill: 'none' }}
                    />
                  </Link>
                ) : (
                  <Link
                    href="/arena/booking"
                    className="jelly-button group relative inline-flex items-center gap-3 px-8 py-4 font-semibold text-xl sm:text-2xl md:text-3xl shadow-glow hover:shadow-xl hover:scale-105 transition-all duration-300 uppercase bg-black !text-white hover:!text-white"
                  >
                    <span className="!text-white hover:!text-white">Réserver un créneau</span>
                    <ArrowRight
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200 !text-white hover:!text-white"
                      style={{ stroke: '#ffffff', fill: 'none' }}
                    />
                  </Link>
                )}
              </div>
            </div>

            {/* Right side - Empty space */}
            <div className="relative hidden lg:block">
              {/* Empty space to maintain grid layout */}
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </section>

      {/* Info Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 gap-8">
            <div className="bento-item">
              <div className="flex items-center gap-4 mb-4">
                <Clock className="w-8 h-8 text-accent-400" />
                <h3 className="text-xl md:text-2xl font-bold text-white">Horaires d'ouverture</h3>
              </div>
              <p className="text-base text-white/80 mb-2">
                Lundi - Samedi: 9h30 - 21h
              </p>
              <p className="text-base text-white/80">
                Dimanche: 12h00 - 21h
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
