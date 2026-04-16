import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function syncCinemaData() {
  console.log('🎬 Syncing cinema data to production database...')

  // Check existing movies
  const existingMovies = await prisma.movie.findMany()
  console.log(`📊 Found ${existingMovies.length} existing movies`)

  // Movies to sync
  const moviesToSync = [
    {
      id: 'one-piece-live-action',
      title: 'One Piece Live Action',
      description: 'Monkey D. Luffy, un jeune aventurier au corps en caoutchouc, rêve de devenir le Roi des Pirates. Avec son équipage - Zoro, Nami, Usopp et Sanji - il navigue sur le Grand Line à la recherche du légendaire trésor "One Piece". Une adaptation épique du manga d\'Eiichiro Oda qui capture l\'esprit d\'aventure et l\'amitié qui font le succès de la franchise.',
      duration: 60,
      genre: 'Aventure, Action',
      rating: '16+',
      posterUrl: '/one-piece-live-action.jpeg',
      director: '',
      actors: [],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    {
      id: 'sinners-movie',
      title: 'Sinners',
      description: 'Le nouveau film de Ryan Coogler avec Michael B. Jordan. Une histoire poignante de rédemption et de sacrifice se déroulant dans les rues de Los Angeles. Deux jumeaux séparés à la naissance se retrouvent des années plus tard, chacun pris dans des spirales différentes. Un thriller dramatique explorant les thèmes de la famille, de la loyauté et des choix qui définissent notre destinée.',
      duration: 135,
      genre: 'Drame, Thriller',
      rating: '18+',
      posterUrl: '/sinners.webp',
      director: 'Ryan Coogler',
      actors: ['Michael B. Jordan'],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    {
      id: 'f1-movie',
      title: 'F1',
      description: 'Un pilote vétéran revenu à la compétition fait équipe avec une équipe en difficulté. Son objectif : battre les champions en titre et les jeunes prodiges de la Formule 1. Tourné pendant les vrais Grands Prix, ce film plonge le spectateur dans l\'intensité, la vitesse et les enjeux du sport automobile. Avec la participation de septuples champions du monde en vedette.',
      duration: 150,
      genre: 'Sport, Drame',
      rating: 'Tout public',
      posterUrl: '/f1-movie.jpg',
      director: '',
      actors: ['Brad Pitt'],
      language: 'VF',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
    {
      id: 'jjk-movie',
      title: 'Jujutsu Kaisen',
      description: 'Yuji Itadori, un lycéen aux capacités physiques extraordinaires, se retrouve entraîné dans le monde des malédictions après avoir ingéré le doigt de Ryomen Sukuna, le Roi des Malédictions. Rejoignant l\'école de magie de Tokyo, il apprend à maîtriser ses pouvoirs tout en combattant les esprits maléfiques. La saison 2 adapte l\'arc Shibuya, considéré comme l\'un des meilleurs arcs de l\'histoire de l\'anime moderne.',
      duration: 47,
      genre: 'Anime, Action Surnaturelle',
      rating: '16+',
      posterUrl: '/jujutsu-kaisen.jpeg',
      director: '',
      actors: [],
      language: 'VOSTFR',
      isActive: true,
      nowShowing: true,
      comingSoon: false,
    },
  ]

  // Upsert movies
  for (const movie of moviesToSync) {
    await prisma.movie.upsert({
      where: { id: movie.id },
      update: {
        ...movie,
      },
      create: movie,
    })
    console.log(`✅ Synced: ${movie.title}`)
  }

  // Get all synced movies
  const allMovies = await prisma.movie.findMany({
    where: {
      id: { in: moviesToSync.map(m => m.id) },
    },
  })

  console.log(`\n📽️ Creating screenings for ${allMovies.length} movies...`)

  // Delete existing screenings for these movies
  await prisma.movieScreening.deleteMany({
    where: {
      movieId: { in: allMovies.map(m => m.id) },
    },
  })
  console.log('🗑️  Cleared old screenings')

  // Create screenings for today and tomorrow
  const today = new Date()
  today.setHours(21, 0, 0, 0)

  const todayLate = new Date(today)
  todayLate.setHours(23, 30, 0, 0)

  const screenings: any[] = []

  // One Piece: 21h00, 22h30
  const onePiece = allMovies.find(m => m.id === 'one-piece-live-action')!
  screenings.push(
    {
      movieId: onePiece.id,
      screenTime: today,
      endDate: new Date(today.getTime() + onePiece.duration * 60000),
      screenNumber: 1,
      totalSeats: 60,
      availableSeats: 55,
      price: 2000,
      isActive: true,
    },
    {
      movieId: onePiece.id,
      screenTime: new Date(today.getTime() + 90 * 60000),
      endDate: new Date(today.getTime() + 90 * 60000 + onePiece.duration * 60000),
      screenNumber: 1,
      totalSeats: 60,
      availableSeats: 60,
      price: 2000,
      isActive: true,
    }
  )

  // Sinners: 21h00, 23h30
  const sinners = allMovies.find(m => m.id === 'sinners-movie')!
  screenings.push(
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
    }
  )

  // F1: 20h30, 23h00
  const f1 = allMovies.find(m => m.id === 'f1-movie')!
  screenings.push(
    {
      movieId: f1.id,
      screenTime: new Date(today.getTime() - 30 * 60000),
      endDate: new Date(today.getTime() - 30 * 60000 + f1.duration * 60000),
      screenNumber: 2,
      totalSeats: 40,
      availableSeats: 40,
      price: 3000,
      isActive: true,
    },
    {
      movieId: f1.id,
      screenTime: new Date(todayLate.getTime() - 30 * 60000),
      endDate: new Date(todayLate.getTime() - 30 * 60000 + f1.duration * 60000),
      screenNumber: 2,
      totalSeats: 40,
      availableSeats: 38,
      price: 3000,
      isActive: true,
    }
  )

  // JJK: 21h00, 23h00
  const jjk = allMovies.find(m => m.id === 'jjk-movie')!
  screenings.push(
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
      availableSeats: 0,
      price: 1500,
      isActive: true,
    }
  )

  await prisma.movieScreening.createMany({
    data: screenings,
  })

  console.log(`✅ Created ${screenings.length} screenings`)
  console.log('\n✨ Cinema data synced successfully!')
  console.log('\n📊 Summary:')
  console.log(`  - Movies: ${allMovies.length}`)
  console.log(`  - Screenings: ${screenings.length}`)
}

syncCinemaData()
  .catch((e) => {
    console.error('❌ Error syncing cinema data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
