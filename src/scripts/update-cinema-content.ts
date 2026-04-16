import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateCinemaContent() {
  console.log('🎬 Updating cinema content...')

  // Delete all existing screenings
  await prisma.cinemaBooking.deleteMany({})
  await prisma.movieScreening.deleteMany({})
  console.log('✅ Deleted existing screenings')

  // Create or update movies with real content from the site
  const movies = await prisma.movie.upsert({
    where: { id: 'sinners-movie' },
    update: {
      title: 'Sinners',
      description: 'Le nouveau film de Ryan Coogler avec Michael B. Jordan. Une histoire poignante de rédemption et de sacrifice se déroulant dans les rues de Los Angeles. Deux jumeaux séparés à la naissance se retrouvent des années plus tard, chacun pris dans des spirales différentes. Un thriller dramatique explorant les thèmes de la famille, de la loyauté et des choix qui définissent notre destinée.',
      duration: 135, // 2h 15min
      genre: 'Drame, Thriller',
      rating: '18+',
      posterUrl: '/sinners.webp',
      trailerUrl: '',
      director: 'Ryan Coogler',
      actors: ['Michael B. Jordan'],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    create: {
      id: 'sinners-movie',
      title: 'Sinners',
      description: 'Le nouveau film de Ryan Coogler avec Michael B. Jordan. Une histoire poignante de rédemption et de sacrifice se déroulant dans les rues de Los Angeles. Deux jumeaux séparés à la naissance se retrouvent des années plus tard, chacun pris dans des spirales différentes. Un thriller dramatique explorant les thèmes de la famille, de la loyauté et des choix qui définissent notre destinée.',
      duration: 135,
      genre: 'Drame, Thriller',
      rating: '18+',
      posterUrl: '/sinners.webp',
      trailerUrl: '',
      director: 'Ryan Coogler',
      actors: ['Michael B. Jordan'],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
  })

  await prisma.movie.upsert({
    where: { id: 'f1-movie' },
    update: {
      title: 'F1',
      description: 'Un pilote vétéran revenu à la compétition fait équipe avec une équipe en difficulté. Son objectif : battre les champions en titre et les jeunes prodiges de la Formule 1. Tourné pendant les vrais Grands Prix, ce film plonge le spectateur dans l\'intensité, la vitesse et les enjeux du sport automobile. Avec la participation de septuples champions du monde en vedette.',
      duration: 150, // 2h 30min
      genre: 'Sport, Drame',
      rating: 'Tout public',
      posterUrl: '/f1-movie.jpg',
      trailerUrl: '',
      director: '',
      actors: ['Brad Pitt'],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    create: {
      id: 'f1-movie',
      title: 'F1',
      description: 'Un pilote vétéran revenu à la compétition fait équipe avec une équipe en difficulté. Son objectif : battre les champions en titre et les jeunes prodiges de la Formule 1. Tourné pendant les vrais Grands Prix, ce film plonge le spectateur dans l\'intensité, la vitesse et les enjeux du sport automobile. Avec la participation de septuples champions du monde en vedette.',
      duration: 150,
      genre: 'Sport, Drame',
      rating: 'Tout public',
      posterUrl: '/f1-movie.jpg',
      trailerUrl: '',
      director: '',
      actors: ['Brad Pitt'],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
  })

  await prisma.movie.upsert({
    where: { id: 'jjk-movie' },
    update: {
      title: 'Jujutsu Kaisen',
      description: 'Yuji Itadori, un lycéen aux capacités physiques extraordinaires, se retrouve entraîné dans le monde des malédictions après avoir ingéré le doigt de Ryomen Sukuna, le Roi des Malédictions. Rejoignant l\'école de magie de Tokyo, il apprend à maîtriser ses pouvoirs tout en combattant les esprits maléfiques. La saison 2 adapte l\'arc Shibuya, considéré comme l\'un des meilleurs arcs de l\'histoire de l\'anime moderne.',
      duration: 47, // 47 épisodes de 23 min (traité comme 47 min)
      genre: 'Anime, Action Surnaturelle',
      rating: '16+',
      posterUrl: '/jujutsu-kaisen.jpeg',
      trailerUrl: '',
      director: '',
      actors: [],
      language: 'VOSTFR',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    create: {
      id: 'jjk-movie',
      title: 'Jujutsu Kaisen',
      description: 'Yuji Itadori, un lycéen aux capacités physiques extraordinaires, se retrouve entraîné dans le monde des malédictions après avoir ingéré le doigt de Ryomen Sukuna, le Roi des Malédictions. Rejoignant l\'école de magie de Tokyo, il apprend à maîtriser ses pouvoirs tout en combattant les esprits maléfiques. La saison 2 adapte l\'arc Shibuya, considéré comme l\'un des meilleurs arcs de l\'histoire de l\'anime moderne.',
      duration: 47,
      genre: 'Anime, Action Surnaturelle',
      rating: '16+',
      posterUrl: '/jujutsu-kaisen.jpeg',
      trailerUrl: '',
      director: '',
      actors: [],
      language: 'VOSTFR',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
  })

  await prisma.movie.upsert({
    where: { id: 'snowfall-movie' },
    update: {
      title: 'Snowfall',
      description: 'Los Angeles, 1983. Franklin Saint, jeune homme ambitieux d\'South Central, voit une opportunité dans l\'émergence du crack-cocaïne. La série suit son ascension dans le monde du trafic, tout en explorant les conséquences devastatrices de l\'épidémie de crack sur la communauté noire américaine. Une plongée brutale et captivante dans une période sombre de l\'histoire américaine, mêlant personnages fictifs et événements réels.',
      duration: 60, // 60 épisodes (traité comme 60 min)
      genre: 'Drame, Crime',
      rating: '18+',
      posterUrl: '/snowfall.jpg',
      trailerUrl: '',
      director: '',
      actors: [],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    create: {
      id: 'snowfall-movie',
      title: 'Snowfall',
      description: 'Los Angeles, 1983. Franklin Saint, jeune homme ambitieux d\'South Central, voit une opportunité dans l\'émergence du crack-cocaïne. La série suit son ascension dans le monde du trafic, tout en explorant les conséquences devastatrices de l\'épidémie de crack sur la communauté noire américaine. Une plongée brutale et captivante dans une période sombre de l\'histoire américaine, mêlant personnages fictifs et événements réels.',
      duration: 60,
      genre: 'Drame, Crime',
      rating: '18+',
      posterUrl: '/snowfall.jpg',
      trailerUrl: '',
      director: '',
      actors: [],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
  })

  console.log('✅ Created/updated 4 movies')

  // Get all movies
  const allMovies = await prisma.movie.findMany({
    where: {
      id: {
        in: ['sinners-movie', 'f1-movie', 'jjk-movie', 'snowfall-movie'],
      },
    },
  })

  // Create screenings for today and tomorrow
  const today = new Date()
  today.setHours(21, 0, 0, 0)

  const todayLate = new Date(today)
  todayLate.setHours(23, 30, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const tomorrowLate = new Date(tomorrow)
  tomorrowLate.setHours(23, 0, 0, 0)

  // Find specific movies
  const sinners = allMovies.find((m) => m.id === 'sinners-movie')!
  const f1 = allMovies.find((m) => m.id === 'f1-movie')!
  const jjk = allMovies.find((m) => m.id === 'jjk-movie')!
  const snowfall = allMovies.find((m) => m.id === 'snowfall-movie')!

  // Create screenings based on the site schedule
  await prisma.movieScreening.createMany({
    data: [
      // Sinners: 21h00, 23h30
      {
        movieId: sinners.id,
        screenTime: today,
        endDate: new Date(today.getTime() + sinners.duration * 60000),
        screenNumber: 1,
        totalSeats: 50,
        availableSeats: 45,
        price: 2500,
        isActive: true,
      },
      {
        movieId: sinners.id,
        screenTime: todayLate,
        endDate: new Date(todayLate.getTime() + sinners.duration * 60000),
        screenNumber: 1,
        totalSeats: 50,
        availableSeats: 50,
        price: 2500,
        isActive: true,
      },
      // F1: 20h30, 23h00
      {
        movieId: f1.id,
        screenTime: new Date(today.getTime() - 30 * 60000), // 20h30
        endDate: new Date(today.getTime() - 30 * 60000 + f1.duration * 60000),
        screenNumber: 2,
        totalSeats: 40,
        availableSeats: 40,
        price: 3000,
        isActive: true,
      },
      {
        movieId: f1.id,
        screenTime: new Date(todayLate.getTime() - 30 * 60000), // 23h00
        endDate: new Date(todayLate.getTime() - 30 * 60000 + f1.duration * 60000),
        screenNumber: 2,
        totalSeats: 40,
        availableSeats: 38,
        price: 3000,
        isActive: true,
      },
      // JJK: 21h00, 23h00 (23h00 is full)
      {
        movieId: jjk.id,
        screenTime: today,
        endDate: new Date(today.getTime() + jjk.duration * 60000),
        screenNumber: 3,
        totalSeats: 60,
        availableSeats: 55,
        price: 1500,
        isActive: true,
      },
      {
        movieId: jjk.id,
        screenTime: todayLate,
        endDate: new Date(todayLate.getTime() + jjk.duration * 60000),
        screenNumber: 3,
        totalSeats: 60,
        availableSeats: 0, // Full
        price: 1500,
        isActive: true,
      },
      // Snowfall: 21h00, 22h30
      {
        movieId: snowfall.id,
        screenTime: today,
        endDate: new Date(today.getTime() + snowfall.duration * 60000),
        screenNumber: 4,
        totalSeats: 45,
        availableSeats: 45,
        price: 2000,
        isActive: true,
      },
      {
        movieId: snowfall.id,
        screenTime: new Date(today.getTime() + 90 * 60000), // 22h30
        endDate: new Date(today.getTime() + 90 * 60000 + snowfall.duration * 60000),
        screenNumber: 4,
        totalSeats: 45,
        availableSeats: 45,
        price: 2000,
        isActive: true,
      },
    ],
  })

  console.log('✅ Created 8 screenings')
  console.log('✨ Cinema content updated successfully!')
}

updateCinemaContent()
  .catch((e) => {
    console.error('❌ Error updating cinema content:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
