import { Router } from 'express';
import { getAllUsers, getUserById, updateUserRole, deleteUser, getAdminStats } from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
