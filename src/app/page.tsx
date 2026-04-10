/**
 * Home Page - Geek Gaming Center
 * Landing page with navigation to Store and Arena
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Cpu, Gamepad2, Zap, Store, Monitor, UtensilsCrossed, Film, Calendar, Users, ChevronDown, ChevronUp, Instagram } from 'lucide-react';
import ImageCarousel from '@/components/ui/ImageCarousel';
import { useTheme } from '@/contexts/ThemeContext';
import InstagramGallery from '@/components/InstagramGallery';

export default function HomePage() {
  const { theme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Debug : pour voir si le thème est bien détecté
  console.log('Theme actuel:', theme);

  const faqs = [
    {
      question: 'Quels types de postes de jeux sont disponibles ?',
      answer: 'Nous disposons de postes PS4, PS5, Xbox Series X/S, casques VR Meta Quest et simulateurs de course automobile professionnel.'
    },
    {
      question: 'Comment fonctionne la réservation ?',
      answer: 'Vous pouvez réserver directement sur notre site ou en venant sur place. Les réservations se font à l\'heure avec un minimum de 2 heures.'
    },
    {
      question: 'Quels sont les tarifs de location ?',
      answer: 'Les tarifs varient selon le type de poste et la durée. Nos tarifs commencent à partir de 5000 FCFA par heure pour les postes consoles.'
    },
    {
      question: 'Est-il possible d\'organiser un événement privé ?',
      answer: 'Oui ! Nous organisons des anniversaires, événements entreprises et soirées privées. Contactez-nous pour un devis personnalisé.'
    },
    {
      question: 'Quels types de composants vendez-vous ?',
      answer: 'Nous vendons des processeurs, cartes graphiques, mémoires, boîtiers, alimentations et tous les composants nécessaires pour construire votre PC de rêve.'
    },
    {
      question: 'Proposez-vous un service d\'assemblage PC ?',
      answer: 'Absolument ! Notre équipe technique peut assembler votre PC sur mesure avec les composants de votre choix ou selon vos besoins.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden h-[calc(100vh-6rem)] sm:h-[calc(100vh-6rem)] mt-[8.5rem] md:mt-[6rem]">
        {/* Image Carousel Background */}
        <ImageCarousel />

        {/* Blue-Purple Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-violet-600/40 to-purple-600/40 mix-blend-multiply pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-10 gap-8 items-center -mt-24 sm:-mt-16 md:mt-0">
            {/* Left Column - Title and Buttons (70% on tablet and desktop) */}
            <div className="w-full sm:col-span-7">
              {/* Main Headline */}
              <h1 className="!text-[4rem] md:!text-[4.7rem] lg:!text-[5.3rem] xl:!text-[6.7rem] font-bold mb-4 leading-[0.8] kinetic-text text-white uppercase italic">
                <span className="text-black">Votre Destination</span> <span className="gradient-text block">Gaming Ultime</span>
              </h1>

              {/* CTA Buttons */}
              <div className="flex flex-col md:flex-row gap-4 items-start mb-8">
              <Link
                  href="/store"
                  className="jelly-button group relative px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 font-semibold text-base sm:text-xl md:text-3xl text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 uppercase"
                >
                  <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                  <span>Explorer la Boutique</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

              <Link
                  href="/arena"
                  className={`jelly-button group px-6 py-3 border font-semibold text-base sm:text-xl md:text-3xl transition-all duration-300 flex items-center gap-2 uppercase hover:opacity-90 ${
                    theme === 'light'
                      ? '!bg-white !text-black border-black [&_svg]:!stroke-black [&_svg]:!text-black'
                      : 'bg-surface border-border text-white hover:bg-elevated'
                  }`}
                >
                  <Gamepad2 className={`w-4 h-4 sm:w-5 sm:h-5 ${theme === 'light' ? '' : 'text-primary-400'}`} />
                  <span className={theme === 'light' ? '!text-black' : 'text-white'}>Salle de Jeux</span>
                  <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200 ${theme === 'light' ? '' : 'text-white'}`} />
                </Link>
              </div>
            </div>

            {/* Right Column - Location Image (30% on tablet and desktop) */}
            <div className="hidden sm:flex w-full sm:col-span-3 justify-end items-center">
              <Image
                src="/geek-gaming-center-location.png"
                alt="Geek Gaming Center Location"
                width={1000}
                height={1000}
                className="w-full h-auto object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>

        {/* Description text positioned at bottom */}
        <div className="absolute bottom-[42px] left-0 right-0 z-10 px-4">
          <p className="text-base sm:text-base md:text-lg text-white text-center">
            Boutique de composants électroniques premium et salle de jeux immersive. PS5, Xbox, VR et simulation automobile.
          </p>
        </div>
      </section>

      {/* Collections Section - 4 Panels in 2x2 Grid */}
      <section className="bg-black py-16 px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8 w-full mx-auto">
          {/* Panel 1: Salle de Jeux */}
          <div className="relative overflow-hidden group cursor-pointer aspect-square w-full">
            <Image
              src="/section-salle-de-jeux.jpg"
              alt="Salle de Jeux"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            <Link href="/arena" className="absolute inset-0 z-10">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="!text-4xl md:!text-5xl lg:!text-6xl xl:!text-7xl font-bold !text-white mb-2 uppercase leading-none flex items-center gap-3">
                  <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-red-400" />
                  <span>Salle de Jeux</span>
                </h3>
                <p className="!text-white/90 text-base md:text-lg mb-4">
                  Jouez sur PS5, Xbox, VR et simulateurs de course
                </p>
                <button className="jelly-button group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 font-semibold text-base md:text-lg text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 uppercase">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  <span>Découvrir</span>
                </button>
              </div>
            </Link>
          </div>

          {/* Panel 2: Boutique */}
          <div className="relative overflow-hidden group cursor-pointer aspect-square w-full">
            <Image
              src="/section-boutique.jpg"
              alt="Boutique"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            <Link href="/store" className="absolute inset-0 z-10">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="!text-4xl md:!text-5xl lg:!text-6xl xl:!text-7xl font-bold !text-white mb-2 uppercase leading-none flex items-center gap-3">
                  <Store className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-blue-400" />
                  <span>Boutique</span>
                </h3>
                <p className="!text-white/90 text-base md:text-lg mb-4">
                  Composants PC, accessoires gaming et équipements
                </p>
                <button className="jelly-button group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 font-semibold text-base md:text-lg text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 uppercase">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  <span>Explorer</span>
                </button>
              </div>
            </Link>
          </div>

          {/* Panel 3: Restaurant */}
          <div className="relative overflow-hidden group cursor-pointer aspect-square w-full">
            <Image
              src="/geek-gaming-center-restaurant.png"
              alt="Restaurant"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            <Link href="/restaurant" className="absolute inset-0 z-10">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="!text-4xl md:!text-5xl lg:!text-6xl xl:!text-7xl font-bold !text-white mb-2 uppercase leading-none flex items-center gap-3">
                  <UtensilsCrossed className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-orange-400" />
                  <span>Restaurant</span>
                </h3>
                <p className="!text-white/90 text-base md:text-lg mb-4">
                  Restauration rapide et snacks pour les gamers
                </p>
                <button className="jelly-button group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 font-semibold text-base md:text-lg text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 uppercase">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  <span>Commander</span>
                </button>
              </div>
            </Link>
          </div>

          {/* Panel 4: Cinéma */}
          <div className="relative overflow-hidden group cursor-pointer aspect-square w-full">
            <Image
              src="/cinema-latest.png"
              alt="Cinéma"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
            <Link href="/cinema" className="absolute inset-0 z-10">
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="!text-4xl md:!text-5xl lg:!text-6xl xl:!text-7xl font-bold !text-white mb-2 uppercase leading-none flex items-center gap-3">
                  <Film className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-purple-400" />
                  <span>Cinéma</span>
                </h3>
                <p className="!text-white/90 text-base md:text-lg mb-4">
                  Séances privées et projections immersives
                </p>
                <button className="jelly-button group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 font-semibold text-base md:text-lg text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 uppercase">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  <span>Réserver</span>
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black pt-0 pb-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="!text-3xl md:!text-4xl lg:!text-5xl font-bold mb-6 md:mb-10 text-white text-center">
            Pourquoi <span className="gradient-text">Geek Gaming Center</span> ?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-primary-500/10 to-primary-600/5 border border-primary-500/20 p-6 hover:border-primary-500/40 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-8 h-8 text-primary-400" />
                </div>
                <div>
                  <h3 className="!text-2xl md:!text-3xl font-bold mb-3 text-white uppercase">Composants Premium</h3>
                  <p className="text-base md:text-lg text-white/90">
                    Processeurs, cartes graphiques, mémoires, boîtiers et tous les composants pour construire votre PC de rêve.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-accent-500/10 to-accent-600/5 border border-accent-500/20 p-6 hover:border-accent-500/40 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="w-16 h-16 rounded-xl bg-accent-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="w-8 h-8 text-accent-400" />
                </div>
                <div>
                  <h3 className="!text-2xl md:!text-3xl font-bold mb-3 text-white uppercase">Salle de Jeux Immersive</h3>
                  <p className="text-base md:text-lg text-white/90">
                    Louez des postes PS4, PS5, Xbox, explorez la réalité virtuelle ou testez nos simulateurs de course automobile.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-6 hover:border-success/40 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h3 className="!text-2xl md:!text-3xl font-bold mb-3 text-white uppercase">Expertise Technique</h3>
                  <p className="text-base md:text-lg text-white/90">
                    Notre équipe vous conseille pour assembler votre PC et optimiser votre setup gaming.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4 - Cinéma & Restaurant */}
            <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 p-6 hover:border-orange-500/40 transition-all duration-300">
              <div className="flex flex-col gap-4">
                <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UtensilsCrossed className="w-8 h-8 !text-orange-400" />
                </div>
                <div>
                  <h3 className="!text-2xl md:!text-3xl font-bold mb-3 text-white uppercase">Cinéma & Restaurant</h3>
                  <p className="text-base md:text-lg text-white/90">
                    Séances privées de films et restauration rapide pour une expérience unique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section
        onClick={() => window.location.href = '/arena/booking'}
        className="bg-gradient-to-br from-primary-400 to-accent-500 min-h-[20vh] sm:min-h-[30vh] flex items-center justify-center px-4 cursor-pointer"
      >
        <h1 className="text-[3.5rem] sm:text-[5.5rem] md:text-[6.5rem] lg:text-[7rem] font-bold leading-[0.8] kinetic-text uppercase italic text-white text-center">
          Réserver un poste
        </h1>
      </section>

      {/* Gallery Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {/* Gallery Image 1 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/gallery-1.jpg"
                alt="Gallery 1"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 2 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/gallery-2.jpg"
                alt="Gallery 2"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 3 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/gallery-3.jpg"
                alt="Gallery 3"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 4 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/gallery-4.jpg"
                alt="Gallery 4"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 5 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/gallery-5.jpg"
                alt="Gallery 5"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 6 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/gallery-6.jpg"
                alt="Gallery 6"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Otaku Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1: Ciné Otaku */}
            <div className="bento-item group overflow-hidden">
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                <Image
                  src="/sinners.webp"
                  alt="Ciné Otaku"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-2 bg-purple-500/90 rounded-lg backdrop-blur-sm animate-pulse">
                    <Film className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold text-white mb-3 uppercase">Ciné Otaku</h3>
                <p className="text-base text-white mb-6">
                  Séances privées de films et séries en projection immersive avec son surround et ambiance gaming. Tous les genres : animé, action, aventure, thriller, et plus encore.
                </p>
                <Link href="/cinema" className="px-6 py-3 w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Événement Otaku */}
            <div className="bento-item group overflow-hidden">
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                <Image
                  src="/event-otaku.jpg"
                  alt="Événement Otaku"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-2 bg-blue-500/90 rounded-lg backdrop-blur-sm animate-pulse">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold text-white mb-3 uppercase">Événement Otaku</h3>
                <p className="text-base text-white mb-6">
                  Soirées spéciales, tournois cosplay et événements exclusifs pour la communauté otaku.
                </p>
                <Link href="/events" className="px-6 py-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Communauté Otaku */}
            <div className="bento-item group overflow-hidden">
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                <Image
                  src="/community-otaku.png"
                  alt="Communauté Otaku"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-2 bg-pink-500/90 rounded-lg backdrop-blur-sm animate-pulse">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold text-white mb-3 uppercase">Communauté Otaku</h3>
                <p className="text-base text-white mb-6">
                  Rejoignez notre communauté passionnée et partagez vos expériences gaming et otaku.
                </p>
                <a href="https://chat.whatsapp.com/LgWkec30Wh5LFds0Iw78al" target="_blank" rel="noopener noreferrer" className="px-6 py-3 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services CTA Section */}
      <section className="bg-gradient-to-br from-accent-500 to-purple-600 py-16 md:py-24 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/arena/booking" className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center hover:scale-110 transition-transform duration-200 cursor-pointer" style={{ color: '#ffffff !important' }}>
              Anniversaire
            </Link>
            <Link href="/arena/booking" className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center hover:scale-110 transition-transform duration-200 cursor-pointer" style={{ color: '#ffffff !important' }}>
              Groupe
            </Link>
            <Link href="/arena/booking" className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center hover:scale-110 transition-transform duration-200 cursor-pointer" style={{ color: '#ffffff !important' }}>
              Événement
            </Link>
            <Link href="/arena/booking" className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center hover:scale-110 transition-transform duration-200 cursor-pointer" style={{ color: '#ffffff !important' }}>
              Réservation
            </Link>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-white text-center uppercase italic">
            Maintenant ouvert à Yaoundé, Mvog Ada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Google Map - Mode direct sans API key */}
            <div className="aspect-[16/9] relative overflow-hidden rounded-2xl">
              <iframe
                src="https://maps.google.com/maps?q=Geek+Gaming+Center,Mvog+Ada,Yaoundé,Cameroon&t=m&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
              ></iframe>
            </div>
            {/* Image de la salle de jeux */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/images/Salle de Jeux/PHOTO-2025-01-03-20-56-48.webp"
                alt="Geek Gaming Center - Salle de Jeux"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ color: '#ffffff !important' }}>Geek Gaming Center</h3>
                <p className="text-white/90 text-sm md:text-base" style={{ color: 'rgba(255, 255, 255, 0.9) !important' }}>
                  Gaming • Boutique • Restaurant • Cinéma • Événements
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-white text-center uppercase italic">
            FAQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bento-item"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="text-lg font-semibold text-white">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-white flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="pt-0 pb-4 px-0">
                    <p className="text-base text-white leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <InstagramGallery />
        </div>
      </section>
    </div>
  );
}
