import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteOldMovies() {
  console.log('🗑️ Deleting old demo movies...')

  // Delete screenings first (due to foreign key constraint)
  const oldScreenings = await prisma.movieScreening.deleteMany({
    where: {
      movie: {
        title: {
          in: ['Black Panther: Wakanda Forever', 'Avatar: La Voie de l\'eau', 'Oppenheimer', 'Barbie'],
        },
      },
    },
  })

  console.log(`✅ Deleted ${oldScreenings.count} screenings`)

  // Delete the old movies
  const oldMovies = await prisma.movie.deleteMany({
    where: {
      title: {
        in: ['Black Panther: Wakanda Forever', 'Avatar: La Voie de l\'eau', 'Oppenheimer', 'Barbie'],
      },
    },
  })

  console.log(`✅ Deleted ${oldMovies.count} movies`)

  // Verify remaining movies
  const remainingMovies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      nowShowing: true,
    },
    orderBy: { title: 'asc' },
  })

  console.log('\n📽️ Remaining movies in database:')
  remainingMovies.forEach((movie) => {
    console.log(`  - ${movie.title} ${movie.nowShowing ? '(À l\'affiche)' : ''}`)
  })

  console.log('\n✨ Old demo movies deleted successfully!')
}

deleteOldMovies()
  .catch((e) => {
    console.error('❌ Error deleting old movies:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
