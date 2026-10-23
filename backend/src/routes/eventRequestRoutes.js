import { Router } from 'express';
import {
  getAllRequests, getRequestById, createRequest,
  updateRequestStatus, approveAndCreateEvent, deleteRequest,
} from '../controllers/eventRequestController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

// Any authenticated user can submit and view their own requests
router.get('/', getAllRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.delete('/:id', deleteRequest);

// Admin actions
router.put('/:id/status', requireAdmin, updateRequestStatus);
router.post('/:id/approve', requireAdmin, approveAndCreateEvent);

export default router;
