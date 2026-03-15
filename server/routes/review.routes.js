import express from 'express';
import { createReview, getPackageReviews, deleteReview, getAllReviews } from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/package/:packageId', getPackageReviews);
router.get('/admin/all', protect, adminOnly, getAllReviews);
router.delete('/:id', protect, adminOnly, deleteReview);

export default router;
