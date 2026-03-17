import express from 'express';
import { createReview, getPackageReviews, deleteReview, getAllReviews } from '../controllers/review.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { createReviewValidation, mongoIdParam } from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

const reviewLimiter = createRateLimiter({
	windowMs: 60 * 60 * 1000,
	max: 20,
	message: { success: false, message: 'Too many review requests. Please try again later.' },
});

router.post('/', protect, reviewLimiter, createReviewValidation, createReview);
router.get('/package/:packageId', reviewLimiter, mongoIdParam('packageId'), getPackageReviews);
router.get('/admin/all', protect, adminOnly, getAllReviews);
router.delete('/:id', protect, adminOnly, mongoIdParam('id'), deleteReview);

export default router;
