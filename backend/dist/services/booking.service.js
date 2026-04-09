"use strict";
/**
 * Booking Service - Geek Gaming Center
 * Service pour gérer les réservations avec validation atomique
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.confirmBooking = confirmBooking;
exports.cancelBooking = cancelBooking;
exports.getBooking = getBooking;
exports.getAvailability = getAvailability;
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/geek_gaming_db',
});
/**
 * Créer une réservation avec validation atomique
 */
async function createBooking(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // 1. Récupérer les créneaux et vérifier la disponibilité atomique
        const slotChecks = data.slots.map(async (slot) => {
            const result = await client.query('SELECT id, status FROM time_slots WHERE resource_id = $1 AND start_time = $2 AND end_time = $3 AND status = $4 FOR UPDATE', [slot.resource_id, slot.start_time, slot.end_time, 'available']);
            if (result.rowCount === 0) {
                throw new Error(`No available slots for resource ${slot.resource_id} at ${slot.start_time}`);
            }
            return result.rows[0].id;
        });
        const slotIds = await Promise.all(slotChecks);
        // 2. Calculer le prix total
        const priceResult = await client.query('SELECT SUM(price) FROM time_slots WHERE id = ANY($1)', [slotIds]);
        const totalPrice = parseInt(priceResult.rows[0].sum) || 0;
        const depositAmount = Math.round(totalPrice * 0.2); // 20% d'acompte
        // 3. Créer la réservation (avec status pending)
        const bookingResult = await client.query('INSERT INTO bookings (customer_id, customer_email, customer_name, customer_phone, slots, total_price, deposit_amount, status, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [
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
        ]);
        const bookingId = bookingResult.rows[0].id;
        // 4. Marquer les créneaux comme réservés
        await client.query('UPDATE time_slots SET status = $1, booking_id = $2 WHERE id = ANY($3)', ['reserved', bookingId, slotIds]);
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
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Confirmer une réservation après paiement
 */
async function confirmBooking(bookingId, paymentIntentId) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Vérifier le statut
        const bookingResult = await client.query('SELECT status FROM bookings WHERE id = $1 AND status = $2', [bookingId, 'pending']);
        if (bookingResult.rowCount === 0) {
            throw new Error('Booking is not in pending status');
        }
        // Mettre à jour la réservation
        await client.query('UPDATE bookings SET status = $1, payment_intent_id = $2, deposit_paid = true WHERE id = $3', ['confirmed', paymentIntentId, bookingId]);
        // Mettre à jour les créneaux
        await client.query('UPDATE time_slots SET status = $1 WHERE id IN (SELECT UNNEST(slot_id) FROM bookings WHERE id = $1)', ['booked', bookingId]);
        await client.query('COMMIT');
        return { id: bookingId, status: 'confirmed' };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Annuler une réservation avec compensation
 */
async function cancelBooking(bookingId, reason) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Vérifier le statut
        const bookingResult = await client.query('SELECT status, slot_ids FROM bookings WHERE id = $1', [bookingId]);
        if (bookingResult.rows[0].status === 'completed' || bookingResult.rows[0].status === 'cancelled') {
            throw new Error('Cannot cancel a completed or already cancelled booking');
        }
        const slotIds = bookingResult.rows[0].slot_ids;
        // Libérer les créneaux
        await client.query('UPDATE time_slots SET status = $1, booking_id = NULL WHERE id = ANY($2)', ['available', slotIds]);
        // Mettre à jour la réservation
        await client.query('UPDATE bookings SET status = $1, cancellation_reason = $2 WHERE id = $3', ['cancelled', reason || null, bookingId]);
        await client.query('COMMIT');
        return { id: bookingId, status: 'cancelled' };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Récupérer une réservation par ID
 */
async function getBooking(id) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM bookings WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        // Récupérer les créneaux
        const slotIds = result.rows[0].slot_ids;
        const slotsResult = await client.query('SELECT * FROM time_slots WHERE id = ANY($1) ORDER BY start_time', [slotIds]);
        return {
            ...result.rows[0],
            slots: slotsResult.rows,
        };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
/**
 * Récupérer les disponibilités pour une période
 */
async function getAvailability(params) {
    const client = await pool.connect();
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
        const conditions = [];
        const values = [1]; // Start param index
        // Filtre par IDs ou types
        if (params.resource_ids && params.resource_ids.length > 0) {
            const ids = params.resource_ids;
            query += ` AND r.id = ANY($${values.length + 1})`;
            values.push(ids);
        }
        else if (params.resource_types && params.resource_types.length > 0) {
            const types = params.resource_types;
            query += ` AND r.type = ANY($${values.length + 1})`;
            values.push(types);
        }
        // Filtre par date
        if (params.start_date) {
            query += ` AND ts.start_time >= $${values.length + 1} AND ts.end_time <= $${values.length + 2}`;
            values.push(params.start_date, params.end_date);
        }
        const result = await client.query(query, values);
        // Grouper par ressource
        const resources = new Map();
        result.rows.forEach((row) => {
            if (!resources.has(row.id)) {
                resources.set(row.id, {
                    id: row.id,
                    name: row.name,
                    type: row.type,
                    hourly_rate: row.hourly_rate,
                    status: row.status,
                    specifications: row.specifications,
                    availability_schedule: row.availability_schedule,
                    time_slots: [],
                });
            }
            if (row.start_time) {
                resources.get(row.id).time_slots.push({
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
            resource.time_slots.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        });
        await client.release();
        return Array.from(resources.values());
    }
    catch (error) {
        await client.release();
        throw error;
    }
}
//# sourceMappingURL=booking.service.js.map