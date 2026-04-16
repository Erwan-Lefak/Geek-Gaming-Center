'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Film, Calendar, Clock, X } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

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
  price: number | string
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
  const [showDeleteMovieModal, setShowDeleteMovieModal] = useState(false)
  const [showDeleteScreeningModal, setShowDeleteScreeningModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
    nowShowing: true, // Changed to true by default so new films appear on /cinema page
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
    if (!movieForm.title) {
      alert('Le titre du film est requis')
      return
    }

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
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la sauvegarde du film')
      }
    } catch (error) {
      console.error('Error saving movie:', error)
      alert('Erreur lors de la sauvegarde du film')
    }
  }

  const handleDeleteMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setShowDeleteMovieModal(true)
  }

  const handleDeleteMovieConfirm = async () => {
    if (!selectedMovie) {
      alert('Aucun film sélectionné')
      return
    }

    if (!selectedMovie.id) {
      alert('ID de film manquant')
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/dashboard/movies/${selectedMovie.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchMovies()
        setShowDeleteMovieModal(false)
        setSelectedMovie(null)
        alert('Film supprimé avec succès !')
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting movie:', error)
      alert('Erreur lors de la suppression du film')
    } finally {
      setIsDeleting(false)
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
    // Validation
    if (!screeningForm.movieId) {
      alert('Veuillez sélectionner un film')
      return
    }
    if (!screeningForm.screenTime) {
      alert('Veuillez sélectionner une date et heure')
      return
    }
    if (!screeningForm.price || screeningForm.price <= 0) {
      alert('Veuillez entrer un prix valide')
      return
    }

    try {
      const res = await fetch('/api/dashboard/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screeningForm),
      })

      const data = await res.json()

      if (res.ok) {
        await fetchScreenings()
        setShowScreeningModal(false)
        resetScreeningForm()
        alert('Séance créée avec succès !')
      } else {
        alert(data.error || 'Erreur lors de la création de la séance')
      }
    } catch (error) {
      console.error('Error saving screening:', error)
      alert('Erreur lors de la création de la séance')
    }
  }

  const handleDeleteScreening = (screening: Screening) => {
    setSelectedScreening(screening)
    setShowDeleteScreeningModal(true)
  }

  const handleDeleteScreeningConfirm = async () => {
    if (!selectedScreening) {
      alert('Aucune séance sélectionnée')
      return
    }

    if (!selectedScreening.id) {
      alert('ID de séance manquant')
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/dashboard/screenings/${selectedScreening.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchScreenings()
        setShowDeleteScreeningModal(false)
        setSelectedScreening(null)
        alert('Séance supprimée avec succès !')
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting screening:', error)
      alert('Erreur lors de la suppression de la séance')
    } finally {
      setIsDeleting(false)
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
      nowShowing: true, // Changed to true by default
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
    <div className="min-h-screen mt-28 lg:mt-20" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Cinéma</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Gestion des films et des séances</p>
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b mb-6" style={{ borderColor: 'var(--border)' }}>
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('movies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'movies'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent hover:text-gray-700'
              }`}
              style={{ color: activeTab === 'movies' ? undefined : 'var(--muted-foreground)' }}
            >
              Films ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab('screenings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'screenings'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent hover:text-gray-700'
              }`}
              style={{ color: activeTab === 'screenings' ? undefined : 'var(--muted-foreground)' }}
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
                className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                style={{ backgroundColor: 'var(--card)' }}
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
                    <h3 className="text-lg font-bold flex-1" style={{ color: 'var(--foreground)' }}>{movie.title}</h3>
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                      {movie.rating}
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>{movie.genre}</p>
                  <div className="flex items-center gap-2 text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
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
                  <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
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
                      onClick={() => handleDeleteMovie(movie)}
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
          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
              <thead className="bg-gray-50" style={{ backgroundColor: 'var(--muted)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Film
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Date & Heure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Salle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Places
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Réservations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
                {screenings.map((screening) => (
                  <tr key={screening.id} className="hover:bg-gray-50" style={{ hover: { backgroundColor: 'var(--muted)' } }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{screening.movie.title}</div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{screening.movie.duration} min</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {new Date(screening.screenTime).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(screening.screenTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--foreground)' }}>
                      Salle {screening.screenNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--foreground)' }}>
                        {screening.availableSeats} / {screening.totalSeats}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        disponibles
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--foreground)' }}>
                      {screening.price} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--foreground)' }}>
                      {screening._count.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteScreening(screening)}
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
      </div>

      {/* Movie Modal */}
      <Modal
        isOpen={showMovieModal}
        onClose={() => {
          setShowMovieModal(false)
          setSelectedMovie(null)
          resetMovieForm()
        }}
        title={selectedMovie ? 'Modifier le Film' : 'Nouveau Film'}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Titre *
            </label>
            <input
              type="text"
              value={movieForm.title}
              onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Description
            </label>
            <textarea
              value={movieForm.description}
              onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Durée (minutes) *
              </label>
              <input
                type="number"
                value={movieForm.duration}
                onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Genre
              </label>
              <input
                type="text"
                value={movieForm.genre}
                onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                placeholder="Action, Comédie, Drama..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Classification
              </label>
              <select
                value={movieForm.rating}
                onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              >
                <option value="Tout public">Tout public</option>
                <option value="-12">-12 ans</option>
                <option value="-16">-16 ans</option>
                <option value="-18">-18 ans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Langue
              </label>
              <input
                type="text"
                value={movieForm.language}
                onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              URL de l'affiche
            </label>
            <input
              type="url"
              value={movieForm.posterUrl}
              onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              URL de la bande-annonce
            </label>
            <input
              type="url"
              value={movieForm.trailerUrl}
              onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
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
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Actif</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={movieForm.nowShowing}
                onChange={(e) => setMovieForm({ ...movieForm, nowShowing: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>À l'affiche</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={movieForm.comingSoon}
                onChange={(e) => setMovieForm({ ...movieForm, comingSoon: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: 'var(--foreground)' }}>Bientôt</span>
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
      </Modal>

      {/* Screening Modal */}
      <Modal
        isOpen={showScreeningModal}
        onClose={() => {
          setShowScreeningModal(false)
          resetScreeningForm()
        }}
        title="Nouvelle Séance"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Film *
            </label>
            <select
              value={screeningForm.movieId}
              onChange={(e) => setScreeningForm({ ...screeningForm, movieId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
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
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Date et heure *
            </label>
            <input
              type="datetime-local"
              value={screeningForm.screenTime}
              onChange={(e) => setScreeningForm({ ...screeningForm, screenTime: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Salle
              </label>
              <input
                type="number"
                value={screeningForm.screenNumber}
                onChange={(e) => setScreeningForm({ ...screeningForm, screenNumber: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                Places totales
              </label>
              <input
                type="number"
                value={screeningForm.totalSeats}
                onChange={(e) => setScreeningForm({ ...screeningForm, totalSeats: parseInt(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Prix (FCFA) *
            </label>
            <input
              type="number"
              value={screeningForm.price}
              onChange={(e) => setScreeningForm({ ...screeningForm, price: parseInt(e.target.value) })}
              min="0"
              className="w-full px-3 py-2 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
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
      </Modal>

      {/* Delete Movie Confirmation Modal */}
      <Modal
        isOpen={showDeleteMovieModal}
        onClose={() => {
          setShowDeleteMovieModal(false)
          setSelectedMovie(null)
        }}
        title="Confirmer la suppression"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-medium mb-2">⚠️ Attention</p>
            <p className="text-red-800 text-sm">
              Vous êtes sur le point de supprimer le film :
            </p>
            <p className="text-red-900 font-bold mt-2">
              {selectedMovie?.title}
            </p>
          </div>

          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Cette action est irréversible. Toutes les séances associées à ce film seront également supprimées.
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowDeleteMovieModal(false)
                setSelectedMovie(null)
              }}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteMovieConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Screening Confirmation Modal */}
      <Modal
        isOpen={showDeleteScreeningModal}
        onClose={() => {
          setShowDeleteScreeningModal(false)
          setSelectedScreening(null)
        }}
        title="Confirmer la suppression"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-900 font-medium mb-2">⚠️ Attention</p>
            <p className="text-red-800 text-sm">
              Vous êtes sur le point de supprimer la séance de :
            </p>
            <p className="text-red-900 font-bold mt-2">
              {selectedScreening?.movie.title}
            </p>
            <p className="text-red-700 text-sm mt-1">
              {new Date(selectedScreening?.screenTime || '').toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Cette action est irréversible. La séance sera définitivement supprimée.
          </p>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={() => {
                setShowDeleteScreeningModal(false)
                setSelectedScreening(null)
              }}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteScreeningConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Suppression...
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
