/**
 * Booking Routes - Geek Gaming Center
 * API endpoints pour les réservations
 */

import { Router, Request, Response } from 'express';
import { createBooking, getBooking, cancelBooking } from '../services/booking.service';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/booking/bookings - Créer une réservation
 */
router.post('/bookings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const booking = await createBooking(req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(400).json({ error: error.message || 'Failed to create booking' });
  }
});

/**
 * GET /api/booking/bookings/:id - Récupérer une réservation
 */
router.get('/bookings/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const booking = await getBooking(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error: any) {
    console.error('Error retrieving booking:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve booking' });
  }
});

/**
 * DELETE /api/booking/bookings/:id - Annuler une réservation
 */
router.delete('/bookings/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const booking = await cancelBooking(req.params.id, req.body?.reason);
    res.json({
      booking,
      message: 'Booking cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel booking' });
  }
});

/**
 * GET /api/booking/my - Récupérer les réservations de l'utilisateur
 */
router.get('/my', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // From auth middleware
    // TODO: Implémenter la récupération des réservations par utilisateur
    res.json({ bookings: [] });
  } catch (error: any) {
    console.error('Error retrieving user bookings:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve bookings' });
  }
});

export default router;
