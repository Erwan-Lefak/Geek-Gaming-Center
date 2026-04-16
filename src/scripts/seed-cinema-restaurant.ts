import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCinemaAndRestaurant() {
  console.log('🎬 Seeding Cinema and Restaurant data...')

  // Create Movies
  const movies = await prisma.movie.createMany({
    data: [
      {
        title: 'Black Panther: Wakanda Forever',
        description: 'Le peuple de Wakanda s\'efforce de faire face à la mort de leur roi, T\'Challa.',
        duration: 161,
        genre: 'Action, Science-Fiction',
        rating: '-12',
        posterUrl: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=RlOB3UALvrQ',
        director: 'Ryan Coogler',
        actors: ['Letitia Wright', 'Lupita Nyong\'o', 'Danai Gurira'],
        language: 'VF',
        isActive: true,
        nowShowing: true,
        comingSoon: false,
      },
      {
        title: 'Avatar: La Voie de l\'eau',
        description: 'Jake Sully vit avec sa nouvelle famille sur la planète Pandora.',
        duration: 192,
        genre: 'Science-Fiction, Aventure',
        rating: 'Tout public',
        posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyqFCDq1s',
        director: 'James Cameron',
        actors: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'],
        language: 'VF',
        isActive: true,
        nowShowing: true,
        comingSoon: false,
      },
      {
        title: 'Oppenheimer',
        description: 'L\'histoire du scientifique J. Robert Oppenheimer et son rôle dans le développement de la bombe atomique.',
        duration: 180,
        genre: 'Drame, Histoire',
        rating: '-12',
        posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        director: 'Christopher Nolan',
        actors: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
        language: 'VF',
        isActive: true,
        nowShowing: true,
        comingSoon: false,
      },
      {
        title: 'Barbie',
        description: 'Barbie et Ken vivent la vie parfaite à Barbie Land.',
        duration: 114,
        genre: 'Comédie, Fantaisie',
        rating: 'Tout public',
        posterUrl: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=pBk4NYhWNMM',
        director: 'Greta Gerwig',
        actors: ['Margot Robbie', 'Ryan Gosling', 'America Ferrera'],
        language: 'VF',
        isActive: true,
        nowShowing: false,
        comingSoon: true,
      },
    ],
  })

  console.log(`✅ Created ${movies.count} movies`)

  // Get created movies
  const allMovies = await prisma.movie.findMany()

  // Create Screenings
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(14, 0, 0, 0)

  const dayAfterTomorrow = new Date(tomorrow)
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
  dayAfterTomorrow.setHours(18, 0, 0, 0)

  const screenings = await prisma.movieScreening.createMany({
    data: [
      {
        movieId: allMovies[0].id,
        screenTime: tomorrow,
        endDate: new Date(tomorrow.getTime() + allMovies[0].duration * 60000),
        screenNumber: 1,
        totalSeats: 50,
        availableSeats: 45,
        price: 2000,
        isActive: true,
      },
      {
        movieId: allMovies[0].id,
        screenTime: dayAfterTomorrow,
        endDate: new Date(dayAfterTomorrow.getTime() + allMovies[0].duration * 60000),
        screenNumber: 1,
        totalSeats: 50,
        availableSeats: 50,
        price: 2000,
        isActive: true,
      },
      {
        movieId: allMovies[1].id,
        screenTime: tomorrow,
        endDate: new Date(tomorrow.getTime() + allMovies[1].duration * 60000),
        screenNumber: 2,
        totalSeats: 60,
        availableSeats: 55,
        price: 2500,
        isActive: true,
      },
      {
        movieId: allMovies[2].id,
        screenTime: dayAfterTomorrow,
        endDate: new Date(dayAfterTomorrow.getTime() + allMovies[2].duration * 60000),
        screenNumber: 3,
        totalSeats: 40,
        availableSeats: 38,
        price: 3000,
        isActive: true,
      },
    ],
  })

  console.log(`✅ Created ${screenings.count} screenings`)

  // Create Menu Items
  const menuItems = await prisma.menuItem.createMany({
    data: [
      {
        name: 'Burger GGC Special',
        description: 'Notre burger signature avec bœuf, fromage fondant, bacon et sauce maison',
        category: 'Plat principal',
        price: 4500,
        ingredients: ['Bœuf', 'Fromage', 'Bacon', 'Pain burger', 'Salade', 'Tomate'],
        allergens: ['Gluten', 'Lactose', 'Œuf'],
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 20,
      },
      {
        name: 'Pizza Margherita',
        description: 'Sauce tomate, mozzarella fior di latte, basilic frais',
        category: 'Plat principal',
        price: 3500,
        ingredients: ['Farine', 'Tomate', 'Mozzarella', 'Basilic', 'Huile d\'olive'],
        allergens: ['Gluten', 'Lactose'],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 15,
      },
      {
        name: 'Salade César',
        description: 'Laitue romaine, parmesan, croûtons, sauce césar maison',
        category: 'Entrée',
        price: 2500,
        ingredients: ['Laitue', 'Parmesan', 'Croûtons', 'Sauce césar'],
        allergens: ['Gluten', 'Lactose', 'Œuf'],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Tiramisu',
        description: 'Dessert italien classique au café et mascarpone',
        category: 'Dessert',
        price: 2000,
        ingredients: ['Mascarpone', 'Café', 'Biscuits', 'Cacao'],
        allergens: ['Lactose', 'Œuf', 'Gluten'],
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 5,
      },
      {
        name: 'Coca-Cola',
        description: 'Soda rafraîchissant',
        category: 'Boisson',
        price: 800,
        ingredients: ['Eau gazeuse', 'Sucre', 'Caramel', 'Caféine'],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 2,
      },
      {
        name: 'Eau Minérale',
        description: 'Eau minérale naturelle 50cl',
        category: 'Boisson',
        price: 500,
        ingredients: ['Eau'],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 1,
      },
      {
        name: 'Frites',
        description: 'Frites maison croustillantes',
        category: 'Snack',
        price: 1500,
        ingredients: ['Pommes de terre', 'Huile', 'Sel'],
        allergens: [],
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        isAvailable: true,
        preparationTime: 10,
      },
      {
        name: 'Chicken Wings',
        description: 'Ailes de poulet marinées et grillées, sauce piquante',
        category: 'Snack',
        price: 3000,
        ingredients: ['Poulet', 'Sauce piquante', 'Épices'],
        allergens: [],
        isVegetarian: false,
        isVegan: false,
        isSpicy: true,
        isAvailable: true,
        preparationTime: 25,
      },
    ],
  })

  console.log(`✅ Created ${menuItems.count} menu items`)

  // Create Restaurant Orders
  const allMenuItems = await prisma.menuItem.findMany()

  const orders = await prisma.restaurantOrder.createMany({
    data: [
      {
        orderNumber: 'REST-' + Date.now().toString().slice(-8) + '-0001',
        tableNumber: 'T1',
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        paymentStatus: 'PAID',
        subtotal: 7000,
        taxRate: 0,
        taxAmount: 0,
        total: 7000,
        isTakeAway: false,
        createdAt: new Date(),
        completedAt: new Date(),
      },
      {
        orderNumber: 'REST-' + Date.now().toString().slice(-8) + '-0002',
        tableNumber: 'T2',
        status: 'PENDING',
        paymentMethod: null,
        paymentStatus: 'PENDING',
        subtotal: 5000,
        taxRate: 0,
        taxAmount: 0,
        total: 5000,
        isTakeAway: false,
        createdAt: new Date(),
      },
    ],
  })

  console.log(`✅ Created ${orders.count} restaurant orders`)

  console.log('✨ Seeding completed!')
}

seedCinemaAndRestaurant()
  .catch((e) => {
    console.error('❌ Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
