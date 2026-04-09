import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface ReservationData {
  customerId: string
  equipmentId: string
  date: Date
  startTime: string // Format: "HH:MM"
  duration: number // en minutes
  pricingId: string
}

export interface TimeSlot {
  time: string
  available: boolean
  equipmentId?: string
}

/**
 * Récupérer les équipements disponibles
 */
export async function getAvailableEquipment() {
  const equipment = await prisma.equipment.findMany({
    where: {
      status: 'AVAILABLE',
    },
    select: {
      id: true,
      name: true,
      type: true,
      code: true,
    },
    orderBy: {
      type: 'asc',
    },
  })

  return equipment
}

/**
 * Vérifier la disponibilité pour une date et un équipement
 */
export async function checkAvailability(
  date: Date,
  equipmentId?: string
): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = []
  const dayOfWeek = date.getDay()
  const isSunday = dayOfWeek === 0

  // Horaires: Lun-Sam 9h30-21h, Dim 12h-21h
  const startHour = isSunday ? 12 : 9
  const startMinute = isSunday ? 0 : 30
  const endHour = 21

  // Récupérer toutes les réservations pour cette date
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const existingReservations = await prisma.gamingSession.findMany({
    where: {
      scheduledEndAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['PENDING', 'ACTIVE', 'PAUSED'],
      },
      ...(equipmentId && { equipmentId }),
    },
    select: {
      scheduledEndAt: true,
      duration: true,
      equipmentId: true,
    },
  })

  // Convertir les réservations en format de créneaux occupés
  const bookedSlots = new Set<string>()
  existingReservations.forEach((reservation) => {
    // Calculer l'heure de début : scheduledEndAt - duration
    const end = new Date(reservation.scheduledEndAt)
    const start = new Date(end.getTime() - reservation.duration * 60 * 1000)
    const equipId = reservation.equipmentId

    // Générer tous les créneaux de 30 min entre start et end
    let current = new Date(start)
    while (current < end) {
      const timeKey = `${equipId}-${current.getHours()}:${current.getMinutes().toString().padStart(2, '0')}`
      bookedSlots.add(timeKey)
      current = new Date(current.getTime() + 30 * 60 * 1000) // +30 min
    }
  })

  // Générer les créneaux horaires
  for (let hour = startHour; hour < endHour; hour++) {
    if (hour === startHour && startMinute === 30) {
      const timeKey = `${hour}:30`
      slots.push({
        time: timeKey,
        available: true, // TODO: Vérifier avec bookedSlots
      })
    } else if (hour === startHour && startMinute === 0) {
      const timeKey = `${hour}:00`
      slots.push({
        time: timeKey,
        available: true,
      })
    } else {
      slots.push({
        time: `${hour}:00`,
        available: true,
      })
      slots.push({
        time: `${hour}:30`,
        available: true,
      })
    }
  }

  return slots
}

/**
 * Créer une réservation
 */
export async function createReservation(data: ReservationData) {
  // Calculer les heures de début et fin
  const [hours, minutes] = data.startTime.split(':').map(Number)

  const startTime = new Date(data.date)
  startTime.setHours(hours, minutes, 0, 0)

  const scheduledEndAt = new Date(startTime.getTime() + data.duration * 60 * 1000)

  // Calculer le prix
  const pricing = await prisma.pricing.findUnique({
    where: { id: data.pricingId },
  })

  if (!pricing) {
    throw new Error('Tarif non trouvé')
  }

  // Calculer le prix total basé sur la durée
  const durationInHours = data.duration / 60
  const price = Number(pricing.price) * durationInHours

  // Générer un numéro de session unique
  const sessionNumber = await generateSessionNumber()

  // Récupérer un admin pour createdById
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  })

  if (!adminUser) {
    throw new Error('Configuration système incorrecte')
  }

  // Créer la réservation
  const session = await prisma.gamingSession.create({
    data: {
      sessionNumber: sessionNumber,
      customerId: data.customerId,
      equipmentId: data.equipmentId,
      pricingId: data.pricingId,
      duration: data.duration,
      price: price,
      startedAt: startTime, // Utiliser startedAt au lieu de startTime
      scheduledEndAt: scheduledEndAt,
      status: 'PENDING',
      paidAt: new Date(),
      createdById: adminUser.id,
    },
  })

  return session
}

/**
 * Récupérer les réservations d'un client
 */
export async function getCustomerReservations(customerId: string) {
  const reservations = await prisma.gamingSession.findMany({
    where: {
      customerId: customerId,
      scheduledEndAt: {
        gte: new Date(),
      },
      status: {
        not: 'CANCELLED',
      },
    },
    orderBy: {
      startedAt: 'asc',
    },
  })

  // Récupérer les équipements séparément
  const equipmentIds = [...new Set(reservations.map(r => r.equipmentId))]
  const equipment = equipmentIds.length > 0
    ? await prisma.equipment.findMany({
        where: {
          id: { in: equipmentIds },
        },
        select: {
          id: true,
          name: true,
          type: true,
          code: true,
        },
      })
    : []

  // Associer les équipements aux réservations
  const equipmentMap = new Map(equipment.map(eq => [eq.id, eq]))

  return reservations.map(reservation => ({
    ...reservation,
    equipment: equipmentMap.get(reservation.equipmentId),
  }))
}

/**
 * Annuler une réservation
 */
export async function cancelReservation(sessionId: string, customerId: string) {
  const session = await prisma.gamingSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      customerId: true,
      scheduledEndAt: true,
      duration: true,
    },
  })

  if (!session) {
    throw new Error('Réservation non trouvée')
  }

  if (session.customerId !== customerId) {
    throw new Error('Vous n\'êtes pas autorisé à annuler cette réservation')
  }

  // Vérifier que la réservation peut être annulée (au moins 2h avant)
  const now = new Date()
  // Calculer l'heure de début : scheduledEndAt - duration
  const scheduledEnd = new Date(session.scheduledEndAt)
  const startTime = new Date(scheduledEnd.getTime() - session.duration * 60 * 1000)
  const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilStart < 2) {
    throw new Error('L\'annulation gratuite n\'est possible que jusqu\'à 2h avant le créneau')
  }

  const updatedSession = await prisma.gamingSession.update({
    where: { id: sessionId },
    data: {
      status: 'CANCELLED',
    },
  })

  return updatedSession
}

/**
 * Récupérer les tarifs pour un équipement
 */
export async function getEquipmentPricing(equipmentId: string) {
  const pricing = await prisma.pricing.findMany({
    where: {
      equipmentId: equipmentId,
    },
  })

  return pricing
}

/**
 * Générer un numéro de session unique
 */
export async function generateSessionNumber(): Promise<string> {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  // Compter les sessions du jour
  const startOfDay = new Date(date.setHours(0, 0, 0, 0))
  const endOfDay = new Date(date.setHours(23, 59, 59, 999))

  const count = await prisma.gamingSession.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  })

  const sequence = (count + 1).toString().padStart(3, '0')

  return `SES${year}${month}${day}${sequence}`
}
