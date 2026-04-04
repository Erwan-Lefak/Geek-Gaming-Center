// Grille tarifaire Geek Gaming Center
// Tarifs en FCFA selon le cahier des charges

export interface PricingTier {
  equipment: string
  equipmentType: string
  durations: {
    duration: number // en minutes
    weekdayPrice: number
    weekendPrice: number
  }[]
}

export const PRICING_GRID: PricingTier[] = [
  {
    equipment: 'PS5',
    equipmentType: 'PS5',
    durations: [
      { duration: 60, weekdayPrice: 2000, weekendPrice: 2500 },
    ],
  },
  {
    equipment: 'PS4',
    equipmentType: 'PS4',
    durations: [
      { duration: 60, weekdayPrice: 1000, weekendPrice: 1500 },
    ],
  },
  {
    equipment: 'XBOX Series X',
    equipmentType: 'XBOX_SERIES_X',
    durations: [
      { duration: 60, weekdayPrice: 1500, weekendPrice: 2000 },
    ],
  },
  {
    equipment: 'PC Gaming',
    equipmentType: 'PC_GAMING',
    durations: [
      { duration: 60, weekdayPrice: 1500, weekendPrice: 2000 },
    ],
  },
  {
    equipment: 'Oculus VR',
    equipmentType: 'OCULUS_VR',
    durations: [
      { duration: 60, weekdayPrice: 2500, weekendPrice: 3000 },
      { duration: 30, weekdayPrice: 1500, weekendPrice: 2000 },
    ],
  },
  {
    equipment: 'VR-PS4',
    equipmentType: 'VR_PS4',
    durations: [
      { duration: 60, weekdayPrice: 2500, weekendPrice: 3000 },
      { duration: 30, weekdayPrice: 1500, weekendPrice: 2000 },
    ],
  },
  {
    equipment: 'SIMU Racing',
    equipmentType: 'SIMU_RACING',
    durations: [
      { duration: 60, weekdayPrice: 2000, weekendPrice: 2500 },
    ],
  },
]

/**
 * Calcule le prix d'une session selon le type d'équipement, la durée et le jour
 */
export function calculateSessionPrice(
  equipmentType: string,
  duration: number,
  date: Date = new Date()
): number {
  const tier = PRICING_GRID.find(t => t.equipmentType === equipmentType)

  if (!tier) {
    throw new Error(`Equipment type ${equipmentType} not found in pricing grid`)
  }

  const pricing = tier.durations.find(d => d.duration === duration)

  if (!pricing) {
    throw new Error(`Duration ${duration} minutes not available for ${equipmentType}`)
  }

  // Déterminer si c'est le week-end (samedi = 6, dimanche = 0)
  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  return isWeekend ? pricing.weekendPrice : pricing.weekdayPrice
}

/**
 * Vérifie si une combinaison équipement/durée est disponible
 */
export function isPricingAvailable(equipmentType: string, duration: number): boolean {
  const tier = PRICING_GRID.find(t => t.equipmentType === equipmentType)
  if (!tier) return false

  return tier.durations.some(d => d.duration === duration)
}

/**
 * Retourne toutes les durées disponibles pour un type d'équipement
 */
export function getAvailableDurations(equipmentType: string): number[] {
  const tier = PRICING_GRID.find(t => t.equipmentType === equipmentType)
  return tier?.durations.map(d => d.duration).sort((a, b) => a - b) || []
}

/**
 * Formate un prix en FCFA
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(price)
}

/**
 * Génère la grille tarifaire pour un équipement
 */
export function getEquipmentPricing(equipmentType: string) {
  const tier = PRICING_GRID.find(t => t.equipmentType === equipmentType)

  if (!tier) {
    return null
  }

  return {
    equipment: tier.equipment,
    equipmentType: tier.equipmentType,
    durations: tier.durations.map(d => ({
      duration: d.duration,
      durationLabel: d.duration === 60 ? '1 heure' : `${d.duration} minutes`,
      weekdayPrice: d.weekdayPrice,
      weekendPrice: d.weekendPrice,
      weekdayPriceFormatted: formatPrice(d.weekdayPrice),
      weekendPriceFormatted: formatPrice(d.weekendPrice),
    })),
  }
}
