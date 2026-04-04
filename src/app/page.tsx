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

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      <section className="relative flex items-center justify-center overflow-hidden h-[calc(100vh-4.25rem)] sm:h-[calc(100vh-6rem)] mt-[4.25rem] sm:mt-[6rem]">
        {/* Image Carousel Background */}
        <ImageCarousel />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
          <div className="w-full">
            {/* Main Headline */}
            <h1 className="text-[4rem] sm:text-[4.7rem] md:text-[5.3rem] lg:text-[6.7rem] font-bold mb-4 leading-[0.8] kinetic-text text-white uppercase italic">
              Votre Destination <span className="gradient-text block">Gaming Ultime</span>
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-row gap-4 items-start mb-8">
              <Link
                  href="/store"
                  className="jelly-button group relative px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 font-semibold text-xl sm:text-2xl md:text-3xl text-white shadow-glow hover:shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 uppercase"
                >
                  <Cpu className="w-5 h-5 text-primary-400" />
                  <span>Explorer la Boutique</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

              <Link
                  href="/arena"
                  className="jelly-button group px-8 py-4 bg-surface border border-border font-semibold text-xl sm:text-2xl md:text-3xl hover:bg-elevated transition-all duration-300 flex items-center gap-2 uppercase"
                >
                  <Gamepad2 className="w-5 h-5 text-primary-400" />
                  <span className="text-white">Salle de Jeux</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
            </div>
          </div>
        </div>

        {/* Description text positioned at bottom */}
        <div className="absolute bottom-[42px] left-0 right-0 z-10 px-4">
          <p className="text-sm sm:text-base md:text-lg text-white text-center">
            Boutique de composants électroniques premium et salle de jeux immersive. PS5, Xbox, VR et simulation automobile.
          </p>
        </div>
      </section>

      {/* Collections Section - 3 Panels */}
      <section className="bg-black py-8 px-4 md:px-16 lg:px-32">
        <div className="flex flex-col md:flex-row gap-0 md:gap-0.5 max-w-7xl mx-auto">
          {/* Panel 1: Salle de Jeux */}
          <div className="flex-1 relative overflow-hidden group cursor-pointer aspect-square md:h-96 lg:h-[500px] -skew-x-15">
            <div className="absolute inset-0 skew-x-15 transform-origin-left">
              <Image
                src="/section-salle-de-jeux.jpg"
                alt="Salle de Jeux"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33.33vw"
              />
            </div>
            <Link href="/arena" className="absolute inset-0 z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 uppercase">
                  Salle de Jeux
                </h3>
                <p className="text-white/80 text-base md:text-lg mb-4">
                  Jouez sur PS5, Xbox, VR et simulateurs de course
                </p>
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 border-2 border-white text-white font-bold text-sm md:text-base uppercase transition-all duration-300">
                  Découvrir
                </button>
              </div>
            </Link>
          </div>

          {/* Panel 2: Boutique */}
          <div className="flex-1 relative overflow-hidden group cursor-pointer aspect-square md:h-96 lg:h-[500px] -skew-x-15">
            <div className="absolute inset-0 skew-x-15 transform-origin-left">
              <Image
                src="/section-boutique.jpg"
                alt="Boutique"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33.33vw"
              />
            </div>
            <Link href="/store" className="absolute inset-0 z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 uppercase">
                  Boutique
                </h3>
                <p className="text-white/80 text-base md:text-lg mb-4">
                  Composants PC, accessoires gaming et équipements
                </p>
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 border-2 border-white text-white font-bold text-sm md:text-base uppercase transition-all duration-300">
                  Explorer
                </button>
              </div>
            </Link>
          </div>

          {/* Panel 3: Restaurant */}
          <div className="flex-1 relative overflow-hidden group cursor-pointer aspect-square md:h-96 lg:h-[500px] -skew-x-15">
            <div className="absolute inset-0 skew-x-15 transform-origin-left">
              <Image
                src="/section-restaurant.jpg"
                alt="Restaurant"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33.33vw"
              />
            </div>
            <Link href="#" className="absolute inset-0 z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20">
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 uppercase">
                  Restaurant
                </h3>
                <p className="text-white/80 text-base md:text-lg mb-4">
                  Restauration rapide et snacks pour les gamers
                </p>
                <button className="px-6 py-3 bg-red-600 hover:bg-red-700 border-2 border-white text-white font-bold text-sm md:text-base uppercase transition-all duration-300">
                  Commander
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-black py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-12 text-white">
            Pourquoi <span className="gradient-text">Geek Gaming Center</span> ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className="bento-item">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Composants Premium</h3>
                  <p className="text-base text-white">
                    Processeurs, cartes graphiques, mémoires, boîtiers et tous les composants pour construire votre PC de rêve.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bento-item">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Salle de Jeux Immersive</h3>
                  <p className="text-base text-white">
                    Louez des postes PS4, PS5, Xbox, explorez la réalité virtuelle ou testez nos simulateurs de course automobile.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bento-item">
              <div className="flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-white">Expertise Technique</h3>
                  <p className="text-base text-white">
                    Notre équipe vous conseille pour assembler votre PC et optimiser votre setup gaming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="bg-gradient-to-br from-primary-400 to-accent-500 min-h-[30vh] flex items-center justify-center px-4">
        <h1 className="text-[4rem] sm:text-[4.7rem] md:text-[5.3rem] lg:text-[6.7rem] font-bold leading-[0.8] kinetic-text uppercase italic text-white text-center">
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
                src="/arena-gallery/PHOTO-2024-12-07-12-31-46.jpg"
                alt="Gallery 1"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 2 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-47.jpg"
                alt="Gallery 2"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 3 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-48.jpg"
                alt="Gallery 3"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 4 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-49.jpg"
                alt="Gallery 4"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 5 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-50.jpg"
                alt="Gallery 5"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Gallery Image 6 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-51.jpg"
                alt="Gallery 6"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Service 1: Boutique */}
            <div className="bento-item text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center">
                  <Store className="w-10 h-10 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase">Boutique</h3>
                  <p className="text-base text-white mb-6">
                    Découvrez notre sélection de composants PC, accessoires gaming et équipements haut de gamme.
                  </p>
                  <Link
                    href="/store"
                    className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Voir la boutique
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Service 2: Salle de Jeux */}
            <div className="bento-item text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-accent-500/20 flex items-center justify-center">
                  <Gamepad2 className="w-10 h-10 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase">Salle de Jeux</h3>
                  <p className="text-base text-white mb-6">
                    Réservez vos postes PS5, Xbox, VR ou simulateurs de course automobile.
                  </p>
                  <Link
                    href="/arena/booking"
                    className="px-8 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Réserver
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Service 3: Ciné */}
            <div className="bento-item text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase">Ciné</h3>
                  <p className="text-base text-white mb-6">
                    Profitez de séances privées de cinéma avec écrans ultra-haute définition et son immersif.
                  </p>
                  <Link
                    href="#"
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Réserver
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Service 4: Restaurant */}
            <div className="bento-item text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <UtensilsCrossed className="w-10 h-10 text-red-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 uppercase">Restaurant</h3>
                  <p className="text-base text-white mb-6">
                    Dégustez notre restauration rapide et snacks savoureux pour les gamers.
                  </p>
                  <Link
                    href="#"
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center gap-2"
                  >
                    Voir le menu
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Otaku Section */}
      <section className="bg-black py-12 md:py-16 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1: Ciné Otaku */}
            {/* Card 1: Ciné Otaku */}
            <div className="bento-item group overflow-hidden">
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                <Image
                  src="/arena-gallery/PHOTO-2024-12-07-12-31-46.jpg"
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
                <h3 className="text-2xl font-bold text-white mb-3 uppercase">Ciné Otaku</h3>
                <p className="text-base text-white mb-6">
                  Séances privées d'anime et manga en projection immersive avec son surround et ambiance gaming.
                </p>
                <button className="px-6 py-3 w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 2: Événement Otaku */}
            <div className="bento-item group overflow-hidden">
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                <Image
                  src="/arena-gallery/PHOTO-2024-12-07-12-31-47.jpg"
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
                <h3 className="text-2xl font-bold text-white mb-3 uppercase">Événement Otaku</h3>
                <p className="text-base text-white mb-6">
                  Soirées spéciales, tournois cosplay et événements exclusifs pour la communauté otaku.
                </p>
                <button className="px-6 py-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card 3: Communauté Otaku */}
            <div className="bento-item group overflow-hidden">
              <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                <Image
                  src="/arena-gallery/PHOTO-2024-12-07-12-31-48.jpg"
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
                <h3 className="text-2xl font-bold text-white mb-3 uppercase">Communauté Otaku</h3>
                <p className="text-base text-white mb-6">
                  Rejoignez notre communauté passionnée et partagez vos expériences gaming et otaku.
                </p>
                <button className="px-6 py-3 w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold uppercase text-lg hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center gap-2">
                  En savoir plus
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services CTA Section */}
      <section className="bg-gradient-to-br from-accent-500 to-purple-600 py-16 md:py-24 px-4">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center">
              Anniversaire
            </h1>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center">
              Groupe
            </h1>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center">
              Événement
            </h1>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight kinetic-text uppercase italic text-white text-center">
              Réservation
            </h1>
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
            {/* Map Image */}
            <div className="aspect-video relative overflow-hidden rounded-xl">
              <Image
                src="/section-boutique.jpg"
                alt="Map"
                fill
                className="object-cover"
              />
            </div>
            {/* Location Photo */}
            <div className="aspect-video relative overflow-hidden rounded-xl">
              <Image
                src="/section-salle-de-jeux.jpg"
                alt="Lieu"
                fill
                className="object-cover"
              />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mb-8 md:mb-12">
            {/* Instagram Image 1 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-49.jpg"
                alt="Instagram 1"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Instagram Image 2 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-50.jpg"
                alt="Instagram 2"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Instagram Image 3 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-51.jpg"
                alt="Instagram 3"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Instagram Image 4 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-46.jpg"
                alt="Instagram 4"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Instagram Image 5 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-47.jpg"
                alt="Instagram 5"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Instagram Image 6 */}
            <div className="aspect-square relative overflow-hidden group">
              <Image
                src="/arena-gallery/PHOTO-2024-12-07-12-31-48.jpg"
                alt="Instagram 6"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white uppercase italic">
              Suivez nous sur Instagram
            </h2>
            <Instagram className="w-8 h-8 text-pink-500" />
          </div>
        </div>
      </section>
    </div>
  );
}
