/**
 * Cinema Page - Geek Gaming Center
 * Sessions du soir avec affiches de films/séries
 */

'use client';

import { useState } from 'react';
import { Film, Clock, Calendar, Info, Play } from 'lucide-react';
import Header from '@/components/ui/Header';
import Image from 'next/image';

export default function CinemaPage() {
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<number>(0);

  // Générer les dates de la semaine (7 jours à partir d'aujourd'hui)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const shows = [
    {
      id: 'one-piece',
      title: 'One Piece Live Action',
      subtitle: 'Netflix - Saisons 1 & 2',
      poster: '/one-piece-live-action.jpeg',
      duration: '45-60 min/ép',
      episodes: 'S1: 8 épisodes | S2: Annoncée',
      genre: 'Aventure / Action',
      rating: '16+',
      synopsis: 'Monkey D. Luffy, un jeune aventurier au corps en caoutchouc, rêve de devenir le Roi des Pirates. Avec son équipage - Zoro, Nami, Usopp et Sanji - il navigue sur le Grand Line à la recherche du légendaire trésor "One Piece". Une adaptation épique du manga d\'Eiichiro Oda qui capture l\'esprit d\'aventure et l\'amitié qui font le succès de la franchise.',
      sessions: [
        { time: '21:00', status: 'available' },
        { time: '22:30', status: 'available' },
      ],
      type: 'series' as const,
      colors: 'from-blue-600 to-cyan-500'
    },
    {
      id: 'sinners',
      title: 'Sinners',
      subtitle: 'Ryan Coogler - 2025',
      poster: '/sinners.webp',
      duration: '2h 15min',
      episodes: 'Film',
      genre: 'Drame / Thriller',
      rating: '18+',
      synopsis: 'Le nouveau film de Ryan Coogler avec Michael B. Jordan. Une histoire poignante de rédemption et de sacrifice se déroulant dans les rues de Los Angeles. Deux jumeaux séparés à la naissance se retrouvent des années plus tard, chacun pris dans des spirales différentes. Un thriller dramatique explorant les thèmes de la famille, de la loyauté et des choix qui définissent notre destinée.',
      sessions: [
        { time: '21:00', status: 'limited' },
        { time: '23:30', status: 'available' },
      ],
      type: 'movie' as const,
      colors: 'from-purple-600 to-pink-500'
    },
    {
      id: 'jjk',
      title: 'Jujutsu Kaisen',
      subtitle: 'Saison 1 & 2',
      poster: '/jujutsu-kaisen.jpeg',
      duration: '23 min/ép',
      episodes: '47 épisodes (S1: 24 | S2: 23)',
      genre: 'Anime / Action Surnaturelle',
      rating: '16+',
      synopsis: 'Yuji Itadori, un lycéen aux capacités physiques extraordinaires, se retrouve entraîné dans le monde des malédictions après avoir ingéré le doigt de Ryomen Sukuna, le Roi des Malédictions. Rejoignant l\'école de magie de Tokyo, il apprend à maîtriser ses pouvoirs tout en combattant les esprits maléfiques. La saison 2 adapte l\'arc Shibuya, considéré comme l\'un des meilleurs arcs de l\'histoire de l\'anime moderne.',
      sessions: [
        { time: '21:00', status: 'available' },
        { time: '23:00', status: 'full' },
      ],
      type: 'series' as const,
      colors: 'from-red-600 to-orange-500'
    },
    {
      id: 'f1',
      title: 'F1',
      subtitle: 'Brad Pitt - 2025',
      poster: '/f1-movie.jpg',
      duration: '2h 30min',
      episodes: 'Film',
      genre: 'Sport / Drame',
      rating: 'Tous publics',
      synopsis: 'Un pilote vétéran revenu à la compétition fait équipe avec une équipe en difficulté. Son objectif : battre les champions en titre et les jeunes prodiges de la Formule 1. Tourné pendant les vrais Grands Prix, ce film plonge le spectateur dans l\'intensité, la vitesse et les enjeux du sport automobile. Avec la participation de septuples champions du monde en vedette.',
      sessions: [
        { time: '20:30', status: 'available' },
        { time: '23:00', status: 'limited' },
      ],
      type: 'movie' as const,
      colors: 'from-gray-600 to-red-500'
    },
    {
      id: 'snowfall',
      title: 'Snowfall',
      subtitle: 'Séries FX - Saisons 1 à 6',
      poster: '/snowfall.jpg',
      duration: '45-50 min/ép',
      episodes: '60 épisodes (6 saisons)',
      genre: 'Drame / Crime',
      rating: '18+',
      synopsis: 'Los Angeles, 1983. Franklin Saint, jeune homme ambitieux d\'South Central, voit une opportunité dans l\'émergence du crack-cocaïne. La série suit son ascension dans le monde du trafic, tout en explorant les conséquences devastatrices de l\'épidémie de crack sur la communauté noire américaine. Une plongée brutale et captivante dans une période sombre de l\'histoire américaine, mêlant personnages fictifs et événements réels.',
      sessions: [
        { time: '21:00', status: 'available' },
        { time: '22:30', status: 'available' },
      ],
      type: 'series' as const,
      colors: 'from-indigo-600 to-blue-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'limited':
        return 'bg-yellow-500';
      case 'full':
        return 'bg-red-500 opacity-60 cursor-not-allowed';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Places disponibles';
      case 'limited':
        return 'Dernières places';
      case 'full':
        return 'Complet';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />

      {/* Info Bar */}
      <section className="bg-black py-6 border-b border-border mt-[8.5rem] md:mt-[6rem]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-500" />
              <div className="cinema-info-text">
                <p className="font-semibold">Horaires</p>
                <p className="text-sm">Tous les soirs: 21h - Minuit</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-pink-500" />
              <div className="cinema-info-text">
                <p className="font-semibold">Réservation</p>
                <p className="text-sm">Sur place ou par téléphone</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Date Selection */}
      <section className="bg-black py-8 px-4 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-xl font-bold text-white mb-4 uppercase">Choisissez une date</h2>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {dates.map((date, index) => {
              const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
              const isActive = activeDate === index;
              const isToday = index === 0;

              return (
                <button
                  key={index}
                  onClick={() => setActiveDate(index)}
                  className={`flex-shrink-0 px-6 py-4 rounded-xl font-bold transition-all duration-300 cinema-date-button ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white scale-105 shadow-lg'
                      : 'bg-surface hover:bg-elevated'
                  }`}
                >
                  <div className="text-center">
                    {isToday && <p className="text-xs opacity-80 mb-1">Aujourd'hui</p>}
                    <p>{dateStr}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Shows Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center uppercase">
            À l'affiche ce soir
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {shows.map((show) => (
              <div
                key={show.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                  <Image
                    src={show.poster}
                    alt={show.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span
                      className="px-3 py-1 bg-black/60 backdrop-blur-sm text-xs font-bold rounded-full uppercase cinema-rating-badge"
                      style={{ color: '#ffffff !important' } as any}
                    >
                      {show.rating}
                    </span>
                    {show.type === 'series' && (
                      <span
                        className="px-3 py-1 bg-black/60 backdrop-blur-sm text-xs font-bold rounded-full uppercase cinema-rating-badge"
                        style={{ color: '#ffffff !important' } as any}
                      >
                        Série
                      </span>
                    )}
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => setSelectedShow(show.id === selectedShow ? null : show.id)}
                      className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Info className="w-8 h-8 text-black" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-purple-500 transition-colors">
                      {show.title}
                    </h3>
                    <p className="text-white/60 text-sm mb-2">{show.subtitle}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {show.genre}
                      </span>
                      <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full">
                        {show.duration}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm">{show.episodes}</p>
                  </div>

                  {/* Sessions */}
                  <div className="border-t border-border pt-4">
                    <p className="text-white font-semibold mb-3 text-sm uppercase">Sessions disponibles</p>
                    <div className="space-y-2">
                      {show.sessions.map((session, idx) => (
                        <button
                          key={idx}
                          disabled={session.status === 'full'}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all cinema-session-button ${
                            session.status === 'full'
                              ? 'opacity-50 cursor-not-allowed'
                              : 'bg-black/40 hover:bg-purple-500/20'
                          }`}
                        >
                          <span className="text-white font-bold">{session.time}</span>
                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full cinema-status-badge !text-white ${getStatusColor(session.status)}`}
                          >
                            {getStatusText(session.status)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal pour détails */}
      {selectedShow && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedShow(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const show = shows.find(s => s.id === selectedShow);
              if (!show) return null;
              return (
                <div className="p-8">
                  <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-6">
                    <Image
                      src={show.poster}
                      alt={show.title}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${show.colors} opacity-30`} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{show.title}</h2>
                  <p className="text-white/60 mb-4">{show.subtitle}</p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      {show.genre}
                    </span>
                    <span className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-sm">
                      {show.duration}
                    </span>
                    <span
                      className="px-3 py-1 bg-red-500/20 rounded-full text-sm cinema-rating-badge"
                      style={{ color: '#ffffff !important' } as any}
                    >
                      {show.rating}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Synopsis</h3>
                  <p className="text-white/80 mb-6 leading-relaxed">{show.synopsis}</p>
                  <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold uppercase rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                      <Play className="w-5 h-5" />
                      Réserver
                    </button>
                    <button
                      onClick={() => setSelectedShow(null)}
                      className="px-8 py-4 bg-transparent border-2 border-white/20 text-white font-bold uppercase rounded-xl hover:bg-white/10 transition-all"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
