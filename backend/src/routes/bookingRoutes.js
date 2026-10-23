import { Router } from 'express';
import {
  getAllBookings, getBookingById, createBooking, updateBooking,
  cancelBooking, checkInBooking, deleteBooking,
} from '../controllers/bookingController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.post('/:id/cancel', cancelBooking);
router.post('/:id/checkin', requireAdmin, checkInBooking);
router.delete('/:id', requireAdmin, deleteBooking);

export default router;
