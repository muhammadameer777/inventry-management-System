import { Router } from 'express';
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Public: list events (optionalAuth so admin can get all statuses)
router.get('/', optionalAuth, getAllEvents);
router.get('/:id', optionalAuth, getEventById);

// Admin only
router.post('/', requireAuth, requireAdmin, createEvent);
router.put('/:id', requireAuth, requireAdmin, updateEvent);
router.delete('/:id', requireAuth, requireAdmin, deleteEvent);

export default router;
