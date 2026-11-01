'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Film, Calendar, Clock, X, Upload } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  DashPageHeader,
  DashCard,
  DashEmpty,
  DashBadge,
  dashInputCls,
  dashSelectCls,
  dashBtnPrimaryCls,
  dashBtnOutlineCls,
  dashBtnGhostCls,
  dashTableHeadCls,
} from '../components/dash-ui'

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

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      const formData = new FormData()
      formData.append('files', files[0]) // Only upload one poster

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.files[0].url
        setMovieForm({ ...movieForm, posterUrl: imageUrl })
      } else {
        alert("Erreur lors de l'upload de l'image")
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert("Erreur lors de l'upload de l'image")
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
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-b-transparent" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <DashPageHeader
        title="Cinéma"
        description="Gestion des films et des séances"
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('movies')
                setShowMovieModal(true)
                resetMovieForm()
                setSelectedMovie(null)
              }}
              className={dashBtnPrimaryCls}
            >
              <Film className="h-4 w-4" />
              Nouveau film
            </button>
            <button
              onClick={() => {
                setActiveTab('screenings')
                setShowScreeningModal(true)
                resetScreeningForm()
              }}
              className={dashBtnOutlineCls}
            >
              <Calendar className="h-4 w-4" />
              Nouvelle séance
            </button>
          </div>
        }
      />

      {/* Onglets */}
      <div className="flex gap-1.5 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('movies')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
            activeTab === 'movies'
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          )}
        >
          <Film className="h-4 w-4" />
          Films <span className="tabular-nums">({movies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('screenings')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
            activeTab === 'screenings'
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          )}
        >
          <Calendar className="h-4 w-4" />
          Séances <span className="tabular-nums">({screenings.length})</span>
        </button>
      </div>

      {/* Onglet Films */}
      {activeTab === 'movies' && (
        movies.length === 0 ? (
          <div className="dash-card">
            <DashEmpty icon={Film} title="Aucun film enregistré" hint="Ajoutez votre premier film" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {movies.map((movie) => (
              <div key={movie.id} className="dash-card flex flex-col overflow-hidden">
                {movie.posterUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-64 w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-1.5 flex items-start justify-between gap-2">
                    <h3 className="flex-1 font-semibold text-slate-100">{movie.title}</h3>
                    <DashBadge label={movie.rating ?? '—'} tone="violet" />
                  </div>
                  <p className="mb-2 text-xs text-slate-500">{movie.genre}</p>
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    {movie.duration} min
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {movie.nowShowing && (
                      <DashBadge label="À l'affiche" tone="emerald" />
                    )}
                    {movie.comingSoon && (
                      <DashBadge label="Bientôt" tone="sky" />
                    )}
                    {!movie.isActive && (
                      <DashBadge label="Inactif" tone="slate" />
                    )}
                  </div>
                  <p className="mb-4 text-sm text-slate-500">
                    {movie._count.screenings} séance{movie._count.screenings > 1 ? 's' : ''}
                  </p>
                  <div className="mt-auto flex gap-2 border-t border-white/5 pt-3">
                    <button
                      onClick={() => handleEditMovie(movie)}
                      className={cn(dashBtnOutlineCls, 'flex-1 justify-center py-2 text-xs')}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie)}
                      title="Supprimer"
                      className={cn(dashBtnGhostCls, 'hover:text-rose-400')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Onglet Séances */}
      {activeTab === 'screenings' && (
        <DashCard title={`${screenings.length} séance${screenings.length > 1 ? 's' : ''}`}>
          {screenings.length === 0 ? (
            <DashEmpty icon={Calendar} title="Aucune séance programmée" />
          ) : (
            <div className="overflow-x-auto dash-scroll">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr>
                    <th className={dashTableHeadCls}>Film</th>
                    <th className={dashTableHeadCls}>Date & heure</th>
                    <th className={dashTableHeadCls}>Salle</th>
                    <th className={dashTableHeadCls}>Places</th>
                    <th className={dashTableHeadCls}>Prix</th>
                    <th className={dashTableHeadCls}>Réservations</th>
                    <th className={cn(dashTableHeadCls, 'text-right')}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.map((screening) => (
                    <tr
                      key={screening.id}
                      className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-200">{screening.movie.title}</div>
                        <div className="text-xs text-slate-500">{screening.movie.duration} min</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-200">
                          {new Date(screening.screenTime).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(screening.screenTime).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-400">
                        Salle {screening.screenNumber}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-200 tabular-nums">
                          {screening.availableSeats} / {screening.totalSeats}
                        </div>
                        <div className="text-xs text-slate-500">disponibles</div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-slate-200 tabular-nums">
                        {screening.price} FCFA
                      </td>
                      <td className="py-3 pr-4 text-slate-300 tabular-nums">
                        {screening._count.bookings}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDeleteScreening(screening)}
                          className="text-xs font-medium text-rose-400 hover:text-rose-300"
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
        </DashCard>
      )}

      {/* Modal : film */}
      <Modal
        isOpen={showMovieModal}
        onClose={() => {
          setShowMovieModal(false)
          setSelectedMovie(null)
          resetMovieForm()
        }}
        title={selectedMovie ? 'Modifier le film' : 'Nouveau film'}
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Titre <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={movieForm.title}
              onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
              className={dashInputCls}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Description</label>
            <textarea
              value={movieForm.description}
              onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
              rows={3}
              className={dashInputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">
                Durée (minutes) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                value={movieForm.duration}
                onChange={(e) => setMovieForm({ ...movieForm, duration: parseInt(e.target.value) })}
                className={dashInputCls}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Genre</label>
              <input
                type="text"
                value={movieForm.genre}
                onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                className={dashInputCls}
                placeholder="Action, Comédie, Drama…"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Classification</label>
              <select
                value={movieForm.rating}
                onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                className={dashSelectCls}
              >
                <option value="Tout public">Tout public</option>
                <option value="-12">-12 ans</option>
                <option value="-16">-16 ans</option>
                <option value="-18">-18 ans</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Langue</label>
              <input
                type="text"
                value={movieForm.language}
                onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                className={dashInputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Affiche du film</label>
            <div className="mt-2 space-y-3">
              <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-primary-500/40 hover:text-primary-300">
                <Upload className="h-4 w-4" />
                Importer une affiche
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePosterUpload}
                />
              </label>

              {movieForm.posterUrl && (
                <div className="relative h-48 w-32 overflow-hidden rounded-lg border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={movieForm.posterUrl}
                    alt="Aperçu de l'affiche"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setMovieForm({ ...movieForm, posterUrl: '' })}
                    className="absolute right-1 top-1 rounded-full bg-rose-500 p-1 text-white hover:bg-rose-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="text-xs text-slate-500">Ou entrez l&apos;URL directement :</div>
              <input
                type="url"
                value={movieForm.posterUrl}
                onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                className={cn(dashInputCls, 'text-sm')}
                placeholder="https://exemple.com/image.jpg"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">URL de la bande-annonce</label>
            <input
              type="url"
              value={movieForm.trailerUrl}
              onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
              className={dashInputCls}
              placeholder="https://youtube.com/…"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={movieForm.isActive}
                onChange={(e) => setMovieForm({ ...movieForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <span className="text-sm text-slate-300">Actif</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={movieForm.nowShowing}
                onChange={(e) => setMovieForm({ ...movieForm, nowShowing: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <span className="text-sm text-slate-300">À l&apos;affiche</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={movieForm.comingSoon}
                onChange={(e) => setMovieForm({ ...movieForm, comingSoon: e.target.checked })}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <span className="text-sm text-slate-300">Bientôt</span>
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
          <button
            onClick={() => {
              setShowMovieModal(false)
              setSelectedMovie(null)
              resetMovieForm()
            }}
            className={dashBtnOutlineCls}
          >
            Annuler
          </button>
          <button onClick={handleSaveMovie} className={dashBtnPrimaryCls}>
            {selectedMovie ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </Modal>

      {/* Modal : séance */}
      <Modal
        isOpen={showScreeningModal}
        onClose={() => {
          setShowScreeningModal(false)
          resetScreeningForm()
        }}
        title="Nouvelle séance"
        size="xl"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Film <span className="text-rose-400">*</span>
            </label>
            <select
              value={screeningForm.movieId}
              onChange={(e) => setScreeningForm({ ...screeningForm, movieId: e.target.value })}
              className={dashSelectCls}
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
            <label className="mb-1 block text-sm text-slate-400">
              Date et heure <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={screeningForm.screenTime}
              onChange={(e) => setScreeningForm({ ...screeningForm, screenTime: e.target.value })}
              className={dashInputCls}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-slate-400">Salle</label>
              <input
                type="number"
                value={screeningForm.screenNumber}
                onChange={(e) => setScreeningForm({ ...screeningForm, screenNumber: parseInt(e.target.value) })}
                min="1"
                className={dashInputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400">Places totales</label>
              <input
                type="number"
                value={screeningForm.totalSeats}
                onChange={(e) => setScreeningForm({ ...screeningForm, totalSeats: parseInt(e.target.value) })}
                min="1"
                className={dashInputCls}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">
              Prix (FCFA) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              value={screeningForm.price}
              onChange={(e) => setScreeningForm({ ...screeningForm, price: parseInt(e.target.value) })}
              min="0"
              className={dashInputCls}
              required
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
          <button
            onClick={() => {
              setShowScreeningModal(false)
              resetScreeningForm()
            }}
            className={dashBtnOutlineCls}
          >
            Annuler
          </button>
          <button onClick={handleSaveScreening} className={dashBtnPrimaryCls}>
            Créer
          </button>
        </div>
      </Modal>

      {/* Modal : confirmation suppression film */}
      <Modal
        isOpen={showDeleteMovieModal}
        onClose={() => {
          setShowDeleteMovieModal(false)
          setSelectedMovie(null)
        }}
        title="Confirmer la suppression"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4">
            <p className="mb-2 font-medium text-rose-300">⚠️ Attention</p>
            <p className="text-sm text-rose-200/80">
              Vous êtes sur le point de supprimer le film :
            </p>
            <p className="mt-2 font-bold text-rose-100">{selectedMovie?.title}</p>
          </div>

          <p className="text-sm text-slate-400">
            Cette action est irréversible. Toutes les séances associées à ce film seront
            également supprimées.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowDeleteMovieModal(false)
                setSelectedMovie(null)
              }}
              disabled={isDeleting}
              className={dashBtnOutlineCls}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteMovieConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Suppression…
                </>
              ) : (
                'Supprimer définitivement'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal : confirmation suppression séance */}
      <Modal
        isOpen={showDeleteScreeningModal}
        onClose={() => {
          setShowDeleteScreeningModal(false)
          setSelectedScreening(null)
        }}
        title="Confirmer la suppression"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-4">
            <p className="mb-2 font-medium text-rose-300">⚠️ Attention</p>
            <p className="text-sm text-rose-200/80">
              Vous êtes sur le point de supprimer la séance de :
            </p>
            <p className="mt-2 font-bold text-rose-100">{selectedScreening?.movie.title}</p>
            <p className="mt-1 text-sm text-rose-200/70">
              {new Date(selectedScreening?.screenTime || '').toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <p className="text-sm text-slate-400">
            Cette action est irréversible. La séance sera définitivement supprimée.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setShowDeleteScreeningModal(false)
                setSelectedScreening(null)
              }}
              disabled={isDeleting}
              className={dashBtnOutlineCls}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteScreeningConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Suppression…
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
