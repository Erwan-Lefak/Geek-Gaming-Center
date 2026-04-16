'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Film, Calendar, Clock } from 'lucide-react'

interface Movie {
  id: string
  title: string
  description?: string
  duration: number
  genre?: string
  rating?: string
  posterUrl?: string
  trailerUrl?: string
  director?: string
  actors: string[]
  language?: string
  isActive: boolean
  nowShowing: boolean
  comingSoon: boolean
  screenings: any[]
  _count: { screenings: number }
}

interface Screening {
  id: string
  screenTime: string
  endDate: string
  screenNumber: number
  totalSeats: number
  availableSeats: number
  price: number
  isActive: boolean
  movie: {
    id: string
    title: string
    duration: number
    posterUrl?: string
    rating?: string
  }
  _count: { bookings: number }
}

export default function CinemaPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [screenings, setScreenings] = useState<Screening[]>([])
  const [activeTab, setActiveTab] = useState<'movies' | 'screenings'>('movies')
  const [loading, setLoading] = useState(true)
  const [showMovieModal, setShowMovieModal] = useState(false)
  const [showScreeningModal, setShowScreeningModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)

  // Movie form state
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    duration: 120,
    genre: '',
    rating: 'Tout public',
    posterUrl: '',
    trailerUrl: '',
    director: '',
    actors: [] as string[],
    language: 'VF',
    isActive: true,
    nowShowing: false,
    comingSoon: false,
  })

  // Screening form state
  const [screeningForm, setScreeningForm] = useState({
    movieId: '',
    screenTime: '',
    screenNumber: 1,
    totalSeats: 50,
    price: 2000,
  })

  useEffect(() => {
    fetchMovies()
    fetchScreenings()
  }, [])

  const fetchMovies = async () => {
    try {
      const res = await fetch('/api/dashboard/movies')
      const data = await res.json()
      setMovies(data.movies || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
    }
  }

  const fetchScreenings = async () => {
    try {
      const res = await fetch('/api/dashboard/screenings')
      const data = await res.json()
      setScreenings(data.screenings || [])
    } catch (error) {
      console.error('Error fetching screenings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMovie = async () => {
    try {
      const url = selectedMovie
        ? `/api/dashboard/movies/${selectedMovie.id}`
        : '/api/dashboard/movies'

      const method = selectedMovie ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movieForm),
      })

      if (res.ok) {
        await fetchMovies()
        setShowMovieModal(false)
        setSelectedMovie(null)
        resetMovieForm()
        alert(selectedMovie ? 'Film mis à jour avec succès !' : 'Film créé avec succès !')
      }
    } catch (error) {
      console.error('Error saving movie:', error)
      alert('Erreur lors de la sauvegarde du film')
    }
  }

  const handleDeleteMovie = async (movieId: string, movieTitle: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le film "${movieTitle}" ?`)) {
      return
    }

    try {
      const res = await fetch(`/api/dashboard/movies/${movieId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchMovies()
        alert('Film supprimé avec succès !')
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert('Erreur lors de la suppression du film')
    }
  }

  const handleEditMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setMovieForm({
      title: movie.title,
      description: movie.description || '',
      duration: movie.duration,
      genre: movie.genre || '',
      rating: movie.rating || 'Tout public',
      posterUrl: movie.posterUrl || '',
      trailerUrl: movie.trailerUrl || '',
      director: movie.director || '',
      actors: movie.actors,
      language: movie.language || 'VF',
      isActive: movie.isActive,
      nowShowing: movie.nowShowing,
      comingSoon: movie.comingSoon,
    })
    setShowMovieModal(true)
  }

  const handleSaveScreening = async () => {
    try {
      const res = await fetch('/api/dashboard/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screeningForm),
      })

      if (res.ok) {
        await fetchScreenings()
        setShowScreeningModal(false)
        resetScreeningForm()
        alert('Séance créée avec succès !')
      }
    } catch (error) {
      console.error('Error saving screening:', error)
      alert('Erreur lors de la création de la séance')
    }
  }

  const handleDeleteScreening = async (screeningId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette séance ?')) {
      return
    }

    try {
      const res = await fetch(`/api/dashboard/screenings/${screeningId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchScreenings()
        alert('Séance supprimée avec succès !')
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting screening:', error)
      alert('Erreur lors de la suppression de la séance')
    }
  }

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      description: '',
      duration: 120,
      genre: '',
      rating: 'Tout public',
      posterUrl: '',
      trailerUrl: '',
      director: '',
      actors: [],
      language: 'VF',
      isActive: true,
      nowShowing: false,
      comingSoon: false,
    })
  }

  const resetScreeningForm = () => {
    setScreeningForm({
      movieId: '',
      screenTime: '',
      screenNumber: 1,
      totalSeats: 50,
      price: 2000,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cinéma</h1>
          <p className="text-gray-600 mt-1">Gestion des films et des séances</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setActiveTab('movies')
              setShowMovieModal(true)
              resetMovieForm()
              setSelectedMovie(null)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Film size={20} />
            Nouveau Film
          </button>
          <button
            onClick={() => {
              setActiveTab('screenings')
              setShowScreeningModal(true)
              resetScreeningForm()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Calendar size={20} />
            Nouvelle Séance
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('movies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movies'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Films ({movies.length})
          </button>
          <button
            onClick={() => setActiveTab('screenings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'screenings'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Séances ({screenings.length})
          </button>
        </nav>
      </div>

      {/* Movies Tab */}
      {activeTab === 'movies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">{movie.title}</h3>
                  <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                    {movie.rating}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{movie.genre}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <Clock size={16} />
                  <span>{movie.duration} min</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {movie.nowShowing && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                      À l'affiche
                    </span>
                  )}
                  {movie.comingSoon && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                      Bientôt
                    </span>
                  )}
                  {!movie.isActive && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                      Inactif
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {movie._count.screenings} séance{movie._count.screenings > 1 ? 's' : ''}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditMovie(movie)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    <Pencil size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie.id, movie.title)}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Screenings Tab */}
      {activeTab === 'screenings' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Film
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Places
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réservations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {screenings.map((screening) => (
                <tr key={screening.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{screening.movie.title}</div>
                    <div className="text-sm text-gray-500">{screening.movie.duration} min</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(screening.screenTime).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(screening.screenTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Salle {screening.screenNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {screening.availableSeats} / {screening.totalSeats}
                    </div>
                    <div className="text-xs text-gray-500">
                      disponibles
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {screening.price} FCFA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {screening._count.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteScreening(screening.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Movie Modal */}
      {showMovieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {selectedMovie ? 'Modifier le Film' : 'Nouveau Film'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée (minutes) *
                    </label>
                    <input
                      type="number"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Genre
                    </label>
                    <input
                      type="text"
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Action, Comédie, Drama..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Classification
                    </label>
                    <select
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Tout public">Tout public</option>
                      <option value="-12">-12 ans</option>
                      <option value="-16">-16 ans</option>
                      <option value="-18">-18 ans</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Langue
                    </label>
                    <input
                      type="text"
                      value={movieForm.language}
                      onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'affiche
                  </label>
                  <input
                    type="url"
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la bande-annonce
                  </label>
                  <input
                    type="url"
                    value={movieForm.trailerUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={movieForm.isActive}
                      onChange={(e) => setMovieForm({ ...movieForm, isActive: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Actif</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={movieForm.nowShowing}
                      onChange={(e) => setMovieForm({ ...movieForm, nowShowing: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">À l'affiche</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={movieForm.comingSoon}
                      onChange={(e) => setMovieForm({ ...movieForm, comingSoon: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Bientôt</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveMovie}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {selectedMovie ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  onClick={() => {
                    setShowMovieModal(false)
                    setSelectedMovie(null)
                    resetMovieForm()
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screening Modal */}
      {showScreeningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Nouvelle Séance</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Film *
                  </label>
                  <select
                    value={screeningForm.movieId}
                    onChange={(e) => setScreeningForm({ ...screeningForm, movieId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  >
                    <option value="">Sélectionner un film</option>
                    {movies.filter(m => m.isActive).map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title} ({movie.duration} min)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date et heure *
                  </label>
                  <input
                    type="datetime-local"
                    value={screeningForm.screenTime}
                    onChange={(e) => setScreeningForm({ ...screeningForm, screenTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salle
                    </label>
                    <input
                      type="number"
                      value={screeningForm.screenNumber}
                      onChange={(e) => setScreeningForm({ ...screeningForm, screenNumber: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Places totales
                    </label>
                    <input
                      type="number"
                      value={screeningForm.totalSeats}
                      onChange={(e) => setScreeningForm({ ...screeningForm, totalSeats: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={screeningForm.price}
                    onChange={(e) => setScreeningForm({ ...screeningForm, price: parseInt(e.target.value) })}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveScreening}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Créer
                </button>
                <button
                  onClick={() => {
                    setShowScreeningModal(false)
                    resetScreeningForm()
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
