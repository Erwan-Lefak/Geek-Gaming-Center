/**
 * Generate Time Slots Script - Geek Gaming Center
 * Génère des créneaux horaires pour les ressources sur les 30 prochains jours
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { addDays, setHours, setMinutes, format, isWeekend } from 'date-fns';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/geek_gaming_db',
});

// Configuration des créneaux par ressource
const SLOT_CONFIG: Record<string, { startHour: number; startMinute: number; endHour: number; endMinute: number; duration: number }> = {
  // PS5 et Xbox: 10h-23h semaine, 9h-00h weekend
  'ps5': { startHour: 10, startMinute: 0, endHour: 23, endMinute: 0, duration: 60 },
  'xbox': { startHour: 10, startMinute: 0, endHour: 23, endMinute: 0, duration: 60 },
  // VR: 10h-22h tous les jours
  'vr': { startHour: 10, startMinute: 0, endHour: 22, endMinute: 0, duration: 60 },
  // Simulation: 10h-23h
  'simulation': { startHour: 10, startMinute: 0, endHour: 23, endMinute: 0, duration: 60 },
  // Arcade et Retro: 10h-23h
  'arcade': { startHour: 10, startMinute: 0, endHour: 23, endMinute: 0, duration: 60 },
  'retro': { startHour: 10, startMinute: 0, endHour: 23, endMinute: 0, duration: 60 },
};

// Heures pleines: 19h-22h (+25%)
const PEAK_HOUR_START = 19;
const PEAK_HOUR_END = 22;

/**
 * Vérifie si une heure est en heure pleines
 */
function isPeakHour(hour: number): boolean {
  return hour >= PEAK_HOUR_START && hour < PEAK_HOUR_END;
}

/**
 * Génère un ID unique
 */
function generateId(prefix: string, date: Date, slotIndex: number): string {
  return `${prefix}-${format(date, 'yyyyMMdd')}-${slotIndex.toString().padStart(3, '0')}`;
}

/**
 * Génère les créneaux horaires
 */
async function generateSlots() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Récupérer toutes les ressources
    const resourcesResult = await client.query(
      'SELECT id, type, hourly_rate FROM resources WHERE status = $1',
      ['available']
    );

    console.log(`Found ${resourcesResult.rows.length} resources`);

    let totalSlots = 0;

    // Générer des créneaux pour les 30 prochains jours
    for (let day = 0; day < 30; day++) {
      const currentDate = addDays(new Date(), day);
      const isWeekendDay = isWeekend(currentDate);

      console.log(`Generating slots for day ${day + 1}/30: ${format(currentDate, 'yyyy-MM-dd')} (${isWeekendDay ? 'Weekend' : 'Weekday'})`);

      for (const resource of resourcesResult.rows) {
        const config = SLOT_CONFIG[resource.type];
        if (!config) continue;

        // Ajuster les horaires selon le type et le jour
        let startHour = config.startHour;
        let endHour = config.endHour;

        if (isWeekendDay) {
          // Weekend: horaires étendus pour PS5/Xbox (9h-00h)
          if (resource.type === 'ps5' || resource.type === 'xbox') {
            startHour = 9;
            endHour = 0; // Minuit (24h le lendemain)
          }
        }

        // Calculer le prix de base (avec surcharge weekend)
        let basePrice = parseFloat(resource.hourly_rate);
        if (isWeekendDay) {
          basePrice *= 1.25; // +25% weekend
        }

        // Générer les créneaux horaires
        let slotIndex = 0;
        let currentHour = startHour;

        while (currentHour < endHour || (currentHour === 0 && endHour === 0 && slotIndex > 0)) {
          if (currentHour === 0) {
            // Arrêt à minuit
            break;
          }

          const startTime = setMinutes(setHours(currentDate, currentHour), config.startMinute);
          const endTime = new Date(startTime.getTime() + config.duration * 60000);

          // Calculer le prix final (avec surcharge heures pleines)
          let finalPrice = basePrice;
          if (isPeakHour(currentHour)) {
            finalPrice *= 1.25; // +25% heures pleines
          }

          // Insérer le créneau
          const slotId = generateId(resource.id, currentDate, slotIndex);
          await client.query(
            `INSERT INTO time_slots (id, resource_id, start_time, end_time, status, price, is_peak_hour, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
            [
              slotId,
              resource.id,
              startTime,
              endTime,
              'available',
              Math.round(finalPrice * 100) / 100,
              isPeakHour(currentHour),
            ]
          );

          totalSlots++;
          slotIndex++;

          // Passer à l'heure suivante
          currentHour++;
          if (currentHour === 24) {
            currentHour = 0;
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Successfully generated ${totalSlots} time slots!`);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error generating slots:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
generateSlots()
  .then(() => {
    console.log('Slot generation completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Slot generation failed:', error);
    process.exit(1);
  });
