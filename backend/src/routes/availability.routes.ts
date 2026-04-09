/**
 * Availability Routes - Geek Gaming Center
 * API endpoints pour les disponibilités
 */

import { Router } from 'express';
import { getBookingAvailability as getAvailability } from '../services/availability.service';

const router = Router();

/**
 * GET /api/availability - Récupérer les disponibilités pour une période
 */
router.get('/', async (req: any, res: any) => {
  try {
    const { resource_ids, resource_types, start_date, end_date, duration } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date and end_date are required',
      });
    }

    const availability = await getAvailability({
      resource_ids: resource_ids ? String(resource_ids).split(',') : undefined,
      resource_types: resource_types ? String(resource_types).split(',') : undefined,
      start_date: String(start_date),
      end_date: String(end_date),
      duration: duration ? parseInt(String(duration)) : undefined,
    });

    res.json({
      availability: availability.filter((a: any) => a !== null),
      count: availability.filter((a: any) => a !== null).length,
    });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch availability',
    });
  }
});

/**
 * GET /api/availability/resources - Lister toutes les ressources
 */
router.get('/resources', async (req: any, res: any) => {
  try {
    // TODO: Implémenter la récupération de toutes les ressources
    res.json({ resources: [] });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch resources',
    });
  }
});

export default router;
