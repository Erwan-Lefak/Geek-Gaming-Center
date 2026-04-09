/**
 * Booking Service - Geek Gaming Center
 * Service pour gérer les réservations avec validation atomique
 */

import { getPool } from '../lib/db';

/**
 * Créer une réservation avec validation atomique
 */
export async function createBooking(data: {
  customer_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  slots: Array<{
    resource_id: string;
    start_time: Date;
    end_time: Date;
  }>;
  notes?: string;
}) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    // 1. Récupérer les créneaux et vérifier la disponibilité atomique
    const slotChecks = data.slots.map(async (slot) => {
      const result = await client.query(
        'SELECT id, status FROM time_slots WHERE resource_id = $1 AND start_time = $2 AND end_time = $3 AND status = $4 FOR UPDATE',
        [slot.resource_id, slot.start_time, slot.end_time, 'available']
      );

      if (result.rowCount === 0) {
        throw new Error(`No available slots for resource ${slot.resource_id} at ${slot.start_time}`);
      }

      return result.rows[0].id;
    });

    const slotIds = await Promise.all(slotChecks);

    // 2. Calculer le prix total
    const placeholders = slotIds.map((_, i) => `$${i + 1}`).join(', ');
    const priceResult = await client.query(
      `SELECT SUM(price) FROM time_slots WHERE id IN (${placeholders})`,
      slotIds
    );
    const totalPrice = parseInt(priceResult.rows[0].sum) || 0;
    const depositAmount = Math.round(totalPrice * 0.2); // 20% d'acompte

    // 3. Créer la réservation (avec status pending)
    const bookingResult = await client.query(
      'INSERT INTO bookings (customer_id, customer_email, customer_name, customer_phone, slots, total_price, deposit_amount, status, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        data.customer_id,
        data.customer_email,
        data.customer_name,
        data.customer_phone || null,
        slotIds,
        totalPrice,
        depositAmount,
        'pending',
        data.notes || null,
        new Date(),
      ]
    );

    const bookingId = bookingResult.rows[0].id;

    // 4. Marquer les créneaux comme réservés
    const slotPlaceholders = slotIds.map((_, i) => `$${i + 3}`).join(', ');
    await client.query(
      `UPDATE time_slots SET status = $1, booking_id = $2 WHERE id IN (${slotPlaceholders})`,
      ['reserved', bookingId, ...slotIds]
    );

    await client.query('COMMIT');

    return {
      id: bookingId,
      customer_id: data.customer_id,
      customer_email: data.customer_email,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone || null,
      slots: slotIds,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      status: 'pending',
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Confirmer une réservation après paiement
 */
export async function confirmBooking(bookingId: string, paymentIntentId: string) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    // Vérifier le statut
    const bookingResult = await client.query(
      'SELECT status FROM bookings WHERE id = $1 AND status = $2',
      [bookingId, 'pending']
    );

    if (bookingResult.rowCount === 0) {
      throw new Error('Booking is not in pending status');
    }

    // Mettre à jour la réservation
    await client.query(
      'UPDATE bookings SET status = $1, payment_intent_id = $2, deposit_paid = true WHERE id = $3',
      ['confirmed', paymentIntentId, bookingId]
    );

    // Mettre à jour les créneaux
    await client.query(
      'UPDATE time_slots SET status = $1 WHERE id IN (SELECT UNNEST(slot_id) FROM bookings WHERE id = $1)',
      ['booked', bookingId]
    );

    await client.query('COMMIT');

    return { id: bookingId, status: 'confirmed' };
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Annuler une réservation avec compensation
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');

    // Vérifier le statut
    const bookingResult = await client.query(
      'SELECT status, slot_ids FROM bookings WHERE id = $1',
      [bookingId]
    );

    if (bookingResult.rows[0].status === 'completed' || bookingResult.rows[0].status === 'cancelled') {
      throw new Error('Cannot cancel a completed or already cancelled booking');
    }

    const slotIds = bookingResult.rows[0].slot_ids;

    // Libérer les créneaux
    const placeholders = slotIds.map((_, i) => `$${i + 2}`).join(', ');
    await client.query(
      `UPDATE time_slots SET status = $1, booking_id = NULL WHERE id IN (${placeholders})`,
      ['available', ...slotIds]
    );

    // Mettre à jour la réservation
    await client.query(
      'UPDATE bookings SET status = $1, cancellation_reason = $2 WHERE id = $3',
      ['cancelled', reason || null, bookingId]
    );

    await client.query('COMMIT');

    return { id: bookingId, status: 'cancelled' };
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Récupérer une réservation par ID
 */
export async function getBooking(id: string) {
  const client = await getPool().connect();

  try {
    const result = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Récupérer les créneaux
    const slotIds = result.rows[0].slot_ids;
    const placeholders = slotIds.map((_, i) => `$${i + 1}`).join(', ');
    const slotsResult = await client.query(
      `SELECT * FROM time_slots WHERE id IN (${placeholders}) ORDER BY start_time`,
      slotIds
    );

    return {
      ...result.rows[0],
      slots: slotsResult.rows,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Récupérer les disponibilités pour une période
 */
export async function getAvailability(params: {
  resource_ids?: string[];
  resource_types?: string[];
  start_date: string;
  end_date: string;
  duration?: number;
}) {
  const client = await getPool().connect();

  try {
    let query = `
      SELECT r.id, r.name, r.type, r.hourly_rate, r.status,
             r.specifications, r.availability_schedule,
             ts.start_time, ts.end_time, ts.status as ts_status,
             ts.price as ts_price, ts.is_peak_hour
      FROM resources r
      LEFT JOIN time_slots ts ON r.id = ts.resource_id
      WHERE r.status = 'available'
    `;

    const values: any[] = [];
    let paramIndex = 1;

    // Filtre par IDs ou types
    if (params.resource_ids && params.resource_ids.length > 0) {
      const placeholders = params.resource_ids.map((_, i) => `$${paramIndex + i}`).join(', ');
      query += ` AND r.id IN (${placeholders})`;
      values.push(...params.resource_ids);
      paramIndex += params.resource_ids.length;
    } else if (params.resource_types && params.resource_types.length > 0) {
      const placeholders = params.resource_types.map((_, i) => `$${paramIndex + i}`).join(', ');
      query += ` AND r.type IN (${placeholders})`;
      values.push(...params.resource_types);
      paramIndex += params.resource_types.length;
    }

    // Filtre par date
    if (params.start_date) {
      query += ` AND ts.start_time >= $${paramIndex} AND ts.end_time <= $${paramIndex + 1}`;
      values.push(params.start_date, params.end_date);
    }

    const result = await client.query(query, values);

    // Grouper par ressource
    const resources = new Map<string, any>();
    result.rows.forEach((row: any) => {
      if (!resources.has(row.id)) {
        resources.set(row.id, {
          id: row.id,
          name: row.name,
          type: row.type,
          hourly_rate: row.hourly_rate,
          status: row.status,
          specifications: row.specifications,
          availability_schedule: row.availability_schedule,
          time_slots: [] as any[],
        });
      }

      if (row.start_time) {
        (resources.get(row.id).time_slots as any[]).push({
          start_time: row.start_time,
          end_time: row.end_time,
          status: row.ts_status,
          price: row.ts_price,
          is_peak_hour: row.is_peak_hour,
        });
      }
    });

    // Sort time slots for each resource
    resources.forEach((resource) => {
      resource.time_slots.sort((a: any, b: any) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
    });

    await client.release();
    return Array.from(resources.values());
  } catch (error: any) {
    await client.release();
    throw error;
  }
}
