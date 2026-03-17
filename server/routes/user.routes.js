import express from 'express';
import { getAllUsers, toggleUserStatus, deleteUser } from '../controllers/user.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { mongoIdParam } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/toggle-status', protect, adminOnly, mongoIdParam('id'), toggleUserStatus);
router.delete('/:id', protect, adminOnly, mongoIdParam('id'), deleteUser);

export default router;
