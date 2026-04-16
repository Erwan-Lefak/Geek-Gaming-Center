/**
 * Cinema Page - Geek Gaming Center
 * Sessions du soir avec affiches de films/séries
 * Synchronisé avec la base de données du dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, Info, Play } from 'lucide-react';
import Header from '@/components/ui/Header';
import Image from 'next/image';

interface Show {
  id: string;
  title: string;
  subtitle: string;
  poster: string;
  duration: string;
  episodes: string;
  genre: string;
  rating: string;
  synopsis: string;
  sessions: Array<{
    time: string;
    status: 'available' | 'limited' | 'full';
    screeningId?: string;
    price?: number;
  }>;
  type: 'movie' | 'series';
  colors: string;
}

export default function CinemaPage() {
  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<number>(0);
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  // Générer les dates de la semaine (7 jours à partir d'aujourd'hui)
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/cinema/movies?nowShowing=true');
        if (!res.ok) throw new Error('Failed to fetch movies');
        const data = await res.json();
        setShows(data.movies || []);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [activeDate]); // Re-fetch when date changes

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Chargement...</div>
        </div>
      </div>
    );
  }

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

          {shows.length === 0 ? (
            <div className="text-center text-white/60 text-xl py-20">
              Aucun film à l'affiche pour le moment
            </div>
          ) : (
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
                        {show.sessions.length === 0 ? (
                          <p className="text-white/60 text-sm text-center py-4">Aucune séance programmée</p>
                        ) : (
                          show.sessions.map((session, idx) => (
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
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal pour détails */}
      {selectedShow && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedShow(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
