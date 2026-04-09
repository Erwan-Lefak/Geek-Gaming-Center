"use strict";
/**
 * Booking Routes - Geek Gaming Center
 * API endpoints pour les réservations
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_service_1 = require("../services/booking.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/booking/bookings - Créer une réservation
 */
router.post('/bookings', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const booking = await (0, booking_service_1.createBooking)(req.body);
        res.status(201).json(booking);
    }
    catch (error) {
        console.error('Error creating booking:', error);
        res.status(400).json({ error: error.message || 'Failed to create booking' });
    }
});
/**
 * GET /api/booking/bookings/:id - Récupérer une réservation
 */
router.get('/bookings/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const booking = await (0, booking_service_1.getBooking)(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    }
    catch (error) {
        console.error('Error retrieving booking:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve booking' });
    }
});
/**
 * DELETE /api/booking/bookings/:id - Annuler une réservation
 */
router.delete('/bookings/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const booking = await (0, booking_service_1.cancelBooking)(req.params.id, req.body?.reason);
        res.json({
            booking,
            message: 'Booking cancelled successfully',
        });
    }
    catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(400).json({ error: error.message || 'Failed to cancel booking' });
    }
});
/**
 * GET /api/booking/my - Récupérer les réservations de l'utilisateur
 */
router.get('/my', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.userId; // From auth middleware
        // TODO: Implémenter la récupération des réservations par utilisateur
        res.json({ bookings: [] });
    }
    catch (error) {
        console.error('Error retrieving user bookings:', error);
        res.status(500).json({ error: error.message || 'Failed to retrieve bookings' });
    }
});
exports.default = router;
//# sourceMappingURL=booking.routes.js.map